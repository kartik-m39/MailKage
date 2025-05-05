const express = require('express');
const Mail = require('../models/Mail');
const { createAccountAndGetToken } = require('../services/mailservice');

const router = express.Router();

router.get('/generate', async (req, res) => {
  console.log('Received request for /api/generate');
  try {
    const email = await createAccountAndGetToken();
    console.log('Result from createAccountAndGetToken:', email);
    res.json(email);
    console.log('Response sent successfully');
  } catch (err) {
    console.error('Error in /api/generate:', err.message, err.stack);
    res.status(500).json({ error: `Failed to generate temp mail: ${err.message}` });
  }
});

router.get('/inbox', async (req, res) => {
  try {
    const inbox = await Mail.find().sort({ receivedAt: -1 }).limit(10);
    res.json({ inbox });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve inbox' });
  }
});

module.exports = router;