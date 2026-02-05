import express from 'express';

const router = express.Router();

// GET /meteo/v1/live?data=temperature,humidity,pressure
router.get('/v1/live', async (req, res) => {
  try {
    // Vérifier le paramètre data
    if (!req.query.data) {
      return res.status(400).json({
        error_code: 400,
        error_message: "Parameter 'data' is required"
      });
    }

    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({
        error_code: 500,
        error_message: "Database not available"
      });
    }
    
    const collection = db.collection('meteo');
    
    // CORRECTION: Trier par insertedAt au lieu de date
    const latestData = await collection.findOne(
      {}, 
      { sort: { insertedAt: -1 } }
    );
    
    if (!latestData) {
      return res.status(404).json({
        error_code: 404,
        error_message: "No data available"
      });
    }
    
    // Parser les paramètres demandés
    const requestedData = req.query.data.split(',').map(d => d.trim());
    
    // Construire l'objet measurements
    const measurements = {};
    
    if (latestData.measure && Array.isArray(latestData.measure)) {
      latestData.measure.forEach(item => {
        if (requestedData.includes(item.name)) {
          measurements[item.name] = {
            value: parseFloat(item.value) || item.value,
            unit: item.unit
          };
        }
      });
    }
    
    // Réponse conforme au swagger
    res.json({
      data: {
        date: latestData.insertedAt || latestData.date || new Date().toISOString(),
        location: {
          lat: latestData.lat || 48.8566,
          long: latestData.long || 2.3522
        },
        measurements
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error_code: 500,
      error_message: error.message
    });
  }
});

// GET /meteo/v1/archive?start=1700000000&end=1700003600
router.get('/v1/archive', async (req, res) => {
  try {
    // Vérifier les paramètres
    if (!req.query.start || !req.query.end) {
      return res.status(400).json({
        error_code: 400,
        error_message: "Parameters 'start' and 'end' are required"
      });
    }
    
    const start = parseInt(req.query.start);
    
    if (isNaN(start)) {
      return res.status(400).json({
        error_code: 400,
        error_message: "Parameter 'start' must be a valid timestamp"
      });
    }
    
    // Gérer end = "now" ou timestamp
    let end;
    if (req.query.end === 'now') {
      end = Math.floor(Date.now() / 1000);
    } else {
      end = parseInt(req.query.end);
      if (isNaN(end)) {
        return res.status(400).json({
          error_code: 400,
          error_message: "Parameter 'end' must be a valid timestamp or 'now'"
        });
      }
    }

    const db = req.app.locals.db;
    
    if (!db) {
      return res.status(500).json({
        error_code: 500,
        error_message: "Database not available"
      });
    }
    
    const collection = db.collection('meteo');
    
    // Convertir les timestamps en dates
    const startDate = new Date(start * 1000);
    const endDate = new Date(end * 1000);
    
    // Utiliser insertedAt au lieu de date
    const data = await collection.find({
      insertedAt: { 
        $gte: startDate, 
        $lte: endDate 
      }
    }).sort({ insertedAt: 1 }).toArray();
    
    // Construire la légende et les unités
    const legend = ["time", "lat", "long", "temperature", "humidity", "pressure"];
    const unit = ["ISO8601", "°", "°", "C", "%", "hP"];
    
    // Formater les données en tableau
    const formattedData = data.map(item => {
      // Créer un objet pour faciliter la recherche des mesures
      const measureMap = {};
      if (item.measure && Array.isArray(item.measure)) {
        item.measure.forEach(m => {
          measureMap[m.name] = parseFloat(m.value) || null;
        });
      }
      
      return [
        item.insertedAt ? item.insertedAt.toISOString() : null,
        item.lat || 48.85,
        item.long || 2.35,
        measureMap.temperature || null,
        measureMap.humidity || null,
        measureMap.pressure || null
      ];
    });
    
    res.json({
      legend,
      unit,
      data: formattedData
    });
    
  } catch (error) {
    res.status(500).json({
      error_code: 500,
      error_message: error.message
    });
  }
});

export default router;