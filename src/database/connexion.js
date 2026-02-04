// the document to fill the database
// const { MongoClient } = require('mongodb');
import { MongoClient } from 'mongodb';

// configuration

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'meteo_db';
const COLLECTION_NAME = 'meteo_data';



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

init();

export { collection, init };