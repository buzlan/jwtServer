const { Schema, model } = require('mongoose')

const BookSchema = new Schema({
  email: { type: String, unique: true, required: true},
  password: { type: String, required: true},
  isActivated: { type: Boolean, default: false},
})

module.exports = model('Book', BookSchema)
