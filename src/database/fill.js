// the document to fill the database

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// configuration

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'meteo_db';
const COLLECTION_NAME = 'meteo_data';
const FAKESONDE_FILE = '/dev/shm/sensors';


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





async function insertData(filename) {
    /* insertion des données dans la base de données */

  try {
    const fileContent = fs.readFileSync(filename, 'utf8');
    const weatherData = JSON.parse(fileContent);
    weatherData.insertedAt = new Date();
    
    const result = await collection.insertOne(weatherData);
    console.log(`[${new Date().toLocaleTimeString()}] Données insérées: ${result.insertedId}`);
    
  } catch (error) {
    console.error('error', error.message);
  }
}

async function watchFile(filename) {
  /* surveillance du fichier en entrée */
  await init();
  
    console.log(`surveillance du fichier: ${filename}`);
  
  // Surveiller les changements du fichier
  fs.watch(filename, async (eventType) => {
    if (eventType === 'change') {
      await insertData(filename);
    }
  });
  
  // Gestion de l'arrêt propre
  process.on('SIGINT', async () => {
    await client.close();
    console.log('\n arrêt');
    process.exit(0);
  });
}

watchFile(FAKESONDE_FILE);


function cleanDb(){
    // TODO
};

