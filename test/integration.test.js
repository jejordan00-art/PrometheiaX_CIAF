/**
 * ==============================================================================
 * PROMETHEIAX — PRUEBAS DE INTEGRACIÓN Y ENDPOINTS (INTEGRATION TESTS)
 * Archivo: test/integration.test.js
 * ==============================================================================
 * Levanta el servidor en un puerto temporal y prueba todos los endpoints HTTP
 * verificando códigos de estado, cabeceras y estructura JSON de respuestas.
 */

const assert = require('assert');
const http = require('http');
const { app } = require('../index');

const PUERTO = 3091;
let servidor;

function peticionHttp(metodo, ruta, cuerpo = null) {
  return new Promise((resolve, reject) => {
    const data = cuerpo ? JSON.stringify(cuerpo) : null;
    const opts = {
      hostname: '127.0.0.1',
      port: PUERTO,
      path: ruta,
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function correrPruebasIntegracion() {
  console.log('\n--- 🌐 PRUEBAS DE INTEGRACIÓN (ENDPOINTS & PROTOCOLOS HTTP) ---');
  let pasadas = 0;
  let total = 0;

  async function test(desc, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✔ [INTEG-${total}] ${desc}`);
      pasadas++;
    } catch (err) {
      console.error(`  ✖ [FALLO INTEG-${total}] ${desc}`);
      console.error(`    Detalle: ${err.message}`);
    }
  }

  servidor = app.listen(PUERTO);

  try {
    // I1: GET /api
    await test('GET /api responde HTTP 200 OK con metadatos del servicio', async () => {
      const res = await peticionHttp('GET', '/api');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.plataforma, 'PrometheiaX');
    });

    // I2: GET /api/turnos
    await test('GET /api/turnos responde HTTP 200 OK con arreglo de solicitudes', async () => {
      const res = await peticionHttp('GET', '/api/turnos');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.exito, true);
      assert.ok(Array.isArray(res.body.datos));
    });

    // I3: GET /api/turnos/:id existente
    await test('GET /api/turnos/1 responde HTTP 200 OK con el turno #1', async () => {
      const res = await peticionHttp('GET', '/api/turnos/1');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.exito, true);
      assert.strictEqual(String(res.body.datos.id), '1');
    });

    // I4: GET /api/turnos/:id inexistente
    await test('GET /api/turnos/999999 responde HTTP 404 Not Found con mensaje descriptivo', async () => {
      const res = await peticionHttp('GET', '/api/turnos/999999');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.exito, false);
      assert.ok(res.body.error.includes('404'));
    });

    // I5: POST /api/turnos con prioridad
    await test('POST /api/turnos con prioridad calcula 20% y devuelve HTTP 201 Created', async () => {
      const payload = {
        estudiante: "Laura Ximena Sánchez",
        tipoServicio: "Tutoría de código",
        tema: "Arquitectura por capas",
        fechaHora: "2026-12-05T10:00:00",
        precioBase: 200000,
        prioritario: true
      };
      const res = await peticionHttp('POST', '/api/turnos', payload);
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.datos.porcentajeRecargo, 20);
      assert.strictEqual(res.body.datos.valorRecargo, 40000);
      assert.strictEqual(res.body.datos.totalPagar, 240000);
    });

    // I6: POST /api/turnos sin prioridad
    await test('POST /api/turnos sin prioridad no aplica recargo y devuelve HTTP 201 Created', async () => {
      const payload = {
        estudiante: "John Edison Jordan",
        tipoServicio: "Asesoría académica",
        tema: "Normalización de BD",
        fechaHora: "2026-12-06T15:00:00",
        precioBase: 150000,
        prioritario: false
      };
      const res = await peticionHttp('POST', '/api/turnos', payload);
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.datos.valorRecargo, 0);
      assert.strictEqual(res.body.datos.totalPagar, 150000);
    });

    // I7: POST /api/turnos con campos vacíos
    await test('POST /api/turnos con estudiante vacío rechaza con HTTP 400 Bad Request', async () => {
      const payload = {
        estudiante: "   ",
        tipoServicio: "Tutoría",
        tema: "Algoritmos",
        fechaHora: "2026-12-05T10:00:00",
        precioBase: 100000
      };
      const res = await peticionHttp('POST', '/api/turnos', payload);
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.exito, false);
      assert.ok(res.body.error.includes('400'));
    });

    // I8: POST /api/turnos con precioBase <= 0
    await test('POST /api/turnos con precioBase <= 0 rechaza con HTTP 400 Bad Request', async () => {
      const payload = {
        estudiante: "John Edison Jordan",
        tipoServicio: "Tutoría",
        tema: "Express",
        fechaHora: "2026-12-05T10:00:00",
        precioBase: -10000
      };
      const res = await peticionHttp('POST', '/api/turnos', payload);
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.exito, false);
    });

    // I9: GET ruta inexistente
    await test('GET a ruta inexistente /api/ruta-desconocida responde HTTP 404', async () => {
      const res = await peticionHttp('GET', '/api/ruta-desconocida');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.exito, false);
    });

    // I10: GET /api/foro
    await test('GET /api/foro responde HTTP 200 OK con hilos del foro académico', async () => {
      const res = await peticionHttp('GET', '/api/foro');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.exito, true);
    });

  } finally {
    servidor.close();
  }

  console.log(`  Subtotal Integración: ${pasadas}/${total} exitosas\n`);
  return { pasadas, total };
}

if (require.main === module) {
  correrPruebasIntegracion();
}

module.exports = { correrPruebasIntegracion };
