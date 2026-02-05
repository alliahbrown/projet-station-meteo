import { connect } from './connexion.js';
import fs from 'fs';

const FAKESONDE_FILE = '/dev/shm/sensors';
const GPS_FILE = '/dev/shm/gpsNmea';
const TPH_FILE = '/dev/shm/tph.log';
const RAIN_FILE = '/dev/shm/rain';

let rainCount = 0; // compteur pluie
// ========== PARSERS ==========

function parseGPS(gpsData) {
  const lines = gpsData.split('\n');
  let lat = null, long = null;
  
  for (const line of lines) {
    if (line.startsWith('$GPGGA')) {
      // $GPGGA,145549.84,5130.408,N,00007.208,W,...
      const parts = line.split(',');
      if (parts.length >= 6) {
        const latDeg = parseFloat(parts[2].substring(0, 2));
        const latMin = parseFloat(parts[2].substring(2));
        lat = latDeg + latMin / 60;
        if (parts[3] === 'S') lat = -lat;
        
        const lonDeg = parseFloat(parts[4].substring(0, 3));
        const lonMin = parseFloat(parts[4].substring(3));
        long = lonDeg + lonMin / 60;
        if (parts[5] === 'W') long = -long;
      }
      break;
    }
  }
  
  return { lat, long };
}

function parseTPH(tphData) {
  try {
    const data = JSON.parse(tphData);
    return {
      temperature: data.temp,
      humidity: data.hygro,
      pressure: data.press
    };
  } catch (error) {
    console.error('Erreur parsing TPH:', error.message);
    return {};
  }
}

function parseSensors(sensorsData) {
  try {
    const data = JSON.parse(sensorsData);
    return data.measure || [];
  } catch (error) {
    console.error('Erreur parsing sensors:', error.message);
    return [];
  }
}

//insertion

async function insertData() {
  try {
    const db = await connect();
    const collection = db.collection('meteo');
    
    // Préparer l'objet de données
    const weatherData = {
      date: new Date().toISOString(),
      insertedAt: new Date()
    };
    
    // 1. GPS
    if (fs.existsSync(GPS_FILE)) {
      const gpsContent = fs.readFileSync(GPS_FILE, 'utf8');
      const gps = parseGPS(gpsContent);
      if (gps.lat !== null) {
        weatherData.lat = gps.lat;
        weatherData.long = gps.long;
      }
    }
    
    // 2. TPH
    let tphMeasures = [];
    if (fs.existsSync(TPH_FILE)) {
      const tphContent = fs.readFileSync(TPH_FILE, 'utf8');
      const tph = parseTPH(tphContent);
      
      if (tph.temperature !== undefined) {
        tphMeasures.push({
          name: 'temperature',
          desc: 'Température',
          unit: 'C',
          value: tph.temperature.toFixed(2)
        });
      }
      if (tph.humidity !== undefined) {
        tphMeasures.push({
          name: 'humidity',
          desc: 'Humidité',
          unit: '%',
          value: tph.humidity.toFixed(1)
        });
      }
      if (tph.pressure !== undefined) {
        tphMeasures.push({
          name: 'pressure',
          desc: 'Pression',
          unit: 'hP',
          value: tph.pressure.toFixed(2)
        });
      }
    }
    
    // 3. sensors
    let sensorMeasures = [];
    if (fs.existsSync(FAKESONDE_FILE)) {
      const sensorsContent = fs.readFileSync(FAKESONDE_FILE, 'utf8');
      sensorMeasures = parseSensors(sensorsContent);
    }
    
    // 4. pluie
    const rainMeasure = {
      name: 'rain',
      desc: 'Précipitations',
      unit: 'mm',
      value: (rainCount * 10.2794).toFixed(4)
    };
    
    //fusion de tout
    const measureMap = new Map();
    
    // sensors
    sensorMeasures.forEach(m => measureMap.set(m.name, m));
    
    // tph écrase sensors pour
    tphMeasures.forEach(m => measureMap.set(m.name, m));
    
    // + pluie
    measureMap.set('rain', rainMeasure);
    
    weatherData.measure = Array.from(measureMap.values());
    
    // insertion dans mongodb
    const result = await collection.insertOne(weatherData);
    console.log(`[${new Date().toLocaleTimeString()}] Données insérées: ${result.insertedId}`);
    
  } catch (error) {
    console.error('Erreur insertion:', error.message);
  }
}

// surveillance

async function startWatching() {
  await connect();
  console.log('surveillance des fichiers de données..');
  
  // Surveiller sensors (mise à jour périodique)
  if (fs.existsSync(FAKESONDE_FILE)) {
    console.log(`Surveillance: ${FAKESONDE_FILE}`);
    fs.watch(FAKESONDE_FILE, { persistent: true }, async (eventType) => {
      if (eventType === 'change') {
        await insertData();
      }
    });
  } else {
    console.log(` Fichier ${FAKESONDE_FILE} introuvable`);
  }
  
  // Surveiller rain (compteur d'événements)
  if (fs.existsSync(RAIN_FILE)) {
    console.log(`🌧️  Surveillance pluie: ${RAIN_FILE}`);
    fs.watch(RAIN_FILE, { persistent: true }, (eventType) => {
      if (eventType === 'change') {
        rainCount++;
        console.log(` Pluie détectée! Total: ${(rainCount * 10.2794).toFixed(2)} mm`);
      }
    });
  } else {
    console.log(` Fichier pluie ${RAIN_FILE} introuvable`);
  }
  
  // Insertion initiale
  await insertData();
  
  // Gestion arrêt propre
  process.on('SIGINT', async () => {
    console.log('\nArrêt du scrapper');
    process.exit(0);
  });
}

startWatching();

