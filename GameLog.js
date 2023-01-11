const mongoose = require('mongoose')
const modelName = 'GameLog'

const GameLogSchema = new mongoose.Schema({
  qr_code: {
    type: String,
    required: true
  },
  is_restart: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  game_id: {
    type: Number,
    required: true
  },
  start_time: {
    type: Date,
    required: true
  },
  restart_time: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  payment: {
    type: String,
    required: true,
  }
})

module.exports = mongoose.model(modelName, GameLogSchema)