/**
 * ==============================================================================
 * PROMETHEIAX — FORO ACADÉMICO Y GESTIÓN DE ASESORÍAS
 * Taller Evaluativo Final: Arquitectura Cliente-Servidor (CIAF)
 * Archivo Principal: index.js
 * ==============================================================================
 * 
 * ¿QUÉ ES ESTE ARCHIVO Y POR QUÉ ES VITAL?
 * `index.js` es el punto de arranque y anfitrión del sistema completo.
 * 
 * Responsabilidad estricta según rúbrica CIAF:
 * "index.js (o app.js): Archivo principal que únicamente inicializa Express,
 * configura middlewares (express.json()), conecta las rutas y levanta el servidor."
 * 
 * Aquí NO debe haber lógica de tarifas, ni lectura de archivos de datos,
 * ni validación de campos. Solo la inicialización y orquestación técnica del servidor.
 * 
 * INTEGRANTES:
 * 1. Jordan Rivas, John Edison       -> #10 (N = 10)
 * 2. Sánchez Rodríguez, Laura Ximena  -> #19
 * ==============================================================================
 */

// Cargamos variables de entorno desde el archivo .env (PORT y EQUIPO_N)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Importamos los enrutadores modulares por capas
const turnosRoutes = require('./routes/turnos.routes');
const foroRoutes = require('./routes/foro.routes');

// Inicializamos la aplicación de Express
const app = express();

// Definimos el puerto de ejecución (por defecto 3000 o el configurado en .env)
const PORT = process.env.PORT || 3000;

// ==============================================================================
// CONFIGURACIÓN DE MIDDLEWARES TÉCNICOS
// ==============================================================================

// 1. CORS: Permite peticiones de orígenes cruzados (ideal para pruebas y despliegues)
app.use(cors());

// 2. express.json(): Permite a Express leer y transformar cuerpos JSON entrantes (req.body)
app.use(express.json());

// 3. express.urlencoded(): Soporte para datos codificados en URL si hiciera falta
app.use(express.urlencoded({ extended: true }));

// 4. express.static(): Sirve de forma nativa la interfaz gráfica web (Frontend de PrometheiaX)
app.use(express.static(path.join(__dirname, 'public')));

// ==============================================================================
// REGISTRO DE RUTAS MODULARES DE LA API
// ==============================================================================

// Conectamos las rutas del módulo de asesorías académicas (Requisito principal CIAF)
app.use('/api/turnos', turnosRoutes);

// Conectamos las rutas comunitarias del foro académico
app.use('/api/foro', foroRoutes);

// Endpoint raíz de bienvenida e inspección de servicios
app.get('/api', (req, res) => {
  res.status(200).json({
    plataforma: 'PrometheiaX',
    descripcion: 'Foro Académico y API REST de Asesorías CIAF',
    version: '1.0.0',
    estado: 'Servidor operativo y escuchando',
    integrantes: [
      'John Edison Jordan Rivas (#10 - N=10)',
      'Laura Ximena Sánchez Rodríguez (#19)'
    ],
    endpointsDisponibles: {
      listarSolicitudes: 'GET /api/turnos (200 OK)',
      consultarPorId: 'GET /api/turnos/:id (200 OK / 404 Not Found)',
      registrarSolicitud: 'POST /api/turnos (201 Created / 400 Bad Request)',
      configuracionNegocio: 'GET /api/turnos/configuracion',
      foroComunitario: 'GET /api/foro'
    }
  });
});

// Manejador para cualquier ruta no registrada en el servidor (404 Not Found general)
app.use((req, res, next) => {
  res.status(404).json({
    exito: false,
    error: 'Ruta no encontrada (404 Not Found)',
    mensaje: `El endpoint "${req.method} ${req.originalUrl}" no existe en el servidor PrometheiaX.`
  });
});

// Manejador centralizado de errores inesperados (500 Internal Server Error)
app.use((err, req, res, next) => {
  console.error('Error no controlado en tiempo de ejecución:', err);
  res.status(500).json({
    exito: false,
    error: 'Error interno del servidor (500)',
    mensaje: 'Ocurrió una falla imprevista en el procesamiento de la petición.'
  });
});

// ==============================================================================
// PUESTA EN MARCHA DEL SERVIDOR
// ==============================================================================
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    const N = process.env.EQUIPO_N || 10;
    console.log('================================================================');
    console.log('   PROMETHEIAX — FORO ACADÉMICO & API REST POR CAPAS (CIAF)    ');
    console.log('================================================================');
    console.log(` Servidor ejecutándose en: http://localhost:${PORT}`);
    console.log(` Interfaz web del Foro y Asesorías: http://localhost:${PORT}`);
    console.log(` Endpoint de Turnos: http://localhost:${PORT}/api/turnos`);
    console.log(` Integrantes: John Edison Jordan (#10) y Laura Ximena Sánchez (#19)`);
    console.log(` Parámetro N configurado: N = ${N} (Recargo prioritario: ${N * 2}%)`);
    console.log('================================================================');
  });

  // Manejo elegante si el puerto ya está ocupado por otra instancia
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ ERROR (EADDRINUSE): El puerto ${PORT} ya está siendo utilizado por otro proceso de Node.js o aplicación.`);
      console.error(`👉 Solución 1: En tu archivo .env cambia 'PORT=3000' por 'PORT=3001' y vuelve a ejecutar.`);
      console.error(`👉 Solución 2: En Windows ejecuta 'taskkill /F /IM node.exe' para cerrar procesos colgados.\n`);
    } else {
      console.error('Error inesperado al iniciar el servidor HTTP:', err.message);
    }
  });
}

module.exports = { app, server };
