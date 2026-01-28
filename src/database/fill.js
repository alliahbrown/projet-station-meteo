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

async function insert(){

    // initialisation de la base de donnée

    const client = new MongoClient(MONGO_URL)
    try {
    await client.connect();

    const db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);

    console.log('connection à MongoDB réussie');
    console.log('database', DB_NAME, 'initialisée');
    console.log('collection', COLLECTION_NAME);

    // lecture du fichier

    const fileContent = fs.readFileSync(FAKESONDE_FILE, 'utf8');
    const weatherData = JSON.parse(fileContent);
    console.log('lecture du fichier ?');

    const result = await collection.insertOne(weatherData);

    console.log(`Données insérées avec l'ID: ${result.insertedId}`);

    console.log(JSON.stringify(weatherData, null, 2));

    console.log(result)


    }
    catch (error){
        console.log('error', error.message);
    }




};




insert();
