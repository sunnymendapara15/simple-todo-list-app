const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'todos.json');

app.use(cors());
app.use(express.json());

const ensureDataStore = async () => {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.promises.access(DATA_FILE);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.promises.writeFile(DATA_FILE, '[]');
    } else {
      throw error;
    }
  }
};

const readTodos = async () => {
  const raw = await fs.promises.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
};

const writeTodos = async (todos) => {
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
};

app.get('/todos', async (req, res, next) => {
  try {
    const todos = await readTodos();
    res.json(todos);
  } catch (error) {
    next(error);
  }
});

app.post('/todos', async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'A non-empty title is required.' });
    }
    const todos = await readTodos();
    const newTodo = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    todos.unshift(newTodo);
    await writeTodos(todos);
    res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
});

app.patch('/todos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid todo id.' });
    }
    const updates = req.body;
    const todos = await readTodos();
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found.' });
    }
    if (updates.title) {
      if (typeof updates.title !== 'string' || !updates.title.trim()) {
        return res.status(400).json({ error: 'Title must be a non-empty string.' });
      }
      todos[index].title = updates.title.trim();
    }
    if (typeof updates.completed === 'boolean') {
      todos[index].completed = updates.completed;
    }
    if (!('completed' in updates) && !('title' in updates)) {
      return res.status(400).json({ error: 'Provide at least one field to update.' });
    }
    await writeTodos(todos);
    res.json(todos[index]);
  } catch (error) {
    next(error);
  }
});

app.delete('/todos/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid todo id.' });
    }
    const todos = await readTodos();
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found.' });
    }
    const [removed] = todos.splice(index, 1);
    await writeTodos(todos);
    res.json(removed);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

ensureDataStore()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Todo API available on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
