const { PythonShell } = require("python-shell"),
  path = require("path"),
  state = {
    enginePath: path.join(__dirname + `../../../engine`),
    commandList: document.querySelector("#command-list"),
    pythonRootScript: "main.py",
    toastContainer: document.querySelector(".toast-container"),
  };

PythonShell.defaultOptions = {
  pythonOptions: ["-u"],
  scriptPath: state.enginePath,
};

window.onload = () => {
  handleSwitch();
  handleInitialTheme();
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
  const { alias, command, withSuffix = false } = buildFormData(e),
    aliasInput = document.getElementById("alias"),
    commandInput = document.getElementById("command"),
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
    args: ["CREATE", alias, command, withSuffix],
  }).then((result) => {
    result.title ? onError(result) : onAdd(result);
  });

  function onError({ title, message }) {
    showToast({ title, message }, "error");
  }

  function onAdd() {
    aliasInput.value = null;
    commandInput.value = null;
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
  const { alias, command, oldAlias } = buildFormData(e),
    aliasInput = document.getElementById("edit-alias"),
    commandInput = document.getElementById("edit-command"),
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
    args: ["UPDATE", alias, command, Boolean(withSuffix.checked), oldAlias],
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

/**
 * Remove command
 * @param {String} alias 
 * @returns {Boolean}
 */
function removeCommand(alias) {
  showConfirmDialog("Warning!", "Are you sure?", onRemove);

  async function onRemove() {
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

/**
 * Handle switches value
 */
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

/**
 * Show toast
 * @param {Object} content
 * @param {String} type
 * @param {BigInteger} delay
 * @param {String} placement
 * @returns
 */
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

/**
 *
 * @param {Node} element
 * @param {Object} attributes
 */
function setMultipleAttribute(element, attributes) {
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key))
      element.setAttribute(key, attributes[key]);
  }
}

/**
 *
 * @param {Node} element
 * @param {String} classes
 * @returns {Boolean}
 */
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

/**
 *
 * @param {Node} element
 * @param {String} classes
 * @returns {Boolean}
 */
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

/**
 *
 * @param {String} classes
 * @returns {Number}
 */
function containMultipleClass(classes) {
  return classes.indexOf(" ");
}

/**
 *
 * @param {Node} element
 * @param {String} className
 * @returns {Boolean}
 */
function hasClass(element, className) {
  return element.classList.contains(className);
}

/**
 *
 * @param {String} title
 * @param {String} text
 * @param {Function} callback
 * @param {String} icon
 * @param {Boolean|Array} buttons
 * @param {Boolean} dangerMode
 * @returns {Object}
 */
function showConfirmDialog(
  title,
  text,
  callback,
  icon = "warning",
  buttons = true,
  dangerMode = true
) {
  return swal({
    title: title,
    text: text,
    icon: icon,
    buttons: buttons,
    dangerMode: dangerMode,
  }).then((willDelete) => {
    if (willDelete) {
      callback();
    }
  });
}

/**
 *
 * @param {Node} param0
 */
function handleTheme({ target }) {
  if (target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    document.querySelector('label[for="theme-switcher"]').innerText =
      "Dark mode";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    document.querySelector('label[for="theme-switcher"]').innerText =
      "Light mode";
  }
}

/**
 *
 * @returns {Boolean}
 */
function handleInitialTheme() {
  const currentTheme = localStorage.getItem("theme"),
    themeSwitcher = document.getElementById("theme-switcher");
  if (currentTheme === "dark") {
    themeSwitcher.checked = true;
    document.querySelector('label[for="theme-switcher"]').innerText =
      "Dark mode";
    document.documentElement.setAttribute("data-theme", "dark");
    return true;
  } else {
    themeSwitcher.checked = false;
    document.querySelector('label[for="theme-switcher"]').innerText =
      "Light mode";
    document.documentElement.setAttribute("data-theme", "light");
    return true;
  }
}
