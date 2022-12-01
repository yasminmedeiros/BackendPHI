import argparse
from configparser import ConfigParser
import os
from random import expovariate
import psycopg2
import psycopg2.extras



DB = 'DB'
DB_NAME_TOKEN = 'DB_NAME'
DB_HOST_TOKEN = 'DB_HOST'
DB_USER_TOKEN = 'DB_USER'
DB_PASSWORD_TOKEN = 'DB_PASSWORD'

def loadConfigFromFile(path):
    configPath = path
    
    # Read config.ini file
    config_object = ConfigParser()

    if os.path.exists(configPath):
        config_object.read(configPath)        
    else:
        raise Exception("Config file not found.")

    return config_object


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


    
def createStudentList(configPath, outputFile, numberOfBatches, inicialOffset):

    configObect = loadConfigFromFile(configPath)
    connection = createDatabaseConnection(configObect)
    cur = connection.cursor()    

    studentListFilePath = outputFile

#Batch #230       1145000--1150000       Print data
#Batch #230       1145000--1150000       Printed data


    try:
        with open(studentListFilePath, "w", encoding="utf-8") as outfile: 
            limit = 5000
            offset = inicialOffset
            count = 0
            print(f"Number of batches:{numberOfBatches}")
            while (True) :
                count += 1
                endIndex = offset+limit
                print(f"Batch #{count}\t {offset}--{endIndex}")
                print(f"Batch #{count}\t {offset}--{endIndex}\tReading data")
                cur.execute(f"SELECT enrollment_id FROM enrollment_rating_reports AS EnrollmentRatingReport GROUP BY enrollment_id LIMIT {limit} OFFSET {offset}")
                studentsBatch = cur.fetchall()
                print(f"Batch #{count}\t {offset}--{endIndex}\tPrint data")
                
                if (len(studentsBatch)== 0):
                    print("Vazio")
                    break

                for studentId in studentsBatch :
                    outfile.write(str(studentId[0]) + "\n")
                    outfile.flush()

                print(f"Batch #{count}\t {offset}--{endIndex}\tPrinted data")
                offset = offset + limit  

                if count == numberOfBatches:
                    break
                
                    
             

    finally:
        connection.close()


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Script para export de matricula de alunos")
    parser.add_argument("-c", metavar='Config File', type=str, help="Arquivo de configuração")
    parser.add_argument("-f", metavar='Nome do arquivo de exportação a ser criado', type=str, required=True, help="Nome do arquivo de exportação ser criado. Pode ser student.dat")
    parser.add_argument("-n", metavar='Quantidade de lotes de 1000 alunos a serem lidos', type=int, required=True, help="Quantidade de batches de 1000 alunos a serem lidos. Caso queria exportar todos os alunos deve ser passado 0")
    parser.add_argument("-o", metavar='Offset inicial', type=int, required=False,  help="Offset inicial")
    
    
    
    args = parser.parse_args()
    exportFilePath = args.f
    numberOfBatches = args.n
    inicialOffset = args.o
    configurationFile = args.c
    print(configurationFile)

    createStudentList(configurationFile, exportFilePath, numberOfBatches, inicialOffset)
    
            



