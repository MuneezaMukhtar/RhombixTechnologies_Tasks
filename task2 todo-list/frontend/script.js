const API = '/tasks'; // served by same server
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

async function fetchTasks(){
  const res = await fetch(API);
  if (!res.ok) { taskList.innerHTML = '<li>Error loading</li>'; return []; }
  return res.json();
}

function makeLi(task){
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = task.text;

  const controls = document.createElement('div');
  const edit = document.createElement('button');
  edit.textContent = '✏️';
  edit.onclick = () => editTask(task.id, task.text);

  const del = document.createElement('button');
  del.textContent = '🗑️';
  del.onclick = () => deleteTask(task.id);

  controls.append(edit, del);
  li.append(span, controls);
  return li;
}

async function render(){
  const tasks = await fetchTasks();
  taskList.innerHTML = '';
  tasks.forEach(t => taskList.appendChild(makeLi(t)));
}

addBtn.onclick = async () => {
  const text = taskInput.value.trim();
  if (!text) return alert('Enter a task');
  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  taskInput.value = '';
  render();
};

async function editTask(id, oldText){
  const newText = prompt('Edit task:', oldText);
  if (newText === null) return;
  await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: newText })
  });
  render();
}

async function deleteTask(id){
  if (!confirm('Delete?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  render();
}

render();
