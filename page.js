const NUM_TASKS = 20;
const TASKS_KEY = 'tasks';
const PINNED_STATUS = 'pinned';
const SAVE_DELAY_MS = 500;

let tasks;
let taskModel;
let saveTimeout;

function isPinned(task) {
  return task.status === PINNED_STATUS;
}

function render() {
  document.body.textContent = '';

  tasks = [];
  for (let i = 0; i < NUM_TASKS; i++) {
    if (!taskModel[i]) {
      taskModel[i] = {content: ''};
    }
    const task = document.createElement('input');
    task.value = taskModel[i].content;
    task.addEventListener('input', () => {
      taskModel[i].content = tasks[i].value;
      clearTimeout(saveTimeout);
      // Don't render here since we don't want to lose the current selection.
      saveTimeout = setTimeout(() => save(), SAVE_DELAY_MS);
    });
    tasks.push(task);

    const pin = document.createElement('div');
    pin.className = 'pin';
    if (isPinned(taskModel[i])) {
      pin.classList.add('active');
    }
    pin.textContent = '📌';
    pin.addEventListener('click', () => {
      taskModel[i].status = isPinned(taskModel[i]) ? '' : PINNED_STATUS;
      saveAndRender();
    });

    const row = document.createElement('div');
    row.className = 'row';
    row.append(pin, task);
    document.body.append(row);
  }
}

function saveAndRender() {
  save();
  render();
}

function save() {
  taskModel.sort((a, b) => {
    const aPinned = isPinned(a)
    const bPinned = isPinned(b);
    return aPinned && !bPinned ? -1 : !aPinned && bPinned ? 1 : 0;
  });
  chrome.storage.sync.set({[TASKS_KEY]: taskModel});
}

function move(amount) {
  const focused = document.activeElement;
  let toFocus;
  if (!focused || focused.tagName !== 'INPUT') {
    toFocus = document.querySelector('input');
  } else {
    toFocus = tasks[tasks.findIndex(x => x === focused) + amount];
    if (!toFocus) {
      return;
    }
  }
  // Not really sure why this setTimeout is needed, but otherwise the setSelectionRange call doens't work.
  setTimeout(() => {
    toFocus.setSelectionRange(0, 0);
    toFocus.focus();
  }, 0);
}

function refreshTasksFromStorage() {
  chrome.storage.sync.get([TASKS_KEY], (newData) => {
    const newTasks = newData && newData[TASKS_KEY] || [];
    if (JSON.stringify(taskModel) !== JSON.stringify(newTasks)) {
      taskModel = newTasks;
      render();
    }
  });
}

window.onload = () => {
  refreshTasksFromStorage();
  document.addEventListener("visibilitychange", e => {
    if (document.visibilityState !== 'hidden') {
      taskModel = taskModel.filter(x => x.content !== '')
      saveAndRender();
    }
  });
  chrome.storage.onChanged.addListener(() => refreshTasksFromStorage());
  document.body.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        move(e.key === 'ArrowUp' ? -1 : 1);
    }
  });
}
