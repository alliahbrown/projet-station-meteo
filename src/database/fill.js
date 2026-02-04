// // // import ? 

// // import * as conn from "./connexion.js"
// import { init, collection } from "./connexion.js";
// import fs from 'fs';
// // // the document to fill the database

// // import fs from 'fs';


// // // configuration


// const FAKESONDE_FILE = '/dev/shm/sensors';


// let client;
// let collection;




// async function insertData(filename) {
//     /* insertion des données dans la base de données */

//   try {
//     const fileContent = fs.readFileSync(filename, 'utf8');
//     const weatherData = JSON.parse(fileContent);
//     weatherData.insertedAt = new Date();
    
//     const result = await collection.insertOne(weatherData);
//     console.log(`[${new Date().toLocaleTimeString()}] Données insérées: ${result.insertedId}`);
    
//   } catch (error) {
//     console.error('error', error.message);
//   }
// }

// async function watchFile(filename) {
//   /* surveillance du fichier en entrée */
//   await conn.init();
  
//     console.log(`surveillance du fichier: ${filename}`);
  
//   // Surveiller les changements du fichier
//   fs.watch(filename, async (eventType) => {
//     if (eventType === 'change') {
//       await insertData(filename);
//     }
//   });
  
//   // Gestion de l'arrêt propre
//   process.on('SIGINT', async () => {
//     await client.close();
//     console.log('\n arrêt');
//     process.exit(0);
//   });
// }

// watchFile(FAKESONDE_FILE);


// function cleanDb(){
//     // TODO
// };

import * as conn from "./connexion.js";
import { init, collection } from "./connexion.js";
import fs from 'fs';

const FAKESONDE_FILE = '/dev/shm/sensors';

async function insertData(filename) {
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
  await init();
  console.log(`surveillance du fichier: ${filename}`);
  
  fs.watch(filename, async (eventType) => {
    if (eventType === 'change') {
      await insertData(filename);
    }
  });
  
  process.on('SIGINT', async () => {
    // await close();
    console.log('\n arrêt');
    process.exit(0);
  });
}

watchFile(FAKESONDE_FILE);