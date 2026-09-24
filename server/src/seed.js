import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

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

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'questboard' });
    console.log('Connected to MongoDB Atlas');

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
      console.log('Seeded quests');
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
      console.log('Seeded player');
    }

    console.log('Database ready');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
