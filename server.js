import express from 'express';
import { randomUUID } from 'node:crypto';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

let tasks = [
  {
    id: '1',
    title: 'დავალების პირველი მისია',
    category: 'სწავლა',
    points: 20,
    completed: false,
  },
  {
    id: '2',
    title: 'მეორე მისია',
    category: 'პრაქტიკა',
    points: 35,
    completed: true,
  },
];

app.get('/', (req, res) => {
  res.json({ message: 'მისიების API მუშაობს' });
});
app.get('/api/tasks', (req, res) => {
  const { completed, category } = req.query;

  if (completed !== undefined && completed !== 'true' && completed !== 'false') {
    return res.status(400).json({ error: 'completed უნდა იყოს true ან false' });
  }

  let filteredTasks = tasks;

  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    filteredTasks = filteredTasks.filter((task) => task.completed === isCompleted);
  }

  if (category !== undefined) {
    filteredTasks = filteredTasks.filter((task) => task.category === category);
  }

  res.status(200).json(filteredTasks);
});

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'მისია ვერ მოიძებნა' });
  }

  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const { title, category, points } = req.body;

  if (
    typeof title !== 'string' ||
    title.trim().length === 0 ||
    typeof category !== 'string' ||
    category.trim().length === 0 ||
    !Number.isInteger(points) ||
    points < 1 ||
    points > 100
  ) {
    return res.status(400).json({
      error: 'არასწორი მონაცემები: title და category აუცილებელია, points კი 1-დან 100-მდე მთელი რიცხვი',
    });
  }

  const newTask = {
    id: randomUUID(),
    title: title.trim(),
    category: category.trim(),
    points,
    completed: false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'მისია ვერ მოიძებნა' });
  }

  const { title, category, points, completed } = req.body;

  if (
    typeof title !== 'string' ||
    title.trim().length === 0 ||
    typeof category !== 'string' ||
    category.trim().length === 0 ||
    !Number.isInteger(points) ||
    points < 1 ||
    points > 100 ||
    typeof completed !== 'boolean'
  ) {
    return res.status(400).json({
      error: 'არასწორი მონაცემები განახლებისთვის',
    });
  }

  task.title = title.trim();
  task.category = category.trim();
  task.points = points;
  task.completed = completed;

  res.status(200).json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'მისია ვერ მოიძებნა' });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

app.get('/api/stats', (req, res) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const availablePoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const earnedPoints = tasks
    .filter((task) => task.completed)
    .reduce((sum, task) => sum + task.points, 0);

  res.status(200).json({
    totalTasks,
    completedTasks,
    availablePoints,
    earnedPoints,
  });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});