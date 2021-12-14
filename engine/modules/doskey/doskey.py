from config.constant import APP_PROFILE_DIRECTORY_NAME, DOSKEY_FILE_NAME, AUTO_RUN_REGISTRY_NAME
from modules.registry.registry import Registry
from utility.explorer import get_user_profile_path, make_directory, make_file, directory_exist, append_to_file, find
import re


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

    def get(self):
        doskey_file = open(self.doskey_path, 'r').readlines()
        commands = []
        for line in doskey_file:
            if "doskey" in line:
                sections = line.split('=')
                alias = sections[0]
                full_command = sections[1]
                full_command_length = len(full_command)
                commands.append({
                    "alias": alias.replace('doskey ', ''),
                    "command": re.sub(r"[$T]|\n+[\s]", "", full_command),
                    "with_prefix": True if full_command.find("$T", 0, 2) >= 0 else False,
                    "with_suffix": True if full_command.find("$T", full_command_length - 3,
                                                             full_command_length) >= 0 else False
                })
        return commands

    def create(self, alias: str, command: str, options=None):
        command = self.command_builder(alias, command, options)
        if not find(self.doskey_path, command):
            return append_to_file(self.doskey_path, command)
        return False

    def update(self, alias: str, command: str, options=None):
        doskey_file = open(self.doskey_path, 'r').readlines()
        command = self.command_builder(alias, command, options)
        for index, line in enumerate(doskey_file):
            sections = line.split('=')
            if alias in sections[0].replace('doskey ', ''):
                doskey_file.pop(index)
        # with open(self.doskey_path, 'w') as file:
        #     file.writelines(doskey_file)
        #     file.close()
        self.create(alias, command, options)
        return True

    def command_builder(self, alias: str, command: str, options=None):
        if alias and command:
            return f"\ndoskey {alias}={'$T ' if options['with_prefix'] else ''}{command}{' $T ' if options['with_suffix'] else ''}"
        return False
