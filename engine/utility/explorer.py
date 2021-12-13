import os


def get_user_profile_path(suffix: str = ""):
    return os.path.expanduser(os.sep.join(["~", suffix]))


def make_directory(directory):
    if not os.path.exists(directory):
        os.mkdir(directory)
        return True
    return False


def make_file(directory: str, filename: str, initialFileContent: str = "", mode: str = 'w'):
    file = open(directory + filename, mode)
    if initialFileContent:
        file.write(initialFileContent)
    file.close()
    return True


def directory_exist(directory: str):
    return os.path.exists(directory)


def append_to_file(directory: str, content: str):
    if directory and content:
        file = open(directory, 'a')
        file.write(content)
        return True
    return False


def find(path: str, keyword: str):
    if path:
        with open(path) as file:
            if keyword in file.read():
                return True
            return False
    return False

