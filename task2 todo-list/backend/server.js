// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const DATA = path.join(__dirname, 'tasks.json');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// helper: load tasks
async function loadTasks(){
  try {
    const raw = await fs.readFile(DATA, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// helper: save tasks
async function saveTasks(tasks){
  await fs.writeFile(DATA, JSON.stringify(tasks, null, 2), 'utf8');
}

// GET /tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await loadTasks();
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: 'Could not load tasks' });
  }
});

// POST /tasks  { text: "..." }
app.post('/tasks', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Invalid text' });
  try {
    const tasks = await loadTasks();
    const newTask = { id: Date.now().toString(), text: text.trim(), createdAt: new Date().toISOString() };
    tasks.push(newTask);
    await saveTasks(tasks);
    res.status(201).json(newTask);
  } catch (e) {
    res.status(500).json({ error: 'Could not save task' });
  }
});

// PUT /tasks/:id  { text: "..."}
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    const tasks = await loadTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    if (text && typeof text === 'string') tasks[idx].text = text.trim();
    await saveTasks(tasks);
    res.json(tasks[idx]);
  } catch (e) {
    res.status(500).json({ error: 'Could not update' });
  }
});

// DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let tasks = await loadTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const removed = tasks.splice(idx, 1)[0];
    await saveTasks(tasks);
    res.json({ deleted: removed });
  } catch (e) {
    res.status(500).json({ error: 'Could not delete' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
