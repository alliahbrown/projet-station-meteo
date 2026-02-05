import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { connect } from './src/database/connexion.js';

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(express.json());


// // Route de test
// app.get('/', (req, res) => {
//   res.json({ message: 'API Météo en ligne' });
// });

// // Route pour récupérer les données météo
// app.get('/api/meteo', async (req, res) => {
//   try {
//     const db = await connect();
//     const data = await db.collection('meteo').find().limit(100).toArray();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Démarrer le serveur
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
