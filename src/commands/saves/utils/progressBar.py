from multiprocessing import Condition, Value
from os.path import exists
import threading
from progress.bar import Bar

class ProgressBarThread(threading.Thread):
    id = None
    cond = None
    state = None
    isShutdown = False

    def __init__(self, bar:Bar, cond:Condition, state:Value):
        super(ProgressBarThread, self).__init__()
        self.cond = cond
        self.state = state
        self.bar = bar

    def shutdown(self):
        self.isShutdown = True

    def run(self):
        last = 0
        while not self.isShutdown:
            with self.cond:
                value = self.state.value
                self.bar.next(value-last)
                last = value
                #Very Ugly, but necessary to not stay blocked for a long time. I guess only one would be necesary, but i opted to ensure. forgive! :-)
                if (self.isShutdown):
                    return
                self.cond.wait()
                #Very Ugly, but necessary to not stay blocked for a long time
                if (self.isShutdown):
                    return
            