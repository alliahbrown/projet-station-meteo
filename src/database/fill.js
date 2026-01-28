// the document to fill the database

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// configuration

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'meteo_db';
const COLLECTION_NAME = 'meteo_data';
const FAKESONDE_FILE = '';

async function insert(){

    const client = new MongoClient(MONGO_URL)
    try {
    await client.connect();
    console.log('connection réussie')
    }

    catch (error){

        console.log('error', error.message);

    }

};

insert();
