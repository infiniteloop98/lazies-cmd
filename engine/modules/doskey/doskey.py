from config.constant import APP_PROFILE_DIRECTORY_NAME, DOSKEY_FILE_NAME, AUTO_RUN_REGISTRY_NAME
from modules.registry.registry import Registry
from utility.explorer import get_user_profile_path, make_directory, make_file, directory_exist, append_to_file, find


class Doskey:
    def __init__(self):
        self.user_profile_path = get_user_profile_path()
        self.app_profile_directory = self.user_profile_path + "\{app_directory_name}\\".format(
            app_directory_name=APP_PROFILE_DIRECTORY_NAME,
        )
        self.doskey_path = self.app_profile_directory + DOSKEY_FILE_NAME

        registry = Registry()
        auto_run_registry_exist = registry.get(AUTO_RUN_REGISTRY_NAME)
        if not auto_run_registry_exist:
            registry.set(AUTO_RUN_REGISTRY_NAME, self.doskey_path)

        if not directory_exist(self.app_profile_directory):
            self.make_directory_and_doskey()
        self.suffix_keyword = '$*'

    def make_directory_and_doskey(self):
        if make_directory(self.app_profile_directory):
            make_file(self.app_profile_directory, DOSKEY_FILE_NAME, "@ECHO off")

    def get(self):
        doskey_file = open(self.doskey_path, 'r').readlines()
        commands = []
        for line in doskey_file:
            if "doskey" in line:
                sections = line.split('=', 1)
                alias = sections[0]
                full_command = sections[1]
                full_command_length = len(full_command)
                commands.append({
                    "alias": alias.replace('doskey ', ''),
                    "command": full_command.replace(self.suffix_keyword, "").strip(" "),
                    "with_suffix": True if full_command.find(self.suffix_keyword, full_command_length - 3,
                                                             full_command_length) >= 0 else False
                })
        return commands

    def create(self, command: dict):
        if "old_alias" in command: del command['old_alias']
        command = self.command_builder(**command)
        if not find(self.doskey_path, command):
            append_to_file(self.doskey_path, command)
            return True
        return False

    def update(self, command: dict):
        if self.remove(command["old_alias"]):
            self.create(command)
            return True
        return False

    def remove(self, alias: str):
        try:
            doskey_file = open(self.doskey_path, 'r').readlines()
            for index, line in enumerate(doskey_file):
                sections = line.split('=', 1)
                if alias == sections[0].replace('doskey ', ''):
                    doskey_file.pop(index)
            with open(self.doskey_path, 'w') as file:
                file.writelines(doskey_file)
                file.close()
            return True
        except:
            return False

    def command_builder(self, alias: str, command: str, with_suffix: bool):
        if alias and command:
            return f"\ndoskey {alias}={command}{f' {self.suffix_keyword}' if with_suffix else ''} ".strip(
                " ")
        return False
