const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const eventosRoutes = require('./rutas/eventos');
const asistentesRoutes = require('./rutas/asistentes'); 
const pagosRoutes = require('./rutas/pagos');
const promocionesRoutes = require('./rutas/promociones');

dotenv.config();

const app = express();
const puerto = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuración para servir archivos estáticos desde el directorio 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/eventos', eventosRoutes);
app.use('/api/asistentes', asistentesRoutes); 
app.use('/api/pagos', pagosRoutes);
app.use('/api/promociones', promocionesRoutes);

app.get('/', (req, res) => {
  res.send('API de Gestión de Eventos');
});

app.listen(puerto, () => {
  console.log(`Servidor corriendo en el puerto ${puerto}`);
});

module.exports = app;