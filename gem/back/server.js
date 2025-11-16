// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// 1. Cargar variables de entorno (config.env)
dotenv.config({ path: './config/config.env' }); 

// 2. Conectar a la base de datos
connectDB(); 

const app = express();

// 3. Middlewares Globales
app.use(express.json()); // Permite recibir JSON
app.use(express.urlencoded({ extended: true }));
app.use(cors());         // Habilita CORS

// 4. Conexión de Rutas
app.use('/api/v1/auth', require('./routes/authRoutes')); 
app.use('/api/v1/client', require('./routes/clientRoutes')); 
app.use('/api/v1/admin', require('./routes/adminRoutes')); 
app.use('/api/v1/employee', require('./routes/employeeRoutes')); 

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Happy Factory en funcionamiento...');
});

// 5. Inicializar el servidor
const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(`Servidor Express corriendo en el puerto ${PORT}`)
);