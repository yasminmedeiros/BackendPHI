from configparser import ConfigParser
import gc
from multiprocessing import Condition, Process, Value, Semaphore, active_children
from progress.bar import Bar
import crawlerWorker
import time
import re
import os
import argparse
import utils.ioUtils as ioUtils
from utils.logUtils import LogUtils
from utils.progressBar import ProgressBarThread



ETL = 'ETL'
ETL_DIR_TOKEN = 'ETL_DIR'
MAX_THREADS_TOKEN = 'MAX_THREADS'
DEFAULT_CONFIG_PATH = 'crawler.conf'
DEFAULT_ETL_PATH = 'output'
DEFAULT_MAX_THREADS = 4


config_object = ConfigParser()


# In case EFD already processed, ignore them in a re-run of a same batch,
def mountStudentList(inputFilePath) :
    studentList = []
    if (os.path.exists(inputFilePath)):
        with open(inputFilePath) as reader:
            
            lines = reader.readlines()
            
            for line in lines:
                if line!= None and line.strip() :
                    studentList.append(line.strip())
    else :
        print("ERROR:Input file does not exists - ",inputFilePath)
        
    return studentList


# In case student already processed, ignore them in a re-run of a same batch,
def ignoreProcessedStudents(studentList, sucessLogPath, log:LogUtils) :
    processedStudents = []
    if (os.path.exists(sucessLogPath)):
        with open(sucessLogPath) as reader:
            
            lines = reader.readlines()
            for line in lines:
                if line!= None and line.strip() :
                    studentID = line.strip()
                    processedStudents.append(studentID)
                    log.logAlreadyProcessedStudent(studentID)

        s = set(processedStudents)
        temp = [x for x in studentList if x not in s]
        
        return temp
    else:
        return studentList
    
    


#Divide this list of efd files into several batches acording to the avaliable memory and number of threads
#it is similar to the memory partition method of loaderNFE
def createETLBatches(studentList):

    
    #define max number of threads used to parallelize the etl job
    numberOfThreads = int(config_object[ETL][MAX_THREADS_TOKEN])

	# we need a total memory of disk size of efd files * 2
	# for safety we are limiting the memory to 1/4 of total memory available
    #availableMem = mem / (15 * numberOfThreads)

    quotaSize = 200

    quota = 0
    batchList = []
    batch = []
    
    for student in studentList:
        
        quota += 1
        if quota < quotaSize :
            batch.append(student)
        else :
            batchList.append(batch)
            batch = []
            quota = 1
            batch.append(student)
            

	# last fileRow
    batchList.append(batch)
    
    return batchList


def loadConfigFromFile(path):
    configPath = path
    if configPath == None:
        configPath = DEFAULT_CONFIG_PATH

    # Read config.ini file
    config_object = ConfigParser()

    if os.path.exists(configPath):
        config_object.read(configPath)
        if not ETL_DIR_TOKEN in config_object[ETL]:
            config_object[ETL][ETL_DIR_TOKEN] = DEFAULT_ETL_PATH

        if not MAX_THREADS_TOKEN in config_object[ETL]:
            config_object[ETL][MAX_THREADS_TOKEN] = DEFAULT_MAX_THREADS

    else:
        raise Exception("Config file not found.")

    return config_object




#python3 loaderEFD.py -y 2022 -b marcelo -d /shared/efd/aceitas -n 2022-02 2022-01 2022-03 2022-04

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Extract the content of EFD file to a json format.")
    parser.add_argument("-c", metavar='Config File', type=str, help="Set the file wich the script will be executed.")
    parser.add_argument("-b", metavar='Batch Name', required=True, help="Batch name will be used to generate the staging and log directory")
    parser.add_argument("-f", metavar='Input student files', type=str, required=True, help="A file containing a list of students to be processed")
    
    
    startTime = time.time()
    
    args = parser.parse_args()
    inputStudentFile = args.f
    batchName = args.b

    # config from file
    config_object = loadConfigFromFile(args.c)
    
    # output dir
    outputDir =  config_object[ETL][ETL_DIR_TOKEN]
    batchOutputDir = os.path.join(outputDir, batchName)
    if not(os.path.exists(batchOutputDir)):
        os.makedirs(batchOutputDir)        
    
    #Create log
    log:LogUtils = LogUtils(batchOutputDir, batchName)
    
    try:

        # checking for single file or files on a directory

        studentList = mountStudentList(inputStudentFile)

        if (len(studentList) == 0):
            raise Exception("Input file is empty!")
        
        log.setStudentCount(len(studentList))

        studentList = ignoreProcessedStudents(studentList, log.getSuccessLogFilePath(), log)        

        
        #divide the total set of efd files into several batches. 
        # The ideia is to assign different batches to multiple worker threads and parallelize the work
        batchList = createETLBatches(studentList)

        mutexBar = Condition()
        countBar = Value('i', 0)
        bar = Bar('Loading', max=len(studentList), suffix='%(percent)d%%  | %(index)d/%(max)d | %(elapsed_td)s')

        numberThreads = int(config_object[ETL][MAX_THREADS_TOKEN])
                     
        sem = Semaphore(numberThreads)  #Semaphore to control the number of running threads
        mutex = Semaphore(1)  #Semaphore to control concurrency on the progress bar
        cond = Condition()
        state = Value('i', 0)

        log.logInfo("Starting ETL JOB")
        log.logInfo("Batch Name:"+ batchName)
        log.logInfo("Input file:"+ inputStudentFile)
        
        log.logInfo("Total students to be processed:"+ str(len(studentList)))
        
        workerList = []
        workerID = 0

        progressaBarThread = ProgressBarThread(bar,mutexBar,countBar)
        progressaBarThread.start()
        
        for batch in batchList:
            sem.acquire()
            workerID+=1
            
            p = Process(target=crawlerWorker.parseBatch, args=(workerID, sem, batch, config_object, batchOutputDir, log, countBar, mutexBar, state, cond))
            p.start()
            state.value += 1
            
        #wait all threads to finish the job
        while True:
            with cond:
                if state.value == 0:
                    break
                else:
                    cond.wait()
        
        progressaBarThread.shutdown()
        with mutexBar:
            mutexBar.notify_all()
        progressaBarThread.join()
        bar.finish()
        bar.update()
        
    except BaseException as e:
        log.logError("Error on Loader", e)     
        
    finally:
        end = time.time()
        elapsed =  time.strftime("%H:%M:%S", time.gmtime(time.time() - startTime))
        print("Elapsed time:"+str(elapsed))
        log.logStats()
        log.logInfo("Elapsed time:"+str(elapsed))
        log.closeLogs() 
    print(log.getStats())

    active = active_children()
    for child in active:
        child.terminate()
    
    for child in active:
        child.kill()

    exit(1)
    




