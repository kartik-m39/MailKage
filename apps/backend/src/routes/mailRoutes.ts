import { Request, Response } from "express";
const express = require('express');
const Mail = require('../models/Mail');
import { createAccountAndGetToken, fetchInbox, sessionData } from '../services/mailService';
const router = express.Router();

router.get('/generate', async (req: Request, res: Response) => {
  console.log('Received request for /api/generate');
  try {
    const result = await createAccountAndGetToken();
    console.log('Result from createAccountAndGetToken:', result);
    res.json(result);
    console.log('Response sent successfully');
  } catch (err: unknown) {
    console.error('Error in /api/generate:', err);
    res.status(500).json({ error: `Failed to generate temp mail: ${err}` });
  }
});

router.get('/inbox', async (req: Request, res: Response) => {
  try {
    console.log("Token available:", !!sessionData.token);
    
    if (!sessionData.token) {
      return res.status(401).json({ error: 'No active email session. Please generate a temporary email first.' });
    }
    
    try {
      // Fetch and save new messages from API
      const messages = await fetchInbox();
      return res.json({ inbox: messages });
    } catch (fetchErr) {
      console.error("Error fetching inbox from API:", fetchErr);
      
      // If API fetch fails, try to return existing messages from database
      try {
        const inbox = await Mail.find().sort({ receivedAt: -1 }).limit(10);
        return res.json({ inbox });
      } catch (dbErr) {
        console.error("Database error:", dbErr);
        return res.status(500).json({ error: 'Database error' });
      }
    }
  } catch (err) {
    console.error("Unhandled error in /inbox route:", err);
    res.status(500).json({ error: 'Could not retrieve inbox' });
  }
});

export default router;