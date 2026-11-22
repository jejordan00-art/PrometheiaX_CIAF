/**
 * PROMETHEIAX - API REST
 * Capa de Enrutamiento: routes/turnos.routes.js
 * 
 * Responsabilidad estricta según rúbrica CIAF:
 * - Define únicamente los endpoints y los asocia con su controlador correspondiente.
 * - Sin lógica de negocio ni manipulación de datos en este archivo.
 */

const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnos.controller');

// Endpoint informativo sobre la configuración del parámetro N del equipo
router.get('/configuracion', turnosController.obtenerConfiguracion);

// 1. GET /api/turnos - Retorna la lista completa de solicitudes (HTTP 200 OK)
router.get('/', turnosController.obtenerTodos);

// 2. GET /api/turnos/:id - Retorna una solicitud específica por su ID (HTTP 200 OK / HTTP 404 Not Found)
router.get('/:id', turnosController.obtenerPorId);

// 3. POST /api/turnos - Registra una nueva solicitud con cálculo de tarifa (HTTP 201 Created / HTTP 400 Bad Request)
router.post('/', turnosController.crearTurno);

module.exports = router;
