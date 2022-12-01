from collections import namedtuple
import math
import os
import zlib, json, base64

def listFiles(baseDirectory) :
    files = []
    for dirpath, dirnames, filenames in os.walk(baseDirectory):
        for name in filenames:
            file = os.path.join(os.path.realpath(dirpath), name)
            files.append(file)
    return files


def filePathWalkDir(baseDirectory, listIntputDirectories) :
    files = []
    for directory in listIntputDirectories:
        if not(os.path.exists(os.path.join(baseDirectory, directory))):
            raise Exception("O seguinte diretório não existe:"+directory)
        for dirpath, dirnames, filenames in os.walk(os.path.join(baseDirectory, directory)):
            for name in filenames:
                file = os.path.join(os.path.realpath(dirpath), name)
                files.append(file)
        
    return files

# Get available memory from /proc/meminfo into Linux OS
# Return the avaliable memory in bytes    
def getMemoryAvailable():
    MemInfoEntry = namedtuple('MemInfoEntry', ['value', 'unit'])

    meminfo = {}
    with open('/proc/meminfo') as file:
        for line in file:
            key, value, *unit = line.strip().split()
            meminfo[key.rstrip(':')] = MemInfoEntry(value, unit)
    mem = int(meminfo['MemAvailable'].value)
    
    unit = meminfo['MemAvailable'].unit
    return convertToBytes(mem, unit[0])

# Convert a size to bytes
def convertToBytes(size, unit):
   if size == 0:
       return "0B"
   sizeName = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
   sizeUnit = {"B": 0, "KB":1, "MB":2, "GB":3, "TB":4, "PB":5, "EB":6, "ZB":7, "YB":8} 
   p = math.pow(1024, sizeUnit[unit.upper()])
   s = p * size
   return int(s)


def json_zip(dict):

    
    result = base64.b64encode( zlib.compress(json.dumps(dict).encode('utf-8'))).decode('ascii')
    

    return result


def json_unzip(compressedjson):

    j = zlib.decompress(base64.b64decode(compressedjson))
    dict = json.loads(j)
    
    return dict
