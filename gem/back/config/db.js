// /config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // La URL viene del archivo config.env
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB conectado en: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error de conexión a MongoDB: ${error.message}`);
        process.exit(1); // Sale del proceso con fallo si no puede conectar
    }
};

module.exports = connectDB;