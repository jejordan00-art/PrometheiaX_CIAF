/**
 * ==============================================================================
 * PROMETHEIAX — SUITE DE PRUEBAS TÉCNICAS AUTOMATIZADAS
 * Archivo: test/turnos.test.js
 * ==============================================================================
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Ejecuta una batería completa de 9 pruebas automáticas directamente contra el
 * servidor Express para verificar el 100% de los requisitos del taller de CIAF.
 * 
 * Requisitos evaluados:
 * 1. HTTP 200 OK al listar todos los turnos (GET /api/turnos).
 * 2. HTTP 200 OK al consultar un ID que existe (GET /api/turnos/:id).
 * 3. HTTP 404 Not Found al consultar un ID inexistente (GET /api/turnos/999999).
 * 4. HTTP 201 Created al registrar un turno con atención prioritaria y recargo (POST /api/turnos).
 * 5. Verificación matemática exacta de la fórmula: totalPagar = precioBase + (precioBase * 20 / 100).
 * 6. HTTP 201 Created al registrar un turno sin prioridad (sin recargo).
 * 7. HTTP 400 Bad Request cuando faltan campos obligatorios.
 * 8. HTTP 400 Bad Request cuando el precio base es menor o igual a cero (<= 0).
 * 9. Persistencia en disco verificada en data/turnos.json.
 * ==============================================================================
 */

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

const { app } = require('../index');
const turnosService = require('../services/turnos.service');

// Puerto temporal aislado para no interferir con el servidor de desarrollo
const PUERTO_TEST = 3099;
let servidorPrueba;

/**
 * Función auxiliar para realizar peticiones HTTP nativas sin librerías externas.
 */
function realizarPeticion(metodo, ruta, cuerpo = null) {
  return new Promise((resolve, reject) => {
    const cuerpoString = cuerpo ? JSON.stringify(cuerpo) : null;
    const opciones = {
      hostname: '127.0.0.1',
      port: PUERTO_TEST,
      path: ruta,
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (cuerpoString) {
      opciones.headers['Content-Length'] = Buffer.byteLength(cuerpoString);
    }

    const peticion = http.request(opciones, (respuesta) => {
      let datosCrudos = '';
      respuesta.on('data', (fragmento) => {
        datosCrudos += fragmento;
      });
      respuesta.on('end', () => {
        let cuerpoParseado = null;
        try {
          cuerpoParseado = JSON.parse(datosCrudos);
        } catch {
          cuerpoParseado = datosCrudos;
        }
        resolve({
          statusCode: respuesta.statusCode,
          headers: respuesta.headers,
          body: cuerpoParseado
        });
      });
    });

    peticion.on('error', (err) => {
      reject(err);
    });

    if (cuerpoString) {
      peticion.write(cuerpoString);
    }
    peticion.end();
  });
}

/**
 * Runner principal de pruebas automatizadas
 */
async function ejecutarPruebas() {
  console.log('\n=============================================================');
  console.log('   PROMETHEIAX — SUITE DE PRUEBAS TÉCNICAS (CIAF)            ');
  console.log('   Integrantes: John Edison Jordan (#10) y Laura Sánchez (#19)');
  console.log('=============================================================\n');

  let pasadas = 0;
  let total = 0;

  async function test(descripcion, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✔ [PRUEBA ${total}] ${descripcion}`);
      pasadas++;
    } catch (error) {
      console.error(`  ✖ [FALLO ${total}] ${descripcion}`);
      console.error(`    Detalle técnico: ${error.message}\n`);
    }
  }

  // Iniciamos el servidor en el puerto temporal
  servidorPrueba = app.listen(PUERTO_TEST);

  try {
    // --------------------------------------------------------------------------
    // PRUEBA 1: Listar todas las solicitudes (GET /api/turnos -> 200 OK)
    // --------------------------------------------------------------------------
    await test('GET /api/turnos debe responder con HTTP 200 y un arreglo de turnos', async () => {
      const res = await realizarPeticion('GET', '/api/turnos');
      assert.strictEqual(res.statusCode, 200, `Esperaba status 200 pero obtuve ${res.statusCode}`);
      assert.strictEqual(res.body.exito, true, 'La propiedad exito debe ser true');
      assert.ok(Array.isArray(res.body.datos), 'La propiedad datos debe ser un arreglo');
    });

    // --------------------------------------------------------------------------
    // PRUEBA 2: Consultar solicitud existente (GET /api/turnos/:id -> 200 OK)
    // --------------------------------------------------------------------------
    await test('GET /api/turnos/:id con ID existente debe responder con HTTP 200 OK', async () => {
      const lista = await realizarPeticion('GET', '/api/turnos');
      assert.ok(lista.body.datos.length > 0, 'Debe haber al menos un turno guardado');
      const primerTurno = lista.body.datos[0];

      const res = await realizarPeticion('GET', `/api/turnos/${primerTurno.id}`);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.exito, true);
      assert.strictEqual(String(res.body.datos.id), String(primerTurno.id));
    });

    // --------------------------------------------------------------------------
    // PRUEBA 3: Consultar ID inexistente (GET /api/turnos/999999 -> 404 Not Found)
    // --------------------------------------------------------------------------
    await test('GET /api/turnos/:id con ID inexistente debe responder con HTTP 404 Not Found', async () => {
      const res = await realizarPeticion('GET', '/api/turnos/999999');
      assert.strictEqual(res.statusCode, 404, `Esperaba 404 pero obtuve ${res.statusCode}`);
      assert.strictEqual(res.body.exito, false);
      assert.ok(res.body.error.includes('404'), 'El mensaje debe indicar código 404');
    });

    // --------------------------------------------------------------------------
    // PRUEBA 4: Crear solicitud con prioridad (POST /api/turnos -> 201 Created y Recargo N)
    // --------------------------------------------------------------------------
    await test('POST /api/turnos con prioritario=true debe responder HTTP 201 y aplicar recargo de N=10 (20%)', async () => {
      const N = turnosService.obtenerParametroN();
      const porcentajeEsperado = N * 2; // 10 * 2 = 20%
      const precioBase = 200000;
      const recargoEsperado = Math.round((precioBase * porcentajeEsperado) / 100); // 40.000
      const totalEsperado = precioBase + recargoEsperado; // 240.000

      const nuevaSolicitud = {
        estudiante: "Laura Ximena Sánchez",
        tipoServicio: "Asesoría académica",
        tema: "Arquitectura de Software y Patrones de Diseño",
        fechaHora: "2026-12-10T15:00:00",
        precioBase: precioBase,
        prioritario: true
      };

      const res = await realizarPeticion('POST', '/api/turnos', nuevaSolicitud);
      assert.strictEqual(res.statusCode, 201, `Esperaba 201 pero obtuve ${res.statusCode}`);
      assert.strictEqual(res.body.exito, true);
      assert.strictEqual(res.body.datos.prioritario, true);
      assert.strictEqual(res.body.datos.parametroN, N);
      assert.strictEqual(res.body.datos.porcentajeRecargo, porcentajeEsperado);
      assert.strictEqual(res.body.datos.valorRecargo, recargoEsperado);
      assert.strictEqual(res.body.datos.totalPagar, totalEsperado);
    });

    // --------------------------------------------------------------------------
    // PRUEBA 5: Crear solicitud sin prioridad (POST /api/turnos -> 201 sin recargo)
    // --------------------------------------------------------------------------
    await test('POST /api/turnos con prioritario=false debe responder HTTP 201 sin recargo', async () => {
      const precioBase = 150000;
      const nuevaSolicitud = {
        estudiante: "John Edison Jordan",
        tipoServicio: "Tutoría personalizada",
        tema: "Validaciones y Control de Errores HTTP",
        fechaHora: "2026-12-12T09:00:00",
        precioBase: precioBase,
        prioritario: false
      };

      const res = await realizarPeticion('POST', '/api/turnos', nuevaSolicitud);
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.datos.prioritario, false);
      assert.strictEqual(res.body.datos.valorRecargo, 0);
      assert.strictEqual(res.body.datos.totalPagar, precioBase);
    });

    // --------------------------------------------------------------------------
    // PRUEBA 6: Validación de campos vacíos o faltantes (POST -> 400 Bad Request)
    // --------------------------------------------------------------------------
    await test('POST /api/turnos con campos vacíos debe responder con HTTP 400 Bad Request', async () => {
      const solicitudIncompleta = {
        estudiante: "",
        tipoServicio: "Asesoría",
        // tema omitido intencionalmente
        fechaHora: "2026-12-10T10:00:00",
        precioBase: 100000
      };

      const res = await realizarPeticion('POST', '/api/turnos', solicitudIncompleta);
      assert.strictEqual(res.statusCode, 400, `Esperaba 400 pero obtuve ${res.statusCode}`);
      assert.strictEqual(res.body.exito, false);
      assert.ok(res.body.error.includes('400'), 'El error debe indicar 400 Bad Request');
    });

    // --------------------------------------------------------------------------
    // PRUEBA 7: Validación de precioBase <= 0 (POST -> 400 Bad Request)
    // --------------------------------------------------------------------------
    await test('POST /api/turnos con precioBase <= 0 debe responder con HTTP 400 Bad Request', async () => {
      const solicitudPrecioInvalido = {
        estudiante: "John Edison Jordan",
        tipoServicio: "Asesoría académica",
        tema: "Redes y Protocolos",
        fechaHora: "2026-12-15T11:00:00",
        precioBase: -50000, // Inválido según la rúbrica CIAF
        prioritario: true
      };

      const res = await realizarPeticion('POST', '/api/turnos', solicitudPrecioInvalido);
      assert.strictEqual(res.statusCode, 400, `Esperaba 400 pero obtuve ${res.statusCode}`);
      assert.strictEqual(res.body.exito, false);
      assert.ok(
        JSON.stringify(res.body).toLowerCase().includes('preciobase'),
        'El mensaje de error debe señalar el campo precioBase'
      );
    });

    // --------------------------------------------------------------------------
    // PRUEBA 8: Persistencia en disco (data/turnos.json)
    // --------------------------------------------------------------------------
    await test('Verificar persistencia real en data/turnos.json', async () => {
      const rutaDatos = path.join(__dirname, '..', 'data', 'turnos.json');
      assert.ok(fs.existsSync(rutaDatos), 'El archivo data/turnos.json debe existir');
      const contenido = JSON.parse(fs.readFileSync(rutaDatos, 'utf-8'));
      assert.ok(Array.isArray(contenido), 'El archivo JSON debe contener un arreglo');
      assert.ok(contenido.length >= 2, 'Debe haber registros guardados en disco');
    });

    // --------------------------------------------------------------------------
    // PRUEBA 9: Cálculo matemático directo en services/turnos.service.js
    // --------------------------------------------------------------------------
    await test('Verificar cálculo matemático directo en services/turnos.service.js', async () => {
      const calculo = turnosService.calcularTarifa(100000, true);
      const N = turnosService.obtenerParametroN();
      assert.strictEqual(calculo.parametroN, N);
      assert.strictEqual(calculo.porcentajeRecargo, N * 2);
      assert.strictEqual(calculo.totalPagar, 100000 + (100000 * N * 2 / 100));
    });

  } finally {
    servidorPrueba.close();
  }

  console.log('\n-------------------------------------------------------------');
  console.log(` RESULTADO FINAL: ${pasadas}/${total} PRUEBAS EXITOSAS (${Math.round((pasadas/total)*100)}%)`);
  console.log('-------------------------------------------------------------\n');

  if (pasadas !== total) {
    process.exit(1);
  }
}

ejecutarPruebas().catch(err => {
  console.error('Error fatal al ejecutar pruebas:', err);
  if (servidorPrueba) servidorPrueba.close();
  process.exit(1);
});
