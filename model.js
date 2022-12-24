const mongoose = require('mongoose')
const modelName = 'PayStatus'

const PayStatusSchema = new mongoose.Schema({
  qr_code: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Number,
    required: true,
  }
})

module.exports = mongoose.model(modelName, PayStatusSchema)