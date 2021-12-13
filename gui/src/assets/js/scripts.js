const { PythonShell } = require("python-shell"),
  path = require("path"),
  state = {
    enginePath: path.join(__dirname + `../../../engine`),
    commandList: document.querySelector("#command-list"),
    addModal: "add-command-modal",
  };

PythonShell.defaultOptions = {
  pythonOptions: ["-u"],
  scriptPath: state.enginePath,
};

window.onload = () => {
  Alpine.store("labels", {
    commands: "Commands",
    alias: "Alias",
    command: "Command",
    add: "Add",
    addCommand: "Add command",
    close: "Close",
    save: "Save",
    actions: "Actions",
    update: "Update",
    remove: "Remove",
  });
  Alpine.store("modals", {
    add: "add-command-modal",
  });
};

async function getCommands() {
  const { commandList } = state;
  const commands = await executePythonScript("main.py", {
    args: ["GET"],
  });
  commandList.querySelector("#spinner").classList.add("d-none");
  return commands;
}

function getEngineFilesPath(filename) {
  return `${enginePath}/${filename}`;
}

async function updateCommand(command) {
  const update = await executePythonScript("main.py", {
    args: ["UPDATE"],
  });
}

async function addCommand(e) {
  const { alias, command } = buildFormData(e);
  await executePythonScript("main.py", {
    args: ["ADD", alias, command],
  });
  hideModal(state.addModal);
}

function buildFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function executePythonScript(fileName, extendedOptions = {}) {
  let options = {
    mode: "json",
    ...extendedOptions,
  };
  const result = await new Promise((resolve, reject) => {
    const execute = new PythonShell(fileName, options);
    execute.on("message", (result) => {
      return resolve(result);
    });
  });
  return result;
}

function showModal(modal) {
  return new bootstrap.Modal(modal).show();
}

function hideModal(modalId) {
  document.querySelector(`#${modalId} .modal-header button.btn-close`).click();
}
