// the document to fill the database
// const { MongoClient } = require('mongodb');
import { MongoClient } from 'mongodb';

// configuration

// const MONGO_URL = 'mongodb://localhost:27017';
// const DB_NAME = 'meteo_db';
// const COLLECTION_NAME = 'meteo_data';


const MONGO_USER = process.env.MONGODB_USER
const MONGO_PASSWORD = process.env.MONGODB_PASSWORD
const MONGO_HOST = process.env.MONGO_HOST 
const DB_NAME = process.env.MONGODB_DB

const MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${DB_NAME}?authSource=${DB_NAME}`;


let client;
let collection;


async function init() {
  /* 
  Initialisation connection database
  */

  client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log('connection à MongoDB réussie');
  console.log('database :', DB_NAME, '; collection :', COLLECTION_NAME);
  
  const db = client.db(DB_NAME);
  collection = db.collection(COLLECTION_NAME);
}


async function close() {

  /* fermeture de la connexion */
  if (client) {
    await client.close();
    console.log(' connexion MongoDB fermée');
  }
}

init();

export { collection, init, close };