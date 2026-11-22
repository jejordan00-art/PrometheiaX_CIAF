/**
 * PROMETHEIAX - API REST
 * Capa de Servicios: services/turnos.service.js
 * 
 * Responsabilidad estricta según rúbrica CIAF:
 * - Contiene toda la lógica de negocio.
 * - Realiza los cálculos matemáticos (regla de negocio parametrizada por N).
 * - Gestiona la lectura y persistencia de datos en data/turnos.json.
 */

const fs = require('fs');
const path = require('path');

const RUTA_DATOS = path.join(__dirname, '..', 'data', 'turnos.json');

/**
 * Obtiene el parámetro N asignado al equipo.
 * Se lee desde la variable de entorno EQUIPO_N.
 * Por defecto es 7 si no está configurada.
 * 
 * Regla CIAF:
 * Se ordenan alfabéticamente por apellido los integrantes del equipo.
 * N = número de lista oficial del primer integrante.
 */
function obtenerParametroN() {
  const nEnv = process.env.EQUIPO_N;
  const n = parseInt(nEnv, 10);
  return (!isNaN(n) && n > 0) ? n : 10;
}

/**
 * Lee la lista de turnos desde el archivo JSON de persistencia.
 * Si el archivo no existe, lo inicializa con un arreglo vacío.
 */
function leerDatos() {
  try {
    if (!fs.existsSync(RUTA_DATOS)) {
      const carpeta = path.dirname(RUTA_DATOS);
      if (!fs.existsSync(carpeta)) {
        fs.mkdirSync(carpeta, { recursive: true });
      }
      fs.writeFileSync(RUTA_DATOS, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const contenido = fs.readFileSync(RUTA_DATOS, 'utf-8');
    if (!contenido.trim()) {
      return [];
    }
    return JSON.parse(contenido);
  } catch (error) {
    console.error('Error al leer data/turnos.json:', error.message);
    return [];
  }
}

/**
 * Escribe la lista de turnos en el archivo JSON de persistencia.
 */
function guardarDatos(turnos) {
  try {
    const carpeta = path.dirname(RUTA_DATOS);
    if (!fs.existsSync(carpeta)) {
      fs.mkdirSync(carpeta, { recursive: true });
    }
    fs.writeFileSync(RUTA_DATOS, JSON.stringify(turnos, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error al guardar en data/turnos.json:', error.message);
    throw new Error('No se pudo guardar la información en el almacenamiento local.');
  }
}

/**
 * Aplica la regla de negocio N para calcular la tarifa:
 * 
 * porcentajeRecargo = N * 2%
 * Si prioritario = true:
 *   totalPagar = precioBase + (precioBase * porcentajeRecargo / 100)
 * Si prioritario = false o no especificado:
 *   totalPagar = precioBase
 */
function calcularTarifa(precioBase, esPrioritario) {
  const N = obtenerParametroN();
  const porcentajeRecargo = N * 2;
  const precioNumerico = Number(precioBase);

  const prioritario = Boolean(esPrioritario);

  if (prioritario) {
    const valorRecargo = Math.round((precioNumerico * porcentajeRecargo) / 100);
    const totalPagar = precioNumerico + valorRecargo;
    return {
      parametroN: N,
      porcentajeRecargo,
      valorRecargo,
      totalPagar,
      prioritario: true
    };
  } else {
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
 * Retorna todos los turnos almacenados.
 */
function obtenerTodos() {
  return leerDatos();
}

/**
 * Retorna un turno por su identificador.
 * Si no existe, retorna null.
 */
function obtenerPorId(id) {
  const turnos = leerDatos();
  const turnoEncontrado = turnos.find(t => String(t.id) === String(id));
  return turnoEncontrado || null;
}

/**
 * Registra una nueva solicitud de asesoría académica, calcula la tarifa
 * aplicando la regla del equipo N y la persiste en data/turnos.json.
 */
function crearTurno(datos) {
  const turnos = leerDatos();

  // Generar ID único incremental
  let siguienteId = 1;
  if (turnos.length > 0) {
    const idsNumericos = turnos
      .map(t => parseInt(t.id, 10))
      .filter(num => !isNaN(num));
    if (idsNumericos.length > 0) {
      siguienteId = Math.max(...idsNumericos) + 1;
    } else {
      siguienteId = turnos.length + 1;
    }
  }

  // Ejecución del cálculo de tarifa en la capa de servicios
  const calculo = calcularTarifa(datos.precioBase, datos.prioritario);

  const nuevoTurno = {
    id: String(siguienteId),
    estudiante: datos.estudiante.trim(),
    tipoServicio: datos.tipoServicio.trim(),
    tema: datos.tema.trim(),
    fechaHora: datos.fechaHora,
    precioBase: Number(datos.precioBase),
    prioritario: calculo.prioritario,
    parametroN: calculo.parametroN,
    porcentajeRecargo: calculo.porcentajeRecargo,
    valorRecargo: calculo.valorRecargo,
    totalPagar: calculo.totalPagar,
    estado: datos.estado || 'Confirmada',
    creadoEn: new Date().toISOString()
  };

  turnos.push(nuevoTurno);
  guardarDatos(turnos);

  return nuevoTurno;
}

/**
 * Devuelve la configuración actual de negocio (N y porcentaje aplicable)
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
