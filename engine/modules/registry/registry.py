import winreg


class Registry:
    def __init__(self, registry_path: str = r"SOFTWARE\Microsoft\Command Processor"):
        self.reg_path = registry_path

    def set(self, name, value):
        try:
            winreg.CreateKey(winreg.HKEY_LOCAL_MACHINE, self.reg_path)
            registry_key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, self.reg_path, 0,
                                          winreg.KEY_SET_VALUE)
            winreg.SetValueEx(registry_key, name, 0, winreg.REG_SZ, value)
            winreg.CloseKey(registry_key)
            return True
        except WindowsError:
            return False

    def get(self, name):
        try:
            registry_key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, self.reg_path, 0,
                                          winreg.KEY_READ)
            value, regtype = winreg.QueryValueEx(registry_key, name)
            winreg.CloseKey(registry_key)
            return value
        except WindowsError:
            return False
