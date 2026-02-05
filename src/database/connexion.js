import { MongoClient } from 'mongodb';

const MONGO_USER = process.env.MONGO_USER || 'admin';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'password123';
const MONGO_HOST = process.env.MONGO_HOST || 'mongodb';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const DB_NAME = process.env.DB_NAME || 'meteo';

const MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?authSource=admin`;

let client;
let db;

export async function connect() {
  if (db) return db;
  
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log('Connecté à MongoDB');
    db = client.db(DB_NAME);
    return db;
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    throw error;
  }
}

export async function close() {
  if (client) {
    await client.close();
  }
}

connect();

export default { connect, close };