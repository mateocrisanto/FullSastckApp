import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';
const ALLOWED_ORIGINS = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.VERCEL_URL,
  process.env.RENDER_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());

const questSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['habit', 'task', 'challenge'], default: 'habit' },
    xp: { type: Number, default: 10 },
    streak: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    color: {
      type: String,
      enum: ['green', 'orange', 'purple', 'blue'],
      default: 'green',
    },
  },
  { timestamps: true },
);

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Mati' },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Quest = mongoose.models.Quest || mongoose.model('Quest', questSchema);
const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);

const fallbackPlayer = {
  name: 'Mati',
  level: 5,
  xp: 210,
  gems: 18,
  streak: 7,
};

const fallbackQuests = [
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

let useMemoryFallback = false;

const seedData = async () => {
  try {
    const questCount = await Quest.countDocuments();
    if (questCount === 0) {
      await Quest.insertMany([
        {
          title: 'Estudiar 30 minutos',
          type: 'habit',
          xp: 20,
          streak: 2,
          completed: true,
          color: 'green',
          description: 'Repite vocabulario y repasa conceptos clave.',
        },
        {
          title: 'Hacer ejercicio',
          type: 'task',
          xp: 25,
          streak: 1,
          completed: false,
          color: 'orange',
          description: '10 minutos de movilidad o cardio.',
        },
        {
          title: 'Leer 10 páginas',
          type: 'challenge',
          xp: 35,
          streak: 3,
          completed: false,
          color: 'purple',
          description: 'Sigue la lectura de tu libro actual.',
        },
      ]);
    }

    const playerCount = await Player.countDocuments();
    if (playerCount === 0) {
      await Player.create({
        name: 'Mati',
        level: 5,
        xp: 210,
        gems: 18,
        streak: 7,
      });
    }
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'QuestBoard API is running' });
});

app.get('/api/player', async (_req, res) => {
  if (useMemoryFallback) {
    return res.json(fallbackPlayer);
  }

  try {
    const player = await Player.findOne().sort({ createdAt: -1 });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    return res.json({
      name: player.name,
      level: player.level,
      xp: player.xp,
      gems: player.gems,
      streak: player.streak,
    });
  } catch (error) {
    useMemoryFallback = true;
    return res.json(fallbackPlayer);
  }
});

app.get('/api/quests', async (_req, res) => {
  if (useMemoryFallback) {
    return res.json(fallbackQuests);
  }

  try {
    const quests = await Quest.find().sort({ createdAt: -1 }).lean();
    return res.json(quests.map((quest) => ({
      id: quest._id.toString(),
      title: quest.title,
      description: quest.description,
      type: quest.type,
      xp: quest.xp,
      streak: quest.streak,
      completed: quest.completed,
      color: quest.color,
    })));
  } catch (error) {
    useMemoryFallback = true;
    return res.json(fallbackQuests);
  }
});

app.post('/api/quests', async (req, res) => {
  const { title, type = 'task', description = '', xp = 10, color = 'green' } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (useMemoryFallback) {
    const newQuest = {
      id: `${Date.now()}`,
      title: title.trim(),
      type,
      description,
      xp,
      streak: 0,
      completed: false,
      color,
    };
    fallbackQuests.unshift(newQuest);
    return res.status(201).json(newQuest);
  }

  try {
    const newQuest = await Quest.create({
      title: title.trim(),
      type,
      description,
      xp,
      streak: 0,
      completed: false,
      color,
    });

    return res.status(201).json({
      id: newQuest._id.toString(),
      title: newQuest.title,
      description: newQuest.description,
      type: newQuest.type,
      xp: newQuest.xp,
      streak: newQuest.streak,
      completed: newQuest.completed,
      color: newQuest.color,
    });
  } catch (error) {
    useMemoryFallback = true;
    const newQuest = {
      id: `${Date.now()}`,
      title: title.trim(),
      type,
      description,
      xp,
      streak: 0,
      completed: false,
      color,
    };
    fallbackQuests.unshift(newQuest);
    return res.status(201).json(newQuest);
  }
});

app.put('/api/quests/:id', async (req, res) => {
  if (useMemoryFallback) {
    const index = fallbackQuests.findIndex((quest) => quest.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    fallbackQuests[index] = { ...fallbackQuests[index], ...req.body };
    return res.json(fallbackQuests[index]);
  }

  try {
    const quest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    return res.json({
      id: quest._id.toString(),
      title: quest.title,
      description: quest.description,
      type: quest.type,
      xp: quest.xp,
      streak: quest.streak,
      completed: quest.completed,
      color: quest.color,
    });
  } catch (error) {
    useMemoryFallback = true;
    const index = fallbackQuests.findIndex((quest) => quest.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    fallbackQuests[index] = { ...fallbackQuests[index], ...req.body };
    return res.json(fallbackQuests[index]);
  }
});

app.delete('/api/quests/:id', async (req, res) => {
  if (useMemoryFallback) {
    const index = fallbackQuests.findIndex((quest) => quest.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    const removed = fallbackQuests.splice(index, 1)[0];
    return res.json({ message: 'Quest deleted', quest: removed });
  }

  try {
    const quest = await Quest.findByIdAndDelete(req.params.id);

    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    return res.json({ message: 'Quest deleted', quest: { id: quest._id.toString() } });
  } catch (error) {
    useMemoryFallback = true;
    const index = fallbackQuests.findIndex((quest) => quest.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    const removed = fallbackQuests.splice(index, 1)[0];
    return res.json({ message: 'Quest deleted', quest: removed });
  }
});

const connectMongo = async () => {
  if (!process.env.MONGO_URI) {
    console.log('No MONGO_URI detected. Using in-memory data store for local demo.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'questboard',
    });
    console.log('Connected to MongoDB Atlas');
    useMemoryFallback = false;
    await seedData();
  } catch (error) {
    useMemoryFallback = true;
    console.error('MongoDB connection error:', error.message);
    console.log('Using in-memory fallback data so the app still works locally.');
  }
};

connectMongo();

app.listen(PORT, () => {
  console.log(`QuestBoard API running on http://localhost:${PORT}`);
});
