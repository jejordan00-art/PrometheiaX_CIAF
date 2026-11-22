/**
 * PROMETHEIAX - SUITE DE PRUEBAS AUTOMATIZADAS
 * Verificación técnica de los requisitos del Taller Evaluativo Final (CIAF)
 * 
 * Casos evaluados:
 * 1. HTTP 200 al listar todas las solicitudes (GET /api/turnos)
 * 2. HTTP 200 al consultar una solicitud existente por ID (GET /api/turnos/:id)
 * 3. HTTP 404 al consultar un ID inexistente (GET /api/turnos/999999)
 * 4. HTTP 201 al crear una solicitud con atención prioritaria y recargo (POST /api/turnos)
 * 5. Verificación matemática exacta de la fórmula: totalPagar = precioBase + (precioBase * N * 2 / 100)
 * 6. HTTP 201 al crear una solicitud sin prioridad (precioBase sin recargo)
 * 7. HTTP 400 Bad Request cuando faltan campos obligatorios
 * 8. HTTP 400 Bad Request cuando precioBase <= 0 o no es numérico
 * 9. Persistencia de datos en data/turnos.json
 */

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Asegurar que usemos el módulo principal
const { app } = require('../index');
const turnosService = require('../services/turnos.service');

const PORT_TEST = 3099;
let server;

function realizarPeticion(metodo, ruta, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: PORT_TEST,
      path: ruta,
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (dataString) {
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(rawData);
        } catch {
          parsed = rawData;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (dataString) {
      req.write(dataString);
    }
    req.end();
  });
}

async function ejecutarPruebas() {
  console.log('\n=============================================================');
  console.log('   PROMETHEIAX — EJECUCIÓN DE PRUEBAS TÉCNICAS (CIAF)        ');
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
      console.error(`    Detalle: ${error.message}\n`);
    }
  }

  // Iniciar servidor en puerto de pruebas
  server = app.listen(PORT_TEST);

  try {
    // PRUEBA 1: GET /api/turnos
    await test('GET /api/turnos debe responder con HTTP 200 y un arreglo de turnos', async () => {
      const res = await realizarPeticion('GET', '/api/turnos');
      assert.strictEqual(res.statusCode, 200, `Esperaba status 200 pero obtuve ${res.statusCode}`);
      assert.strictEqual(res.body.exito, true);
      assert.ok(Array.isArray(res.body.datos), 'datos debe ser un arreglo');
    });

    // PRUEBA 2: GET /api/turnos/:id existente
    await test('GET /api/turnos/:id con ID existente debe responder con HTTP 200', async () => {
      // Tomamos el primer turno existente
      const lista = await realizarPeticion('GET', '/api/turnos');
      assert.ok(lista.body.datos.length > 0, 'Debe haber al menos un turno para la prueba');
      const primerTurno = lista.body.datos[0];

      const res = await realizarPeticion('GET', `/api/turnos/${primerTurno.id}`);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.exito, true);
      assert.strictEqual(String(res.body.datos.id), String(primerTurno.id));
      assert.strictEqual(res.body.datos.estudiante, primerTurno.estudiante);
    });

    // PRUEBA 3: GET /api/turnos/:id inexistente
    await test('GET /api/turnos/:id con ID inexistente debe responder con HTTP 404 Not Found', async () => {
      const res = await realizarPeticion('GET', '/api/turnos/999999');
      assert.strictEqual(res.statusCode, 404, `Esperaba 404 pero obtuve ${res.statusCode}`);
      assert.strictEqual(res.body.exito, false);
      assert.ok(res.body.error.includes('404'), 'El mensaje debe indicar 404');
    });

    // PRUEBA 4: POST /api/turnos con prioridad = true (calcula recargo N * 2%)
    await test('POST /api/turnos con prioritario=true debe responder HTTP 201 y aplicar recargo de N', async () => {
      const N = turnosService.obtenerParametroN();
      const porcentajeEsperado = N * 2;
      const precioBase = 200000;
      const recargoEsperado = Math.round((precioBase * porcentajeEsperado) / 100);
      const totalEsperado = precioBase + recargoEsperado;

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
      assert.ok(res.body.datos.id, 'Debe generar un ID');
      assert.strictEqual(res.body.datos.prioritario, true);
      assert.strictEqual(res.body.datos.parametroN, N);
      assert.strictEqual(res.body.datos.porcentajeRecargo, porcentajeEsperado);
      assert.strictEqual(res.body.datos.valorRecargo, recargoEsperado);
      assert.strictEqual(res.body.datos.totalPagar, totalEsperado);
    });

    // PRUEBA 5: POST /api/turnos con prioritario = false (sin recargo)
    await test('POST /api/turnos con prioritario=false debe responder HTTP 201 sin recargo', async () => {
      const precioBase = 120000;
      const nuevaSolicitud = {
        estudiante: "Juan David Romero",
        tipoServicio: "Tutoría personalizada",
        tema: "Normalización de Bases de Datos",
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

    // PRUEBA 6: POST /api/turnos con campos faltantes -> HTTP 400 Bad Request
    await test('POST /api/turnos con campos vacíos debe responder con HTTP 400 Bad Request', async () => {
      const solicitudIncompleta = {
        estudiante: "",
        tipoServicio: "Asesoría",
        // tema faltante
        fechaHora: "2026-12-10T10:00:00",
        precioBase: 100000
      };

      const res = await realizarPeticion('POST', '/api/turnos', solicitudIncompleta);
      assert.strictEqual(res.statusCode, 400, `Esperaba 400 pero obtuve ${res.statusCode}`);
      assert.strictEqual(res.body.exito, false);
      assert.ok(res.body.error.includes('400'), 'El error debe indicar 400 Bad Request');
    });

    // PRUEBA 7: POST /api/turnos con precioBase <= 0 -> HTTP 400 Bad Request
    await test('POST /api/turnos con precioBase <= 0 debe responder con HTTP 400 Bad Request', async () => {
      const solicitudPrecioInvalido = {
        estudiante: "Carlos Andrés Toro",
        tipoServicio: "Asesoría académica",
        tema: "Redes y Protocolos",
        fechaHora: "2026-12-15T11:00:00",
        precioBase: -50000, // Inválido
        prioritario: true
      };

      const res = await realizarPeticion('POST', '/api/turnos', solicitudPrecioInvalido);
      assert.strictEqual(res.statusCode, 400, `Esperaba 400 pero obtuve ${res.statusCode}`);
      assert.strictEqual(res.body.exito, false);
      assert.ok(
        JSON.stringify(res.body).toLowerCase().includes('preciobase'),
        'El mensaje de error debe mencionar el campo precioBase'
      );
    });

    // PRUEBA 8: Persistencia en disco
    await test('Verificar persistencia en data/turnos.json', async () => {
      const rutaDatos = path.join(__dirname, '..', 'data', 'turnos.json');
      assert.ok(fs.existsSync(rutaDatos), 'El archivo data/turnos.json debe existir');
      const contenido = JSON.parse(fs.readFileSync(rutaDatos, 'utf-8'));
      assert.ok(Array.isArray(contenido), 'El archivo JSON debe contener un arreglo');
      assert.ok(contenido.length >= 2, 'Debe haber registros guardados');
    });

    // PRUEBA 9: Configuración de la capa de servicios
    await test('Verificar cálculo directo en services/turnos.service.js', async () => {
      const calculo = turnosService.calcularTarifa(100000, true);
      const N = turnosService.obtenerParametroN();
      assert.strictEqual(calculo.parametroN, N);
      assert.strictEqual(calculo.porcentajeRecargo, N * 2);
      assert.strictEqual(calculo.totalPagar, 100000 + (100000 * N * 2 / 100));
    });

  } finally {
    server.close();
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
  if (server) server.close();
  process.exit(1);
});
