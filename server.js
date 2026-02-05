import express from 'express';
import { connect } from './src/database/connexion.js';

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(express.json());


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
