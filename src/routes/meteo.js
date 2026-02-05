import express from 'express';

const router = express.Router();

// GET /meteo/v1/live
router.get('/v1/live', (req, res) => {
  res.json({ message: 'Route live - à compléter' });
});

// GET /meteo/v1/archive
router.get('/v1/archive', (req, res) => {
  res.json({ message: 'Route archive - à compléter' });
});

export default router;
