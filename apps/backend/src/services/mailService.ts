const axios = require('axios');
const Mail = require('../models/Mail');
const API_URL = process.env.MAILTM_API;

let token = null;
let accountId = null;

async function createAccountAndGetToken() {
  try {
    //step 1:getting doomains for creating account
    const domainRes = await axios.get(`${API_URL}/domains`);
    const domains = domainRes.data['hydra:member'];
    if (!domains || domains.length === 0) {
      throw new Error('No domains available');
    }
    const domain = domains[0].domain;
    //step 2: Create an account with the fetched domain
    const email = `user${Date.now()}@${domain}`;
    const password = 'deepsnanao';
    await axios.post(`${API_URL}/accounts`, { address: email, password });
    //step 3: get the token
    const loginRes = await axios.post(`${API_URL}/token`, { address: email, password });
    token = loginRes.data.token;
    console.log('Token received:', token);
    //step 4: get account id
    console.log('Step 4: Fetching account ID with token');
    const me = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    accountId = me.data.id;
    console.log('Account ID:', accountId);

    return { email, token };
  } catch (err) {
    console.error('Error in createAccountAndGetToken:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
    throw err;
  }
}

async function fetchInbox() {
  if (!token) return [];

  const res = await axios.get(`${API_URL}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const messages = res.data['hydra:member'];
  for (const msg of messages) {
    const fullMsg = await axios.get(`${API_URL}/messages/${msg.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    await Mail.updateOne(
      { subject: fullMsg.data.subject },
      {
        $setOnInsert: {
          address: fullMsg.data.to[0].address,
          subject: fullMsg.data.subject,
          from: fullMsg.data.from.address,
          body: fullMsg.data.text,
          receivedAt: new Date(fullMsg.data.createdAt),
        }
      },
      { upsert: true }
    );
  }

  return messages;
}

module.exports = { createAccountAndGetToken, fetchInbox };