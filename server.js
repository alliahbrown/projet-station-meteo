import express from 'express';
import { connect } from './src/database/connexion.js';
import meteoRoutes from './src/routes/meteo.js';

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(express.json());

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Météo',
    endpoints: [
      'GET /meteo/v1/live',
      'GET /meteo/v1/archive'
    ]
  });
});

// Routes météo
app.use('/meteo', meteoRoutes);

// Démarrage du serveur
async function startServer() {
  try {
    await connect();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API démarrée sur http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur:', error.message);
    setTimeout(startServer, 5000);
  }
}

startServer();