// mailService.ts
const axios = require('axios');
// const Mail = require('../models/Mail');
const Mail = require('../models/Mail');
const API_URL = process.env.MAILTM_API || 'https://api.mail.tm';
require('dotenv').config();

// Use a proper session data object to store state
export let sessionData = {
  token: null,
  accountId: null,
  email: ""
};

export async function createAccountAndGetToken() {
  try {
    // Step 1: Getting domains for creating account
    const domainRes = await axios.get(`${API_URL}/domains`);
    const domains = domainRes.data['hydra:member'];
    if (!domains || domains.length === 0) {
      throw new Error('No domains available');
    }
    const domain = domains[0].domain;
    
    // Step 2: Create an account with the fetched domain
    const email = `user${Date.now()}@${domain}`;
    const password = 'deepsnanao';
    await axios.post(`${API_URL}/accounts`, { address: email, password });
    
    // Step 3: Get the token
    const loginRes = await axios.post(`${API_URL}/token`, { address: email, password });
    sessionData.token = loginRes.data.token;
    
    // Step 4: Get account id
    const me = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${sessionData.token}` }
    });
    sessionData.accountId = me.data.id;
    sessionData.email = email;
    
    return { email, token: sessionData.token };
  } catch (err) {
    console.error('Error in createAccountAndGetToken:', err);
    throw err; // Re-throw to be handled by the caller
  }
}

export async function fetchInbox() {
  if (!sessionData.token) return [];

  try {
    const res = await axios.get(`${API_URL}/messages`, {
      headers: { Authorization: `Bearer ${sessionData.token}` }
    });
    
    const messages = res.data['hydra:member'];
    const savedMails = [];
    
    for (const msg of messages) {
      try {
        const fullMsg = await axios.get(`${API_URL}/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${sessionData.token}` }
        });
        
        const mailData = {
          address: fullMsg.data.to[0].address,
          subject: fullMsg.data.subject,
          from: fullMsg.data.from.address,
          body: fullMsg.data.text,
          receivedAt: new Date(fullMsg.data.createdAt),
        };
        
        // Check if Mail is properly imported before using it
        if (!Mail || typeof Mail.findOne !== 'function') {
          console.error("Mail model is not properly imported");
          continue;
        }
        
        // Save to Mail collection
        let savedMail;
        try {
          // Check if mail exists
          savedMail = await Mail.findOne({ subject: fullMsg.data.subject });
          
          // If it doesn't exist, create it
          if (!savedMail) {
            savedMail = new Mail(mailData);
            await savedMail.save();
          }
          
          savedMails.push(savedMail);
        } catch (err) {
          console.error("Database error when saving mail:", err);
        }
      } catch (err) {
        console.error("Error processing message:", err);
      }
    }
    
    return savedMails;
  } catch (err) {
    console.error("Error fetching inbox:", err);
    return [];
  }
}

// Export the token getter to avoid exposing the entire sessionData object
export function getToken() {
  return sessionData.token;
}

// Add a polling function to handle email retrieval delays
export async function pollForNewEmails(attempts = 5, delay = 2000) {
  for (let i = 0; i < attempts; i++) {
    await new Promise(resolve => setTimeout(resolve, delay));
    await fetchInbox(); // Check for new emails
    const count = await Mail.countDocuments();
    if (count > 0) return true;
  }
  return false;
}