const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const connection = require('./src/database/connection');

const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Vos routes ici basées sur swagger.yaml
// Exemple :
app.get('/api/meteo', async (req, res) => {
  // Logique pour récupérer les données météo
});

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
  console.log(`API démarrée sur le port ${PORT}`);
});