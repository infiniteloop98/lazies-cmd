import json
import sys

from modules.doskey.doskey import Doskey


class App:
    def __init__(self):
        arguments = sys.argv
        action = arguments[1]
        doskey = Doskey()
        if action == "GET":
            commands = json.dumps(doskey.get())
            print(commands)
            return
        elif action == "UPDATE":
            return
        elif action == "ADD":
            alias = arguments[2]
            command = arguments[3]
            doskey.add(alias, command)
            print(json.dump(True))


App()
