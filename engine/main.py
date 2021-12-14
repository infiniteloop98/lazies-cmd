import json
import sys
from modules.doskey.doskey import Doskey


def showException(title: str, message: str = ""):
    response = {"title": title, "message": f"{message if message else ''}"}
    print(json.dumps(response))


class App:
    def __init__(self):
        self.arguments = sys.argv
        action = None
        try:
            action = self.arguments[1]
        except IndexError:
            showException("Action error", "Action not found.")
        except:
            showException("Unexpected error", "Unknown error!")
        self.doskey = Doskey()
        if action in ["CREATE", "UPDATE"] and len(self.arguments) > 1:
            alias, command, options = self.getArguments()
            self.alias = alias
            self.command = command
            self.options = options

        if action == "GET":
            self.get()
            return
        elif action == "CREATE":
            self.create()
            return
        elif action == "UPDATE":
            self.update()
            return

    def get(self):
        commands = json.dumps(self.doskey.get())
        print(commands)

    def create(self):
        if self.alias and self.command and self.options:
            self.doskey.create(self.alias, self.command, self.options)
            print(json.dumps(True))
        print(json.dumps(False))

    def update(self):
        if self.alias and self.command and self.options:
            self.doskey.update(self.alias, self.command, self.options)
            print(json.dumps(True))
        print(json.dumps(False))

    def getArguments(self):
        alias = self.arguments[2]
        command = self.arguments[3]
        with_prefix = True if self.arguments[4] == 'true' else False
        with_suffix = True if self.arguments[5] == 'true' else False
        return alias, command, {
            "with_prefix": with_prefix,
            "with_suffix": with_suffix
        }


App()
