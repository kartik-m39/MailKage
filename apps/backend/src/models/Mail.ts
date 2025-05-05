const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
  address: String,
  subject: String,
  from: String,
  body: String,
  receivedAt: Date,
});

module.exports = mongoose.model('Mail', mailSchema);
