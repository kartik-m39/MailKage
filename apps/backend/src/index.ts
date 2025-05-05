require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');
const { fetchInbox } = require('./services/mailservice');
const mailRoutes = require('./routes/mailRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', // Allow all origins (for testing)
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  }));
app.use(express.json());
app.use('/api', mailRoutes);

mongoose.connect(process.env.MONGODB_URI)//connect to mongodb atlas
  .then(() => {
    console.log('Connected to MongoDB Atlas');

    // it polls after 30 seconddss
    cron.schedule('*/30 * * * * *', async () => {
      console.log('Polling inbox...');
      await fetchInbox();
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
