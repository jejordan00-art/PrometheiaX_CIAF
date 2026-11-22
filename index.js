/**
 * PROMETHEIAX - FORO ACADÉMICO Y GESTIÓN DE ASESORÍAS
 * Taller Evaluativo Final: Arquitectura Cliente-Servidor (CIAF)
 * 
 * Archivo principal: index.js
 * 
 * Responsabilidades según rúbrica:
 * - Inicializar Express.
 * - Configurar middlewares (express.json(), cors, archivos estáticos).
 * - Conectar las rutas modulares (/api/turnos).
 * - Levantar el servidor en el puerto correspondiente.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importación de rutas modulares por capas
const turnosRoutes = require('./routes/turnos.routes');
const foroRoutes = require('./routes/foro.routes');

// Inicialización de la aplicación Express
const app = express();

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la interfaz gráfica web (Frontend de PrometheiaX)
app.use(express.static(path.join(__dirname, 'public')));

// Registro de las rutas de la API REST
app.use('/api/turnos', turnosRoutes);
app.use('/api/foro', foroRoutes);

// Endpoint de estado y bienvenida a la API
app.get('/api', (req, res) => {
  res.status(200).json({
    plataforma: 'PrometheiaX',
    descripcion: 'Foro Académico y API REST de Asesorías CIAF',
    version: '1.0.0',
    estado: 'Servidor operativo',
    endpoints: {
      listarTurnos: 'GET /api/turnos',
      obtenerTurnoPorId: 'GET /api/turnos/:id',
      registrarTurno: 'POST /api/turnos',
      configuracionNegocio: 'GET /api/turnos/configuracion',
      foroComunidad: 'GET /api/foro'
    }
  });
});

// Manejador para rutas no encontradas (404 Not Found)
app.use((req, res, next) => {
  res.status(404).json({
    exito: false,
    error: 'Ruta no encontrada (404 Not Found)',
    mensaje: `El endpoint "${req.method} ${req.originalUrl}" no existe en el servidor PrometheiaX.`
  });
});

// Manejador centralizado de errores inesperados (500 Internal Server Error)
app.use((err, req, res, next) => {
  console.error('Error no controlado en el servidor:', err);
  res.status(500).json({
    exito: false,
    error: 'Error interno del servidor (500)',
    mensaje: 'Se produjo una falla no controlada en el procesamiento de la solicitud.'
  });
});

// Iniciar el servidor únicamente si el archivo se ejecuta directamente
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    const N = process.env.EQUIPO_N || 7;
    console.log('================================================================');
    console.log('   PROMETHEIAX — FORO ACADÉMICO & API REST POR CAPAS (CIAF)    ');
    console.log('================================================================');
    console.log(` Servidor ejecutándose en: http://localhost:${PORT}`);
    console.log(` Interfaz web del Foro y Asesorías: http://localhost:${PORT}`);
    console.log(` Endpoint de Turnos: http://localhost:${PORT}/api/turnos`);
    console.log(` Parámetro N configurado: N = ${N} (Recargo prioritario: ${N * 2}%)`);
    console.log('================================================================');
  });
}

module.exports = { app, server };
