import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

const quests = [
  {
    id: '1',
    title: 'Estudiar 30 minutos',
    type: 'habit',
    xp: 20,
    streak: 2,
    completed: true,
    color: 'green',
    description: 'Repite vocabulario y repasa conceptos clave.',
  },
  {
    id: '2',
    title: 'Hacer ejercicio',
    type: 'task',
    xp: 25,
    streak: 1,
    completed: false,
    color: 'orange',
    description: '10 minutos de movilidad o cardio.',
  },
  {
    id: '3',
    title: 'Leer 10 páginas',
    type: 'challenge',
    xp: 35,
    streak: 3,
    completed: false,
    color: 'purple',
    description: 'Sigue la lectura de tu libro actual.',
  },
];

const player = {
  name: 'Mati',
  level: 5,
  xp: 210,
  gems: 18,
  streak: 7,
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'QuestBoard API is running' });
});

app.get('/api/player', (_req, res) => {
  res.json(player);
});

app.get('/api/quests', (_req, res) => {
  res.json(quests);
});

app.post('/api/quests', (req, res) => {
  const { title, type = 'task', description = '', xp = 10, color = 'green' } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newQuest = {
    id: crypto.randomUUID(),
    title: title.trim(),
    type,
    description,
    xp,
    streak: 0,
    completed: false,
    color,
  };

  quests.unshift(newQuest);
  return res.status(201).json(newQuest);
});

app.put('/api/quests/:id', (req, res) => {
  const { id } = req.params;
  const questIndex = quests.findIndex((quest) => quest.id === id);

  if (questIndex === -1) {
    return res.status(404).json({ message: 'Quest not found' });
  }

  quests[questIndex] = {
    ...quests[questIndex],
    ...req.body,
  };

  return res.json(quests[questIndex]);
});

app.delete('/api/quests/:id', (req, res) => {
  const { id } = req.params;
  const index = quests.findIndex((quest) => quest.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Quest not found' });
  }

  const [removedQuest] = quests.splice(index, 1);
  return res.json({ message: 'Quest deleted', quest: removedQuest });
});

const connectMongo = async () => {
  if (!process.env.MONGO_URI) {
    console.log('No MONGO_URI detected. Using in-memory data store for local demo.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

connectMongo();

app.listen(PORT, () => {
  console.log(`QuestBoard API running on http://localhost:${PORT}`);
});
