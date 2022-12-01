import os
import json

arqsp1 = [f"./part1/{name}" for name in os.listdir("./part1")]
arqsp2 = [f"./part2/{name}" for name in os.listdir("./part2")]

caminhos = []
for lista in [arqsp1, arqsp2]:
    for caminho in lista:
        if caminho.lower().endswith(".json"):
            caminhos.append(caminho)
#print(caminhos)
erros = 0
e_i_b = {}
e_i_c_b_p = {}
e_i_c_p = {}

e_f_1 = {}
e_f_2 = {}
e_f_3 = {}
e_f_4 = {}
e_f_5 = {}
e_f_6 = {}
e_f_7 = {}
e_f_8 = {}
e_f_9 = {}

e_m_1 = {}
e_m_2 = {}
e_m_3 = {}

eja_1 = {}
eja_2 = {}
eja_3 = {}
eja_4 = {}
eja_5 = {}
eja_6 = {}
students_e_i = []
students_e_f = []
students_e_m = []
students_eja = []

def getSameStudents (lista):
    dic = {}
    for z in e_m_3.keys():
        dic[z]=0
        for x in lista:
            if(x["year"]==z):
                for y in students_eja:
                    if x["student_id"]==y["student_id"] and int(x["year"]-1)==int(y["year"]):
                        dic[z]+=1
    return dic
for caminho in caminhos:
    try:
        with open(caminho, "r", encoding="utf8") as file:
            data_json = file.read()

        data_dict = json.loads(data_json)
        for student in data_dict:
            if(student["shift_id"]==3 and student['year'] not in e_i_b.keys()):
                e_i_b[(student['year'])] = 0
                e_i_c_b_p[(student['year'])] = 0
                e_i_c_p[(student['year'])] = 0
                e_f_1[(student['year'])] = 0
                e_f_2[(student['year'])] = 0
                e_f_3[(student['year'])] = 0
                e_f_4[(student['year'])] = 0
                e_f_5[(student['year'])] = 0
                e_f_6[(student['year'])] = 0
                e_f_7[(student['year'])] = 0
                e_f_8[(student['year'])] = 0
                e_f_9[(student['year'])] = 0
                e_m_1[(student['year'])] = 0
                e_m_2[(student['year'])] = 0
                e_m_3[(student['year'])] = 0
                eja_1[(student['year'])] = 0
                eja_2[(student['year'])] = 0
                eja_3[(student['year'])] = 0
                eja_4[(student['year'])] = 0
                eja_5[(student['year'])] = 0
                eja_6[(student['year'])] = 0
        for student in data_dict:
            grade_id = student['grade_id']
            year = student['year']
            shift_id = student["shift_id"]
            student_id = student["student_id"]
            #Contagens em turmas especificas:
            if (shift_id == 3):
                if grade_id ==1:
                    e_i_b[(student['year'])] += 1
                    students_e_i.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==2:
                    e_i_c_b_p[(student['year'])]+=1
                    students_e_i.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==3:
                    e_i_c_p[(student['year'])]+=1
                    students_e_i.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==4:
                    e_f_1[(student['year'])]+=1
                    students_e_f.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==5:
                    e_f_2[(student['year'])]+=1
                    students_e_f.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==6:
                    e_f_3[(student['year'])]+=1
                    students_e_f.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==7:
                    e_f_4[(student['year'])]+=1
                    students_e_f.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==8:
                    e_f_5[(student['year'])]+=1
                    students_e_f.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==9:
                    e_f_6[(student['year'])]+=1
                    students_e_f.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==10:
                    e_f_7[(student['year'])]+=1
                    students_e_f.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==11:
                    e_f_8[(student['year'])]+=1
                    students_e_f.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==12:
                    e_f_9[(student['year'])]+=1
                    students_e_f.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==14:
                    e_m_1[(student['year'])]+=1
                    students_e_m.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==15:
                    e_m_2[(student['year'])]+=1
                    students_e_m.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==16:
                    e_m_3[(student['year'])]+=1
                    students_e_m.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==34:
                    eja_1[(student['year'])]+=1
                    students_eja.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==35:
                    eja_2[(student['year'])]+=1
                    students_eja.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==36:
                    eja_3[(student['year'])]+=1
                    students_eja.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==37:
                    eja_4[(student['year'])]+=1
                    students_eja.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==38:
                    eja_5[(student['year'])]+=1
                    students_eja.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
                elif grade_id ==39:
                    eja_6[(student['year'])]+=1
                    students_eja.append({"id":student["enrollment_id"],"grade_id":grade_id,"year":student["year"],"student_id":student["student_id"]})
        
    except Exception as e:
        print(f"Caminho: {caminho} || Erro: {e}")
        erros += 1
        file.close()
        continue

    file.close()
def getStudentsByLevel (identificador):
    dic = {}
    if(identificador==1):
        for x in e_i_b.keys():
            dic[x] = e_i_b[x] +e_i_c_b_p[x] + e_i_c_p[x]
    elif(identificador==2):
        for x in e_f_1.keys():
            dic[x] = e_f_1[x]+e_f_2[x]+e_f_3[x]+e_f_4[x]+e_f_5[x]+e_f_6[x]+e_f_7[x]+e_f_8[x]+e_f_9[x]
    elif(identificador==3):
        for x in eja_1.keys():
            dic[x] = eja_1[x]+eja_2[x]+eja_3[x]+eja_4[x]+eja_5[x]+eja_6[x]
    elif(identificador==4):
        for x in e_m_1.keys():
            dic[x] = e_m_1[x]+e_m_2[x]+e_m_3[x]
    return dic

with open("infantil.json", "w") as outfile:
    json.dump({
        "bebes":e_i_b,
       "criancas_bem_pequenas":e_i_c_b_p,
       "criancas_pequenas":e_i_c_p
    }, outfile)
with open("students.json", "w") as outfile:
    json.dump({
        "infantil":getStudentsByLevel(1),
       "fundamental":getStudentsByLevel(2),
       "eja":getStudentsByLevel(3),
       "medio":getStudentsByLevel(4)
    }, outfile)
with open("fudamental.json", "w") as outfile:
    json.dump({
        "alunos_1_ano":e_f_1,
       "alunos_2_ano":e_f_2,
       "alunos_3_ano":e_f_3,
       "alunos_4_ano":e_f_4,
       "alunos_5_ano":e_f_5,
       "alunos_6_ano":e_f_6,
       "alunos_7_ano":e_f_7,
       "alunos_8_ano":e_f_8,
       "alunos_9_ano":e_f_9
    }, outfile)
with open("medio.json", "w") as outfile:
    json.dump({
        "alunos_medio_1_ano":e_m_1,
       "alunos_medio_2_ano":e_m_2,
       "alunos_medio_3_ano":e_m_3
    }, outfile)
with open("eja.json", "w") as outfile:
    json.dump({
        "alunos_eja_1_ciclo":eja_1,
        "alunos_eja_2_ciclo":eja_2,
        "alunos_eja_3_ciclo":eja_3,
        "alunos_eja_4_ciclo":eja_4,
        "alunos_eja_5_ciclo":eja_5,
        "alunos_eja_6_ciclo":eja_6

    }, outfile)
with open("eja_ex.json", "w") as outfile:
    json.dump({
        "alunos_eja_f":getSameStudents(students_e_f),
        "alunos_eja_i":getSameStudents(students_e_i),
        "alunos_eja_em":getSameStudents(students_e_m)
    }, outfile)
