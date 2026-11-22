/**
 * ==============================================================================
 * PROMETHEIAX — API REST POR CAPAS (TALLER EVALUATIVO CIAF)
 * Archivo: controllers/turnos.controller.js
 * ==============================================================================
 * 
 * ¿QUÉ ES ESTA CAPA Y POR QUÉ ES VITAL?
 * La capa de Controladores ("Controllers") actúa como el recepcionista y oficial
 * de control de aduanas de nuestra aplicación web.
 * 
 * Responsabilidades estrictas según la rúbrica de CIAF:
 * 1. Recibir la petición HTTP entrante del cliente (`req`).
 * 2. Validar que los datos recibidos en formato JSON vengan completos y correctos.
 * 3. Si faltan datos o el precio es inválido (<= 0), rechazar con HTTP 400 Bad Request.
 * 4. Si se busca un ID que no existe, responder con HTTP 404 Not Found.
 * 5. Si todo está en orden, delegar el trabajo a la capa de servicios (`services/`).
 * 6. Entregar la respuesta HTTP al cliente (`res`) con los códigos correspondientes:
 *    - 200 OK: Para consultas exitosas.
 *    - 201 Created: Para registros nuevos exitosos.
 *    - 400 Bad Request: Para errores cometidos por el cliente al enviar datos.
 *    - 404 Not Found: Para recursos inexistentes.
 * ==============================================================================
 */

const turnosService = require('../services/turnos.service');

/**
 * ------------------------------------------------------------------------------
 * ENDPOINT 1: GET /api/turnos
 * ------------------------------------------------------------------------------
 * Retorna la lista completa de solicitudes de asesoría almacenadas en el sistema.
 * Código HTTP esperado: 200 OK.
 */
function obtenerTodos(req, res) {
  try {
    // Solicitamos a la capa de servicios que lea los registros
    const listaTurnos = turnosService.obtenerTodos();

    // Respondemos con código 200 OK y el paquete JSON
    return res.status(200).json({
      exito: true,
      total: listaTurnos.length,
      datos: listaTurnos
    });
  } catch (error) {
    console.error('Error no controlado al listar turnos:', error.message);
    // Si ocurriera una falla imprevista, respondemos 500 sin detener Node.js
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor (500)',
      mensaje: 'Ocurrió un problema inesperado al consultar las solicitudes.'
    });
  }
}

/**
 * ------------------------------------------------------------------------------
 * ENDPOINT 2: GET /api/turnos/:id
 * ------------------------------------------------------------------------------
 * Retorna la información detallada de una solicitud específica según su ID.
 * Códigos HTTP esperados:
 * - 200 OK: Si el ID existe en la persistencia.
 * - 404 Not Found: Si el ID no existe.
 */
function obtenerPorId(req, res) {
  try {
    // Extraemos el ID enviado en la ruta URL (ej: /api/turnos/1)
    const { id } = req.params;

    // Validación defensiva: Verificamos que el parámetro no venga vacío
    if (!id || id.trim() === '') {
      return res.status(400).json({
        exito: false,
        error: 'Identificador inválido (400 Bad Request)',
        mensaje: 'Debe incluir un identificador válido en la URL de consulta.'
      });
    }

    // Buscamos la solicitud a través del servicio
    const turno = turnosService.obtenerPorId(id);

    // REGLA CIAF: Si el recurso no existe, responder 404 Not Found
    if (!turno) {
      return res.status(404).json({
        exito: false,
        error: 'Recurso no encontrado (404 Not Found)',
        mensaje: `No existe ninguna solicitud de asesoría registrada con el identificador "${id}".`
      });
    }

    // Si existe, respondemos con código 200 OK y los datos del turno
    return res.status(200).json({
      exito: true,
      datos: turno
    });
  } catch (error) {
    console.error('Error no controlado al consultar turno por ID:', error.message);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor (500)',
      mensaje: 'Ocurrió un problema inesperado al buscar la solicitud.'
    });
  }
}

/**
 * ------------------------------------------------------------------------------
 * ENDPOINT 3: POST /api/turnos
 * ------------------------------------------------------------------------------
 * Registra una nueva solicitud de asesoría académica a partir del cuerpo JSON.
 * Códigos HTTP esperados:
 * - 201 Created: Cuando los datos son válidos y la asesoría fue registrada.
 * - 400 Bad Request: Cuando faltan campos o el precio es menor o igual a cero.
 */
function crearTurno(req, res) {
  try {
    // Verificación inicial: Que la petición contenga un cuerpo JSON
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        exito: false,
        error: 'Cuerpo de petición vacío (400 Bad Request)',
        mensaje: 'Debe enviar un objeto JSON con los datos de la solicitud de asesoría.'
      });
    }

    const { estudiante, tipoServicio, tema, fechaHora, precioBase, prioritario } = req.body;

    // Arreglo para acumular todos los errores de validación de entrada
    const listaErrores = [];

    // Validación 1: Campo "estudiante"
    if (!estudiante || typeof estudiante !== 'string' || estudiante.trim() === '') {
      listaErrores.push('El campo "estudiante" es obligatorio y debe ser un texto con el nombre del alumno.');
    }

    // Validación 2: Campo "tipoServicio"
    if (!tipoServicio || typeof tipoServicio !== 'string' || tipoServicio.trim() === '') {
      listaErrores.push('El campo "tipoServicio" es obligatorio (ej: "Asesoría académica", "Tutoría de código").');
    }

    // Validación 3: Campo "tema"
    if (!tema || typeof tema !== 'string' || tema.trim() === '') {
      listaErrores.push('El campo "tema" es obligatorio (ej: "Arquitectura de software por capas").');
    }

    // Validación 4: Campo "fechaHora"
    if (!fechaHora || typeof fechaHora !== 'string' || fechaHora.trim() === '') {
      listaErrores.push('El campo "fechaHora" es obligatorio (en formato estándar ISO 8601 ej: "2026-12-05T10:00:00").');
    } else {
      const fechaValida = new Date(fechaHora);
      if (isNaN(fechaValida.getTime())) {
        listaErrores.push('El campo "fechaHora" no tiene un formato de fecha y hora válido.');
      }
    }

    // Validación 5: Campo "precioBase" (Estricto numérico y mayor que cero según rúbrica)
    if (precioBase === undefined || precioBase === null || precioBase === '') {
      listaErrores.push('El campo "precioBase" es obligatorio.');
    } else {
      const precioNumerico = Number(precioBase);
      if (isNaN(precioNumerico)) {
        listaErrores.push('El campo "precioBase" debe ser un valor numérico.');
      } else if (precioNumerico <= 0) {
        // REGLA CIAF EXPLÍCITA: Valores menores o iguales a cero deben rechazarse con 400
        listaErrores.push('El campo "precioBase" debe ser estrictamente mayor a cero (> 0). Valores menores o iguales a cero no son permitidos.');
      }
    }

    // Si se encontró algún fallo de validación, respondemos inmediatamente con 400
    if (listaErrores.length > 0) {
      return res.status(400).json({
        exito: false,
        error: 'Validación de entrada fallida (400 Bad Request)',
        detalles: listaErrores,
        mensaje: 'La solicitud contiene campos faltantes o valores inválidos y no pudo procesarse.'
      });
    }

    // Pasamos los datos limpios a la capa de servicios para que ejecute la regla N y guarde
    const turnoCreado = turnosService.crearTurno({
      estudiante,
      tipoServicio,
      tema,
      fechaHora,
      precioBase: Number(precioBase),
      prioritario: Boolean(prioritario)
    });

    // Respondemos con HTTP 201 Created y el nuevo turno generado
    return res.status(201).json({
      exito: true,
      mensaje: 'Solicitud de asesoría académica registrada exitosamente.',
      datos: turnoCreado
    });

  } catch (error) {
    console.error('Error no controlado al crear turno:', error.message);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor (500)',
      mensaje: 'Ocurrió un problema inesperado al registrar la solicitud.'
    });
  }
}

/**
 * ------------------------------------------------------------------------------
 * ENDPOINT ADICIONAL: GET /api/turnos/configuracion
 * ------------------------------------------------------------------------------
 * Informa el valor actual de N y el porcentaje de recargo para que el frontend
 * y el profesor puedan auditarlo en vivo.
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
      error: 'Error al consultar configuración'
    });
  }
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crearTurno,
  obtenerConfiguracion
};
