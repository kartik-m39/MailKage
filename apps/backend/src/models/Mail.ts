const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
  address: String,
  subject: String,
  from: String,
  body: String,
  receivedAt: Date,
});

const Mail = mongoose.model("mail", mailSchema);

module.exports = Mail;