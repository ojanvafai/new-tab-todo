const NUM_TASKS = 20;
const TASKS_KEY = 'tasks';

function createTasks(taskContents) {
  for (let i = 0; i < NUM_TASKS; i++) {
    const task = document.createElement('input');
    if (i < taskContents.length) {
      task.value = taskContents[i];
    }
    task.addEventListener('input', handleInput);
    document.body.append(task);
  }
}

function getTasks() {
  return Array.from(document.querySelectorAll('input'));
}

function handleInput() {
  const data = getTasks().map(x => x.value).filter(x => x !== '');
  chrome.storage.sync.set({[TASKS_KEY]: data});
}

function move(moveDown) {
  const focused = document.activeElement;
  let toFocus;
  if (!focused || focused.tagName !== 'INPUT') {
    toFocus = document.querySelector('input');
  } else {
    toFocus = moveDown ? focused.nextSibling : focused.previousSibling;
    if (!toFocus) {
      return;
    }
  }
  toFocus.focus();
}

function refreshTasks() {
  chrome.storage.sync.get([TASKS_KEY], (data) => {
    document.body.textContent = '';
    createTasks(data[TASKS_KEY] || []);
  });
}

window.onload = () => {
  refreshTasks();
  document.addEventListener("visibilitychange", e => document.visibilityState === 'hidden' && refreshTasks());

  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      move(false);
    } else if (e.key === 'ArrowDown') {
      move(true);
    }
  });
}
