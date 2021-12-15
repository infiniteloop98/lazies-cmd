const { PythonShell } = require("python-shell"),
  path = require("path"),
  state = {
    enginePath: path.join(__dirname + `../../../engine`),
    commandList: document.querySelector("#command-list"),
    addModal: "add-command-modal",
    pythonRootScript: "main.py",
    toastContainer: document.querySelector(".toast-container"),
  };

PythonShell.defaultOptions = {
  pythonOptions: ["-u"],
  scriptPath: state.enginePath,
};

window.onload = () => {
  handleSwitch();
};

//CRUD functions

/**
 * Get list of commands
 * @returns {Array}
 */
async function getCommands() {
  const { commandList } = state,
    commands = await executePythonScript(state.pythonRootScript, {
      args: ["GET"],
    })
      .then((result) => {
        commandList.querySelector("#spinner").classList.add("d-none");
        return result.reverse();
      })
      .catch(onError);
  return commands;

  function onError(error) {
    showToast({ title: "Error", message: error }, "error");
  }
}

/**
 * Add new command
 * @param {Node} e
 */
async function createCommand(e) {
  const {
      alias,
      command,
      withPrefix = false,
      withSuffix = false,
    } = buildFormData(e),
    aliasInput = document.getElementById("alias"),
    commandInput = document.getElementById("command"),
    withPrefixCheckbox = document.getElementById("with-prefix"),
    withSuffixCheckbox = document.getElementById("with-suffix");
  if (alias === "") {
    aliasInput.focus();
    showToast({ title: "Error", message: "Alias is required." }, "error");
    return false;
  }
  if (command === "") {
    commandInput.focus();
    showToast({ title: "Error", message: "Command is required." }, "error");
    return false;
  }
  await executePythonScript(state.pythonRootScript, {
    args: ["CREATE", alias, command, withPrefix, withSuffix],
  }).then((result) => {
    result.title ? onError(result) : onAdd(result);
  });

  function onError({ title, message }) {
    showToast({ title, message }, "error");
  }

  function onAdd() {
    aliasInput.value = null;
    commandInput.value = null;
    withPrefixCheckbox.checked = false;
    withSuffixCheckbox.checked = false;
    dispatch("command-added");
  }
  return true;
}

/**
 * Update command
 * @param {String} command
 */
async function updateCommand(e) {
  const { alias, command } = buildFormData(e),
    aliasInput = document.getElementById("edit-alias"),
    commandInput = document.getElementById("edit-command"),
    withPrefix = document.getElementById("edit-with-prefix"),
    withSuffix = document.getElementById("edit-with-suffix");
  if (alias === "") {
    aliasInput.focus();
    showToast({ title: "Error", message: "Alias is required." }, "error");
    return false;
  }
  if (command === "") {
    commandInput.focus();
    showToast({ title: "Error", message: "Command is required." }, "error");
    return false;
  }

  await executePythonScript(state.pythonRootScript, {
    args: [
      "UPDATE",
      alias,
      command,
      Boolean(withPrefix.checked),
      Boolean(withSuffix.checked),
    ],
  }).then((result) => {
    result.title ? onError() : onUpdate();
  });

  function onError({ title, message }) {
    showToast({ title, message }, "error");
  }

  function onUpdate() {
    dispatch("command-updated");
  }
  return true;
}

async function removeCommand(alias) {
  if (window.confirm("Are your sure?")) {
    await executePythonScript(state.pythonRootScript, {
      args: ["REMOVE", alias],
    }).then((result) => {
      result.title ? onError() : onUpdate();
    });

    function onError({ title, message }) {
      showToast({ title, message }, "error");
    }

    function onUpdate() {
      dispatch("command-removed");
    }
    return true;
  }
  return false;
}

// End of CURD functions

// Helper functions

function handleSwitch() {
  const switchs = document.querySelectorAll(
    'input[type="checkbox"].form-check-input'
  );
  switchs.forEach((item) => {
    item.addEventListener("change", ({ target }) => {
      const { checked } = target;
      if (checked) target.value = true;
      else target.value = false;
    });
  });
}

/**
 *
 * @param {String} event
 * @param {Node} element
 * @param {Object} options
 * @returns
 */
function dispatch(event, element = document.body, options = {}) {
  return element.dispatchEvent(new CustomEvent(event, options));
}

/**
 * Get form node and return form data object
 * @param {Node} form
 * @returns
 */
function buildFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

/**
 * Python script executer
 * @param {String} fileName
 * @param {Object} extendedOptions
 * @returns
 */
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

/**
 * Show bootstrap modal
 * @param {Node} modal
 * @returns
 */
function showModal(modalId) {
  return new bootstrap.Modal(document.getElementById(modalId)).show();
}

/**
 * Hide bootstrap modal
 * @param {String} modalId
 */
function hideModal(modalId) {
  document.querySelector(`#${modalId} .modal-header button.btn-close`).click();
}

function showToast(
  content,
  type = "success",
  delay = 5000,
  placement = "bottom-right"
) {
  const { toastContainer } = state;
  removeClass(
    toastContainer,
    "top-0 end-0 top-0 end-0 bottom-0 end-0 bottom-0 start-0"
  );
  let toastClassList = "toast text-white",
    toastContainerClassList = "p-5",
    options = {
      delay,
    };
  switch (type) {
    case "error":
      toastClassList += " bg-danger";
      break;
    case "info":
      toastClassList += " bg-info";
      break;
    case "warning":
      toastClassList += " bg-warning";
      break;
    default:
      toastClassList += " bg-success";
      break;
  }
  switch (placement) {
    case "top-right":
      toastContainerClassList += " top-0 end-0";
      break;
    case "top-left":
      toastContainerClassList += " top-0 end-0";
      break;
    case "bottom-left":
      toastContainerClassList += " bottom-0 end-0";
      break;
    default:
      toastContainerClassList += " bottom-0 start-0";
      break;
  }
  addClass(toastContainer, toastContainerClassList);
  if (Array.isArray(content)) {
    content.map((item) => {
      const toast = document.createElement("div");
      initialToast(toast, toastClassList);
      const { title, message } = item;
      toast.innerHTML = buildToastTemplate(title, message);
      toastContainer.appendChild(toast);
      return new bootstrap.Toast(toast, options).show();
    });
    return;
  }
  const toast = document.createElement("div");
  initialToast(toast, toastClassList);
  const { title, message } = content;
  toast.innerHTML = buildToastTemplate(title, message);
  toastContainer.appendChild(toast);
  onHideToast();
  return new bootstrap.Toast(toast, options).show();
}

function onHideToast() {
  const toasts = document.querySelectorAll(".toast");
  toasts.forEach((toast) => {
    toast.addEventListener("hidden.bs.toast", function () {
      toast.remove();
    });
  });
}

const initialToast = (toast, toastClassList = "toast") => {
  toast.className += toastClassList;
  setMultipleAttribute(toast, {
    role: "alert",
    "aria-live": "assertive",
    "aria-atomic": true,
  });
};

const buildToastTemplate = (title, body) => {
  return `<div class="toast-header">
    <strong class="me-auto toast-title">${title}</strong>
    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>'
    </div>
    <div class="toast-body">${body}</div>`;
};

function setMultipleAttribute(element, attributes) {
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key))
      element.setAttribute(key, attributes[key]);
  }
}

function addClass(element, classes) {
  if (containMultipleClass(classes)) {
    const classListArray = classes.split(" ");
    classListArray.forEach((item) => {
      !hasClass(element, item) && element.classList.add(item);
    });
    return true;
  }
  if (!hasClass(element, classes)) {
    element.classList.add(classes);
    return;
  }
}

function removeClass(element, classes) {
  if (containMultipleClass(classes)) {
    const classListArray = classes.split(" ");
    classListArray.forEach((item) => {
      hasClass(element, item) && element.classList.remove(item);
    });
    return true;
  }
  hasClass(element, classes) && element.classList.remove(classes);
  return true;
}

function containMultipleClass(string) {
  return string.indexOf(" ");
}

function hasClass(element, className) {
  return element.classList.contains(className);
}
