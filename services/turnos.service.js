/**
 * ==============================================================================
 * PROMETHEIAX — API REST POR CAPAS (TALLER EVALUATIVO CIAF)
 * Archivo: services/turnos.service.js
 * ==============================================================================
 * 
 * ¿QUÉ ES ESTA CAPA Y POR QUÉ ES VITAL?
 * La capa de Servicios ("Services") es el corazón y cerebro del negocio.
 * Aquí se concentra toda la lógica operativa, las reglas de cálculo matemático
 * y la persistencia de datos en disco.
 * 
 * Regla de oro de arquitectura limpia:
 * Los controladores solo atienden peticiones web (HTTP). Los servicios resuelven
 * el problema real del negocio. Por eso, este archivo NO conoce nada de `req` ni
 * de `res`, lo que permite que esta lógica pueda reutilizarse en cualquier momento.
 * 
 * INTEGRANTES DEL EQUIPO (GRUPO 1 MARTES):
 * 1. Jordan Rivas, John Edison       -> Puesto oficial de lista CIAF: #10 (N = 10)
 * 2. Sánchez Rodríguez, Laura Ximena  -> Puesto oficial de lista CIAF: #19
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

// Ruta absoluta y segura hacia el archivo donde guardamos las solicitudes en disco
const RUTA_DATOS = path.join(__dirname, '..', 'data', 'turnos.json');

/**
 * ------------------------------------------------------------------------------
 * 1. OBTENCIÓN DEL PARÁMETRO N DEL EQUIPO
 * ------------------------------------------------------------------------------
 * Regla oficial del taller (Pág. 2 y 3 del PDF):
 * "Se ordenan alfabéticamente por apellido los integrantes del equipo según el
 * listado oficial de asistencia. El valor de N corresponde al número de lista
 * del primer integrante en dicho orden."
 * 
 * En nuestro equipo:
 * - Jordan Rivas, John Edison (Letra 'J') -> Casilla oficial #10.
 * - Sánchez Rodríguez, Laura Ximena (Letra 'S') -> Casilla oficial #19.
 * 
 * Como la 'J' va primero en el abecedario, el primer integrante es John Edison
 * y por lo tanto N = 10.
 * 
 * La función lee primero la variable de entorno `EQUIPO_N` del archivo `.env`.
 * Si por alguna razón no estuviera configurada, usa 10 como valor de respaldo seguro.
 * 
 * @returns {number} Valor numérico de N (10 para nuestro equipo).
 */
function obtenerParametroN() {
  const variableEntorno = process.env.EQUIPO_N;
  const numeroConvertido = parseInt(variableEntorno, 10);

  // Verificamos que sea un número válido y estrictamente mayor que cero
  if (!isNaN(numeroConvertido) && numeroConvertido > 0) {
    return numeroConvertido;
  }

  // Respaldo oficial de nuestro equipo
  return 10;
}

/**
 * ------------------------------------------------------------------------------
 * 2. LECTURA DEFENSIVA DE DATOS (data/turnos.json)
 * ------------------------------------------------------------------------------
 * Lee el archivo JSON local donde están guardadas las solicitudes.
 * Es defensiva porque si la carpeta o el archivo aún no existen, los crea
 * automáticamente con un arreglo vacío `[]` para que el servidor nunca colapse.
 * 
 * @returns {Array} Lista de solicitudes registradas en memoria.
 */
function leerDatos() {
  try {
    // Si el archivo no existe en el disco, lo creamos de una vez
    if (!fs.existsSync(RUTA_DATOS)) {
      const carpetaContenedora = path.dirname(RUTA_DATOS);
      if (!fs.existsSync(carpetaContenedora)) {
        fs.mkdirSync(carpetaContenedora, { recursive: true });
      }
      fs.writeFileSync(RUTA_DATOS, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }

    // Leemos el texto plano del archivo
    const textoJson = fs.readFileSync(RUTA_DATOS, 'utf-8');

    // Si el archivo estuviera en blanco, retornamos un arreglo vacío
    if (!textoJson.trim()) {
      return [];
    }

    // Convertimos el texto JSON a un arreglo de objetos JavaScript
    return JSON.parse(textoJson);
  } catch (error) {
    console.error('Error al intentar leer data/turnos.json:', error.message);
    // En caso de fallo imprevisto, retornamos un arreglo vacío para proteger el sistema
    return [];
  }
}

/**
 * ------------------------------------------------------------------------------
 * 3. ESCRITURA Y PERSISTENCIA SEGURA (data/turnos.json)
 * ------------------------------------------------------------------------------
 * Guarda la lista completa de solicitudes en el archivo local JSON.
 * Formatea el texto con 2 espacios de indentación para que sea fácilmente legible
 * por cualquier persona que abra el archivo en VS Code o Bloc de Notas.
 * 
 * @param {Array} listaTurnos Arreglo actualizado de solicitudes.
 * @returns {boolean} True si se guardó correctamente.
 */
function guardarDatos(listaTurnos) {
  try {
    const carpetaContenedora = path.dirname(RUTA_DATOS);
    if (!fs.existsSync(carpetaContenedora)) {
      fs.mkdirSync(carpetaContenedora, { recursive: true });
    }

    // Guardamos con indentación de 2 espacios (pretty print)
    fs.writeFileSync(RUTA_DATOS, JSON.stringify(listaTurnos, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error crítico al escribir en data/turnos.json:', error.message);
    throw new Error('No se pudo guardar la información en el almacenamiento local.');
  }
}

/**
 * ------------------------------------------------------------------------------
 * 4. CÁLCULO MATEMÁTICO DE TARIFAS (REGLA OFICIAL DE NEGOCIO CIAF)
 * ------------------------------------------------------------------------------
 * Fórmula exigida en el PDF (Página 3):
 * porcentajeRecargo = N * 2%
 * 
 * Para nuestro equipo (N = 10):
 * porcentajeRecargo = 10 * 2% = 20%
 * 
 * Reglas de aplicación:
 * - Si prioritario === true:
 *     recargo = precioBase * 20 / 100
 *     totalPagar = precioBase + recargo
 * 
 * - Si prioritario === false o no se especifica:
 *     recargo = 0
 *     totalPagar = precioBase
 * 
 * @param {number} precioBase Valor numérico base de la sesión académica.
 * @param {boolean} esPrioritario Si el estudiante solicitó atención prioritaria.
 * @returns {Object} Desglose matemático completo con N, porcentajes y total.
 */
function calcularTarifa(precioBase, esPrioritario) {
  const N = obtenerParametroN();
  const porcentajeOficial = N * 2; // Para nosotros: 10 * 2 = 20%
  const precioNumerico = Number(precioBase);
  const prioridadActiva = Boolean(esPrioritario);

  if (prioridadActiva) {
    // Calculamos el valor del 20% de recargo y lo redondeamos a pesos enteros
    const valorRecargo = Math.round((precioNumerico * porcentajeOficial) / 100);
    const totalPagar = precioNumerico + valorRecargo;

    return {
      parametroN: N,
      porcentajeRecargo: porcentajeOficial,
      valorRecargo: valorRecargo,
      totalPagar: totalPagar,
      prioritario: true
    };
  } else {
    // Sin prioridad: No hay recargo y el total es exactamente el precio base
    return {
      parametroN: N,
      porcentajeRecargo: 0,
      valorRecargo: 0,
      totalPagar: precioNumerico,
      prioritario: false
    };
  }
}

/**
 * ------------------------------------------------------------------------------
 * 5. CONSULTAR TODAS LAS SOLICITUDES
 * ------------------------------------------------------------------------------
 * Devuelve todas las solicitudes de asesoría existentes en el archivo JSON.
 * Atiende al endpoint: GET /api/turnos
 * 
 * @returns {Array} Lista de solicitudes registradas.
 */
function obtenerTodos() {
  return leerDatos();
}

/**
 * ------------------------------------------------------------------------------
 * 6. CONSULTAR UNA SOLICITUD ESPECÍFICA POR ID
 * ------------------------------------------------------------------------------
 * Busca en la lista una solicitud cuyo ID coincida con el solicitado.
 * Atiende al endpoint: GET /api/turnos/:id
 * 
 * @param {string|number} id Identificador único a buscar.
 * @returns {Object|null} El objeto de la solicitud encontrada o null si no existe.
 */
function obtenerPorId(id) {
  const turnos = leerDatos();
  // Comparamos como string para admitir tanto '1' como 1
  const turnoEncontrado = turnos.find(t => String(t.id) === String(id));
  return turnoEncontrado || null;
}

/**
 * ------------------------------------------------------------------------------
 * 7. CREAR Y REGISTRAR UNA NUEVA SOLICITUD
 * ------------------------------------------------------------------------------
 * Atiende al endpoint: POST /api/turnos
 * 
 * Pasos que realiza:
 * 1. Lee las solicitudes actuales.
 * 2. Genera un nuevo ID autoincremental único (1, 2, 3...).
 * 3. Ejecuta el cálculo matemático de la tarifa aplicando el recargo de N = 10.
 * 4. Construye el objeto final con fecha de creación en estándar ISO.
 * 5. Guarda el arreglo en `data/turnos.json`.
 * 6. Retorna el objeto creado listo para responder al cliente.
 * 
 * @param {Object} datosTurno Información validada que viene del controlador.
 * @returns {Object} Solicitud creada con ID y cálculos completos.
 */
function crearTurno(datosTurno) {
  const turnosExistentes = leerDatos();

  // Generamos un ID autoincremental de forma confiable
  let siguienteId = 1;
  if (turnosExistentes.length > 0) {
    const idsNumericos = turnosExistentes
      .map(t => parseInt(t.id, 10))
      .filter(num => !isNaN(num));

    if (idsNumericos.length > 0) {
      siguienteId = Math.max(...idsNumericos) + 1;
    } else {
      siguienteId = turnosExistentes.length + 1;
    }
  }

  // Ejecutamos la regla de negocio y cálculo matemático en esta capa
  const calculo = calcularTarifa(datosTurno.precioBase, datosTurno.prioritario);

  // Armamos el objeto con formato limpio y consistente
  const nuevoTurno = {
    id: String(siguienteId),
    estudiante: datosTurno.estudiante.trim(),
    tipoServicio: datosTurno.tipoServicio.trim(),
    tema: datosTurno.tema.trim(),
    fechaHora: datosTurno.fechaHora,
    precioBase: Number(datosTurno.precioBase),
    prioritario: calculo.prioritario,
    parametroN: calculo.parametroN,
    porcentajeRecargo: calculo.porcentajeRecargo,
    valorRecargo: calculo.valorRecargo,
    totalPagar: calculo.totalPagar,
    estado: datosTurno.estado || 'Confirmada',
    creadoEn: new Date().toISOString()
  };

  // Agregamos al arreglo y persistimos en disco
  turnosExistentes.push(nuevoTurno);
  guardarDatos(turnosExistentes);

  return nuevoTurno;
}

/**
 * ------------------------------------------------------------------------------
 * 8. OBTENER INFORMACIÓN DE CONFIGURACIÓN DEL NEGOCIO
 * ------------------------------------------------------------------------------
 * Permite que el frontend y las pruebas conozcan qué N está activo y
 * cuál es el porcentaje aplicable en cualquier momento.
 * 
 * @returns {Object} Detalle de N y porcentaje.
 */
function obtenerConfiguracionNegocio() {
  const N = obtenerParametroN();
  return {
    parametroN: N,
    porcentajeRecargo: N * 2,
    formula: `totalPagar = precioBase + (precioBase * (${N} * 2) / 100)`
  };
}

module.exports = {
  obtenerParametroN,
  calcularTarifa,
  obtenerTodos,
  obtenerPorId,
  crearTurno,
  obtenerConfiguracionNegocio
};
