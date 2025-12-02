const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // Ej: 'home_title'
    value: { type: String, required: true }              // Ej: 'Nuestros Favoritos'
});

module.exports = mongoose.model('Config', ConfigSchema);