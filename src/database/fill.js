import { connect } from './connexion.js';
import fs from 'fs';

const FAKESONDE_FILE = '/dev/shm/sensors';

async function insertData(filename) {
  try {
    const fileContent = fs.readFileSync(filename, 'utf8');
    const weatherData = JSON.parse(fileContent);
    weatherData.insertedAt = new Date();
    
    const db = await connect();
    const collection = db.collection('meteo');
    const result = await collection.insertOne(weatherData);
    
    console.log(`[${new Date().toLocaleTimeString()}] Données insérées: ${result.insertedId}`);
  } catch (error) {
    console.error('Erreur insertion:', error.message);
  }
}

async function watchFile(filename) {
  await connect();
  console.log(`Surveillance du fichier: ${filename}`);
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(filename)) {
    console.log(`  Fichier ${filename} introuvable, mode simulation activé`);
    // Mode simulation : insérer des données toutes les 30 secondes
    setInterval(async () => {
      const simulatedData = {
        temperature: 15 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        pressure: 1000 + Math.random() * 50,
        insertedAt: new Date()
      };
      
      try {
        const db = await connect();
        const collection = db.collection('meteo');
        await collection.insertOne(simulatedData);
        console.log(` Données simulées insérées: ${JSON.stringify(simulatedData)}`);
      } catch (error) {
        console.error('Erreur:', error.message);
      }
    }, 30000);
    
    return;
  }
  
  // Mode normal : surveiller le fichier
  fs.watch(filename, async (eventType) => {
    if (eventType === 'change') {
      await insertData(filename);
    }
  });
  
  process.on('SIGINT', async () => {
    console.log('\n Arrêt du scrapper');
    process.exit(0);
  });
}

watchFile(FAKESONDE_FILE);