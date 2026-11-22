/**
 * ==============================================================================
 * PROMETHEIAX — API REST POR CAPAS (TALLER EVALUATIVO CIAF)
 * Archivo: routes/turnos.routes.js
 * ==============================================================================
 * 
 * ¿QUÉ ES ESTA CAPA Y POR QUÉ ES VITAL?
 * La capa de Enrutamiento ("Routes") actúa como el mapa de direcciones y señales
 * de tránsito de nuestra API.
 * 
 * Responsabilidad estricta según la rúbrica de CIAF:
 * "routes/: Define únicamente los endpoints y los asocia con su controlador
 * correspondiente."
 * 
 * Este archivo NO debe:
 * - Procesar peticiones directamente.
 * - Calcular tarifas ni porcentajes.
 * - Conectarse al archivo JSON de persistencia.
 * 
 * Su única tarea es asociar:
 * Verbo HTTP + Ruta URL ===> Función del Controlador
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnos.controller');

/**
 * 0. GET /api/turnos/configuracion
 * Endpoint informativo que retorna el parámetro N = 10 y el recargo del 20%.
 * Se define primero para evitar que Express lo confunda con el parámetro dinámico `/:id`.
 */
router.get('/configuracion', turnosController.obtenerConfiguracion);

/**
 * 1. GET /api/turnos
 * Retorna la lista completa de solicitudes registradas.
 * Código esperado: HTTP 200 OK.
 */
router.get('/', turnosController.obtenerTodos);

/**
 * 2. GET /api/turnos/:id
 * Consulta una solicitud específica mediante su identificador numérico o texto.
 * Códigos esperados: HTTP 200 OK (si existe) | HTTP 404 Not Found (si no existe).
 */
router.get('/:id', turnosController.obtenerPorId);

/**
 * 3. POST /api/turnos
 * Registra una nueva asesoría académica recibiendo el JSON en el cuerpo de la petición.
 * Códigos esperados: HTTP 201 Created (éxito) | HTTP 400 Bad Request (datos inválidos).
 */
router.post('/', turnosController.crearTurno);

module.exports = router;
