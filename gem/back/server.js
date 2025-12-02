const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // ✅ Importante: path
const connectDB = require('./config/db');

// 1. Cargar variables de entorno
dotenv.config({ path: './config/config.env' }); 

// 2. Conectar a la base de datos
connectDB(); 

const app = express();

// 3. Middlewares Globales
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());         

// ✅ LÍNEA CRÍTICA: Servir la carpeta de imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Conexión de Rutas
app.use('/api/v1/auth', require('./routes/authRoutes')); 
app.use('/api/v1/client', require('./routes/clientRoutes')); 
app.use('/api/v1/admin', require('./routes/adminRoutes')); 
app.use('/api/v1/employee', require('./routes/employeeRoutes')); 
app.use('/api/v1/payment', require('./routes/paymentRoutes'));

app.get('/', (req, res) => {
    res.send('API de Happy Factory en funcionamiento...');
});

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(`Servidor Express corriendo en el puerto ${PORT}`)
);