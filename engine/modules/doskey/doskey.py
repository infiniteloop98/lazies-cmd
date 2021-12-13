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

    def make_directory_and_doskey(self):
        if make_directory(self.app_profile_directory):
            make_file(self.app_profile_directory, DOSKEY_FILE_NAME, "@ECHO off")

    def add(self, alias: str, command: str, options=None):
        if options is None:
            options = {
                "with_prefix": False,
                "with_suffix": False,
            }
        command = f"\ndoskey {alias}={'$T ' if options['with_prefix'] else ''}{command}{' $T ' if options['with_suffix'] else ''}"
        if not find(self.doskey_path, command):
            return append_to_file(self.doskey_path, command)
        return False

    def get(self):
        doskey_file = open(self.doskey_path, 'r').readlines()
        commands = []
        for line in doskey_file:
            if "doskey" in line:
                command = line.split('=')
                commands.append({
                    "alias": command[0].replace('doskey ', ''),
                    "command": command[1].replace('\n', '')
                })
        return commands

    def update(self, command: str = 'ping 8.8.8.8'):
        doskey_file = open(self.doskey_path, 'r').readlines()
        for index, line in enumerate(doskey_file):
            if command in line:
                doskey_file.pop(index)
        with open(self.doskey_path, 'w') as file:
            file.writelines(doskey_file)
            file.close()
