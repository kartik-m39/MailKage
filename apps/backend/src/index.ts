const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
import mailRouter from "./routes/mailRoutes";

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use(express.json());
app.use('/api', mailRouter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
})

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
