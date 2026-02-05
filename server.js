import express from 'express';
import cors from 'cors';
import { connect } from './src/database/connexion.js';
import meteoRoutes from './src/routes/meteo.js';

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());



app.get('/', (req, res) => {
  res.json({ 
    message: 'API Météo',
    endpoints: [
      'GET /meteo/v1/live',
      'GET /meteo/v1/archive'
    ]
  });
});

app.use('/meteo', meteoRoutes);


async function startServer() {
  try {
    const db = await connect();
    app.locals.db = db;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API démarrée sur http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur:', error.message);
    setTimeout(startServer, 5000);
  }
}

startServer();