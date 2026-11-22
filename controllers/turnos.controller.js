/**
 * PROMETHEIAX - API REST
 * Capa de Controladores: controllers/turnos.controller.js
 * 
 * Responsabilidad estricta según rúbrica CIAF:
 * - Gestiona la petición (req) y la respuesta (res).
 * - Valida los datos de entrada en formato JSON.
 * - Asigna y devuelve los códigos de estado HTTP correspondientes:
 *   - 200 OK: Listado exitoso y consulta exitosa por ID.
 *   - 201 Created: Registro exitoso de solicitud de asesoría.
 *   - 400 Bad Request: Campos obligatorios faltantes o valores inválidos (<= 0).
 *   - 404 Not Found: Consulta de identificador inexistente.
 *   - 500 Internal Server Error: Error no controlado sin tumbar el servidor.
 */

const turnosService = require('../services/turnos.service');

/**
 * GET /api/turnos
 * Retorna la lista completa de registros almacenados (HTTP 200 OK).
 */
function obtenerTodos(req, res) {
  try {
    const turnos = turnosService.obtenerTodos();
    return res.status(200).json({
      exito: true,
      total: turnos.length,
      datos: turnos
    });
  } catch (error) {
    console.error('Error en obtenerTodos:', error.message);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor',
      mensaje: 'Ocurrió un error inesperado al consultar los turnos.'
    });
  }
}

/**
 * GET /api/turnos/:id
 * Retorna la información de un registro específico (HTTP 200 OK).
 * Si no existe, responde con HTTP 404 Not Found.
 */
function obtenerPorId(req, res) {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({
        exito: false,
        error: 'Identificador inválido',
        mensaje: 'Debe proporcionar un identificador válido en la URL.'
      });
    }

    const turno = turnosService.obtenerPorId(id);

    if (!turno) {
      return res.status(404).json({
        exito: false,
        error: 'Recurso no encontrado (404 Not Found)',
        mensaje: `No existe ninguna solicitud de asesoría con el identificador "${id}".`
      });
    }

    return res.status(200).json({
      exito: true,
      datos: turno
    });
  } catch (error) {
    console.error('Error en obtenerPorId:', error.message);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor',
      mensaje: 'Ocurrió un error inesperado al consultar el turno.'
    });
  }
}

/**
 * POST /api/turnos
 * Registra una nueva solicitud de asesoría académica (HTTP 201 Created).
 * Si faltan campos o hay valores <= 0, rechaza con HTTP 400 Bad Request.
 */
function crearTurno(req, res) {
  try {
    const { estudiante, tipoServicio, tema, fechaHora, precioBase, prioritario } = req.body;

    // Validación 1: Verificar que el cuerpo de la petición contenga información
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        exito: false,
        error: 'Cuerpo de petición vacío (400 Bad Request)',
        mensaje: 'Debe enviar un objeto JSON con los datos de la solicitud de asesoría.'
      });
    }

    // Validación 2: Campos obligatorios de texto
    const erroresValidacion = [];

    if (!estudiante || typeof estudiante !== 'string' || estudiante.trim() === '') {
      erroresValidacion.push('El campo "estudiante" es obligatorio y debe ser un texto no vacío.');
    }

    if (!tipoServicio || typeof tipoServicio !== 'string' || tipoServicio.trim() === '') {
      erroresValidacion.push('El campo "tipoServicio" es obligatorio (ej: "Asesoría académica", "Tutoría").');
    }

    if (!tema || typeof tema !== 'string' || tema.trim() === '') {
      erroresValidacion.push('El campo "tema" es obligatorio (ej: "Arquitectura de software").');
    }

    if (!fechaHora || typeof fechaHora !== 'string' || fechaHora.trim() === '') {
      erroresValidacion.push('El campo "fechaHora" es obligatorio (formato ISO 8601 ej: "2026-12-05T10:00:00").');
    } else {
      const fechaParseada = new Date(fechaHora);
      if (isNaN(fechaParseada.getTime())) {
        erroresValidacion.push('El campo "fechaHora" debe contener una fecha y hora válida en formato ISO.');
      }
    }

    // Validación 3: precioBase numérico y estrictamente mayor que cero (> 0)
    if (precioBase === undefined || precioBase === null || precioBase === '') {
      erroresValidacion.push('El campo "precioBase" es obligatorio.');
    } else {
      const precioNumerico = Number(precioBase);
      if (isNaN(precioNumerico)) {
        erroresValidacion.push('El campo "precioBase" debe ser un número válido.');
      } else if (precioNumerico <= 0) {
        erroresValidacion.push('El campo "precioBase" debe ser un valor numérico mayor a cero (> 0). Los valores menores o iguales a cero no son permitidos.');
      }
    }

    // Si existen errores de validación, retornar HTTP 400 Bad Request
    if (erroresValidacion.length > 0) {
      return res.status(400).json({
        exito: false,
        error: 'Validación de entrada fallida (400 Bad Request)',
        detalles: erroresValidacion,
        mensaje: 'La solicitud no pudo ser procesada debido a datos incompletos o inválidos.'
      });
    }

    // Llamado a la capa de servicios para procesar la lógica de negocio y persistir
    const nuevoTurno = turnosService.crearTurno({
      estudiante,
      tipoServicio,
      tema,
      fechaHora,
      precioBase: Number(precioBase),
      prioritario: Boolean(prioritario)
    });

    // Retornar HTTP 201 Created con el objeto creado
    return res.status(201).json({
      exito: true,
      mensaje: 'Solicitud de asesoría académica registrada exitosamente.',
      datos: nuevoTurno
    });

  } catch (error) {
    console.error('Error en crearTurno:', error.message);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor',
      mensaje: 'Ocurrió un error inesperado al procesar la solicitud.'
    });
  }
}

/**
 * GET /api/turnos/configuracion
 * Retorna los parámetros de configuración de negocio activos (N y porcentaje).
 */
function obtenerConfiguracion(req, res) {
  try {
    const config = turnosService.obtenerConfiguracionNegocio();
    return res.status(200).json({
      exito: true,
      datos: config
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crearTurno,
  obtenerConfiguracion
};
