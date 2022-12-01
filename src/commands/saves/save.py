import psycopg2 as pg
import json
import os
from dotenv import load_dotenv
try:
    load_dotenv()
except Exception as e:
    print(e)
    print("Problem in enviroments variables!")

user=os.getenv("user")
password=os.getenv("password")
database=os.getenv("database")
host=os.getenv("host")
port=os.getenv("port")

def execute(indiceInicial, intervalo):
    #Tentando conexão com o banco: 
    try:
        conn  = pg.connect(dbname=database, user=user, password=password, host=host, port=port)
        print("Connected!")
        #setando cursor:
        cur = conn.cursor()
    except Exception as e:
        print(e)
        print("Unable to connect!")

    #tentando executar uma solicitação:
    try:
        #pegando os ids dos estudantes:
        students = []
        cur.execute(f"SELECT enrollment_id FROM enrollment_rating_reports AS EnrollmentRatingReport GROUP BY enrollment_id LIMIT {intervalo} OFFSET {indiceInicial}")
        enroll_ids = cur.fetchall()
        print(enroll_ids)
        print("\n-------------------------------------------------------------------\n")
        for enroll_id in enroll_ids:
            #declarando um dicionario com as infos do aluno:
            student = {}
            #matrícula:
            student["enrollment_id"] = enroll_id[0]
            #pegando nota final, resultado final e id do curso:
            cur.execute(f"SELECT final_rating, final_result, course_id FROM enrollment_rating_reports AS EnrollmentRatingReport WHERE EnrollmentRatingReport.enrollment_id ={enroll_id[0]}")
            res_courses_id = cur.fetchall()
            print(res_courses_id)
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
                print(course)

            student["courses"] = courses
            #Pegando school_class_id, id, student_id do estudante:
            cur.execute(f"SELECT school_class_id, student_id, school_id,shift_id,year, administration_type,school.name as school,grade_id,grade.name as grade FROM 	enrollments AS Enrollment join school_classes AS SchoolClasS on  SchoolClass.id = school_class_id 	join schools AS School on School.id = school_id join curriculum_matrix_grades AS CurriculumMatrixGrade on CurriculumMatrixGrade.id = SchoolClasS.curriculum_matrix_grade_id  	join grades as Grade on  Grade.id = CurriculumMatrixGrade.grade_id where Enrollment.id = {enroll_id[0]} AND Enrollment.school_class_id IS NOT null  and CurriculumMatrixGrade.grade_id IS NOT NULL	AND SchoolClass.school_id IS NOT NULL AND SchoolClass.curriculum_matrix_grade_id IS NOT NULL")
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
            print(class_id)
            
           
            print("\n-------------------------------------------------------------------\n")
            students.append(student)
        print(students)

        #Salvando students em json:
        try:
            json_object = json.dumps(students, indent = 4) 
            with open("students.json", "w", encoding="utf8") as outfile: 
                outfile.write(json_object)
        except Exception as e:
            print(e)
            pass

    except Exception as e:
        print(e)
        print("Unable to be executed!")

    #tentando fechar a conexão com o banco 
    try:
        conn.close()
        print("Connection Closed!")
    except Exception as e:
        print(e)
        print("Problem in closing connection!")

execute(15,10)
