import json
import sys
from modules.doskey.doskey import Doskey


def showException(title: str, message: str = ""):
    response = {"title": title, "message": f"{message if message else ''}"}
    print(json.dumps(response))


class App:
    def __init__(self):
        self.arguments = sys.argv
        self.doskey = Doskey()
        try:
            action = self.arguments[1]
            if action in ["CREATE", "UPDATE", "REMOVE"] and len(self.arguments) > 1:
                self.command = self.getArguments()
            if action == "GET":
                self.get()
            elif action == "CREATE":
                self.create()
                return
            elif action == "UPDATE":
                self.update()
                return
            elif action == "REMOVE":
                self.remove()
                return
        except IndexError:
            showException("Invalid input", f"Arguments is invalid, code: 101")
        except:
            showException("Unexpected error", "Unknown error!")

    def get(self):
        commands = self.doskey.get()
        print(json.dumps(commands))

    def create(self):
        if self.command:
            create = self.doskey.create(self.command)
            if create:
                print(json.dumps(True))
                return True
            else:
                print(json.dumps({"title": "Invalid command", "message": "Command already exist."}))
                return False
        print(json.dumps(False))
        return False

    def update(self):
        if self.doskey.update(self.command):
            print(json.dumps(True))
            return True
        print(json.dumps({"title": "Invalid command", "message": "Cannot update command, try again."}))
        return False

    def remove(self):
        if self.doskey.remove(self.command["alias"]):
            print(json.dumps(True))
            return True
        print(json.dumps({"title": "Invalid command", "message": "Command not found"}))
        return False

    def getArguments(self):
        alias = self.arguments[2]
        try:
            command = self.arguments[3]
        except:
            command = None
        try:
            with_suffix = json.loads(self.arguments[4])
        except:
            with_suffix = False
        try:
            old_alias = self.arguments[5]
        except:
            old_alias = None
        return {
            "alias": alias,
            "command": command,
            "with_suffix": with_suffix,
            "old_alias": old_alias
        }


App()
