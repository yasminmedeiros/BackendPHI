import logging
import os
from multiprocessing import  Value
from multiprocessing import Condition




class LogUtils():
    failLogPath = None
    successLogPath =  None
    successLog = None
    errLog = None
    mutexSuccess:Condition = None
    mutexError:Condition = None
    
    #Stats
    countIgnoredFiles = 0
    countAlreadyProcessed = 0
    totalStudent:Value = 0

    #stats counted in a multiprocessing manner
    countSuccess:Value = Value('i', 0)
    countFail:Value = Value('i', 0)

    def __init__(self, batchOutputDir, batchName):
        super(LogUtils, self).__init__()
        self.mutexSuccess = Condition()
        self.mutexError = Condition()

        self.successLogPath = os.path.join(batchOutputDir, "success" +batchName +".txt")
        self.failLogPath = os.path.join(batchOutputDir, "err" +batchName +".txt")
        logFile = os.path.join(batchOutputDir, "log" +batchName +".txt")

        logging.basicConfig(filename=logFile, filemode='a',
                    format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s',
                    datefmt='%H:%M:%S',
                    level=logging.DEBUG)

        self.successLog = open(self.successLogPath, "a", encoding="latin-1") 
        self.errorLog = open(self.failLogPath, "a", encoding="latin-1") 

    def closeLogs(self):
        self.successLog.close()
        self.errorLog.close()

    def getSuccessLogFilePath(self):
        return self.successLogPath

    def getFailLogFilePath(self):
        return self.failLogPath
        
    def logInfo(self,message):
        logging.info(message)
    
    def logError(self,message, error=None):
        if (error == None):
            logging.error(message)
        else :
            logging.exception(message, error, exc_info=True)
    
        
    #This method register a clean success file with the list of efd that ETL job finished without errors
    def logSuccess(self,message):
        with self.mutexSuccess: 
            self.countSuccess.value +=1
            self.successLog.write(message + "\n")
            self.successLog.flush()
       

    #This method register a clean fail file with the list of efd that ETL job NOT FINISHED
    def logFail(self,message):
        with self.mutexError:
            self.countFail.value+=1
            self.errorLog.write(message + "\n")
            self.errorLog.flush()
        

    def setStudentCount(self, count):
        self.totalStudent = count

    
    def logAlreadyProcessedStudent(self, fileName):
        self.countAlreadyProcessed += 1
        logging.info("ALREADY PROCESSED STUDENT:"+ fileName)


        
    def getStats(self):
        message = "TOTAL FILES STUDENTS TO PROCESS:{}\n".format(self.totalStudent)
        message += "ALREADY PROCESSED STUDENTS:{} ({:.2%})\n".format(self.countAlreadyProcessed, (self.countAlreadyProcessed/self.totalStudent))
        message += "FAILED STUDENTS EXTRACTION:{} ({:.2%})\n".format(self.countFail.value, (self.countFail.value/self.totalStudent))
        message += "SUCCESS STUDENTS EXTRACTION:{} ({:.2%})\n".format(self.countSuccess.value, (self.countSuccess.value/self.totalStudent)) 
        return message

    def logStats(self):
        logging.info(self.getStats())
        


