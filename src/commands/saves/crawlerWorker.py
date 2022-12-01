from configparser import ConfigParser
from multiprocessing import Condition, Semaphore, Value
import multiprocessing
import logging
import json
import os
import psycopg2
import psycopg2.extras
import gc
import utils.ioUtils as ioUtils 
from utils.logUtils import LogUtils

DB = 'DB'
DB_NAME_TOKEN = 'DB_NAME'
DB_HOST_TOKEN = 'DB_HOST'
DB_USER_TOKEN = 'DB_USER'
DB_PASSWORD_TOKEN = 'DB_PASSWORD'


def createDatabaseConnection(configObject):
    
    h = configObject[DB][DB_HOST_TOKEN]
    n = configObject[DB][DB_NAME_TOKEN]
    u = configObject[DB][DB_USER_TOKEN]
    p = configObject[DB][DB_PASSWORD_TOKEN]
            
    db = psycopg2.connect(host=h, database=n, user=u, password=p)

    return db


def incrementProgress(countBar, mutexBar):
    with mutexBar:
        countBar.value += 1
        mutexBar.notify_all()


    
def parseBatch( id, countedSemaphore:multiprocessing.Semaphore, batch, configObject:ConfigParser, outputDir, log:LogUtils, countBar:Value, mutexBar:Condition , state:Value, cond:Condition):
    pid = os.getpid()
    log.logInfo(f"Worker {id} created:" + str(pid))
    
    log.logInfo(f"Worker " + str(id) + " running.")
    connection = createDatabaseConnection(configObject)
    cur = connection.cursor()

    studentLogFilePath = outputDir+ "/student"+ str(pid) + ".json" 

    try:
        students = []
        with open(studentLogFilePath, "w", encoding="utf-8") as outfile: 
            
            #gambiarra para imprimir corretamente o json.
            flag = False
            outfile.write("[\n")
            
            for studentID in batch:
                
                if (flag):
                    outfile.write(",\n")
                
                #declarando um dicionario com as infos do aluno:
                student = {}
                
                #matrícula:
                student["enrollment_id"] = studentID
                
                cur.execute(f"SELECT final_rating, final_result, course_id FROM enrollment_rating_reports AS EnrollmentRatingReport WHERE EnrollmentRatingReport.enrollment_id ={studentID}")
                res_courses_id = cur.fetchall()
                
                #lista de cursos:
                courses = []
                
                for course_id in res_courses_id:
                    course = {}
                    #pegando o nome da matéria:
                    cur.execute(f"SELECT name FROM courses AS Course WHERE Course.id = {course_id[2]}")
                    course_name = cur.fetchall()
                    course['name'] = course_name[0][0]
                    course['final_rating'] = course_id[0]
                    course['final_result'] = course_id[1]
                    course['course_id'] = course_id[2]
                    courses.append(course)
                    

                student["courses"] = courses
                #Pegando school_class_id, id, student_id do estudante:
                cur.execute(f"SELECT school_class_id, student_id, school_id,shift_id,year, administration_type,school.name as school,grade_id,grade.name as grade FROM 	enrollments AS Enrollment join school_classes AS SchoolClasS on  SchoolClass.id = school_class_id 	join schools AS School on School.id = school_id join curriculum_matrix_grades AS CurriculumMatrixGrade on CurriculumMatrixGrade.id = SchoolClasS.curriculum_matrix_grade_id  	join grades as Grade on  Grade.id = CurriculumMatrixGrade.grade_id where Enrollment.id = {studentID} AND Enrollment.school_class_id IS NOT null  and CurriculumMatrixGrade.grade_id IS NOT NULL	AND SchoolClass.school_id IS NOT NULL AND SchoolClass.curriculum_matrix_grade_id IS NOT NULL")
                class_id = cur.fetchall()
                student["school_class_id"] = class_id[0][0]
                student["student_id"] = class_id[0][1]
                student["school_id"] = class_id[0][2]
                student["shift_id"] = class_id[0][3]
                student["year"] = class_id[0][4]
                student["school"] = class_id[0][6]
                student["administration_type"] = class_id[0][5]
                student["grade_id"] = class_id[0][7]
                student["grade"] = class_id[0][8]
                students.append(student)        
                #Salvando students em json:
                try:
                    json_object = json.dumps(student, indent = 4, ensure_ascii=False)
                    outfile.write(json_object)
                    outfile.flush()
                    flag = True
                
                except Exception as e:
                    log.logError("Error on Loader", e)     
                    raise e
                    
                gc.collect()
                log.logSuccess(studentID)
                incrementProgress(countBar, mutexBar)                
            
            #gambiarra para imprimir corretamente o arquivo
            outfile.write("\n]")        

        #studentLogFilePath = outputDir+ "/student.json" 
        #with open(studentLogFilePath, "w", encoding="utf-8") as outfile: 
        #    json_object = json.dumps(students, indent = 4, ensure_ascii=False)
        #    outfile.write(json_object)
        #    outfile.flush()

    finally:
        connection.close()
        log.logInfo(f"Worker {id} finishing.")
        countedSemaphore.release()
        with cond:
            state.value -= 1
            cond.notify_all()
        log.logInfo(f"Worker {id} finished.")
    exit(1)
        



