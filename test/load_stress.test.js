/**
 * ==============================================================================
 * PROMETHEIAX — PRUEBAS DE CARGA, ESTRÉS Y CONCURRENCIA (LOAD & CONCURRENCY)
 * Archivo: test/load_stress.test.js
 * ==============================================================================
 * Dispara ráfagas de múltiples peticiones HTTP simultáneas en paralelo
 * para verificar la resistencia, tiempos de respuesta y consistencia de datos
 * sin bloqueos en el almacenamiento local JSON.
 */

const assert = require('assert');
const http = require('http');
const { app } = require('../index');

const PUERTO = 3093;
let servidor;

function peticionAsync(metodo, ruta, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: '127.0.0.1',
      port: PUERTO,
      path: ruta,
      method: metodo,
      headers: { 'Content-Type': 'application/json' }
    };
    if (dataString) opts.headers['Content-Length'] = Buffer.byteLength(dataString);

    const t0 = Date.now();
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        const ms = Date.now() - t0;
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, ms, body: parsed });
      });
    });
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function correrPruebasCarga() {
  console.log('\n--- ⚡ PRUEBAS DE CARGA Y CONCURRENCIA (STRESS & CONCURRENCY) ---');
  let pasadas = 0;
  let total = 0;

  async function test(desc, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✔ [LOAD-${total}] ${desc}`);
      pasadas++;
    } catch (err) {
      console.error(`  ✖ [FALLO LOAD-${total}] ${desc}`);
      console.error(`    Detalle: ${err.message}`);
    }
  }

  servidor = app.listen(PUERTO);

  try {
    // L1: Ráfaga de 30 consultas GET concurrentes
    await test('Ráfaga de 30 consultas GET /api/turnos en paralelo', async () => {
      const promesas = [];
      const inicio = Date.now();

      for (let i = 0; i < 30; i++) {
        promesas.push(peticionAsync('GET', '/api/turnos'));
      }

      const resultados = await Promise.all(promesas);
      const duracionTotal = Date.now() - inicio;

      const todos200 = resultados.every(r => r.status === 200);
      assert.ok(todos200, 'Todas las peticiones deben retornar 200 OK');

      const tiempoPromedio = Math.round(resultados.reduce((acc, r) => acc + r.ms, 0) / resultados.length);
      console.log(`    📊 Métricas: 30 peticiones en ${duracionTotal}ms (Promedio: ${tiempoPromedio}ms/req)`);
      assert.ok(duracionTotal < 2000, 'El tiempo total debe ser menor a 2 segundos');
    });

    // L2: Ráfaga de 15 creaciones POST concurrentes
    await test('Ráfaga de 15 registros POST /api/turnos simultáneos (verificar IDs únicos)', async () => {
      const promesas = [];

      for (let i = 0; i < 15; i++) {
        promesas.push(peticionAsync('POST', '/api/turnos', {
          estudiante: `Estudiante Concurrente #${i + 1}`,
          tipoServicio: "Tutoría de código",
          tema: `Prueba de concurrencia ${i + 1}`,
          fechaHora: "2026-12-05T10:00:00",
          precioBase: 100000 + (i * 10000),
          prioritario: (i % 2 === 0)
        }));
      }

      const resultados = await Promise.all(promesas);
      const todos201 = resultados.every(r => r.status === 201);
      assert.ok(todos201, 'Todos los POST concurrentes deben responder 201 Created');

      // Verificamos que todos los IDs generados sean únicos
      const ids = resultados.map(r => r.body.datos.id);
      const idsUnicos = new Set(ids);
      assert.strictEqual(ids.length, idsUnicos.size, 'No deben existir colisiones de IDs en registros concurrentes');
      console.log(`    📊 Integridad: 15 solicitudes registradas concurrentemente con 15 IDs únicos.`);
    });

    // L3: Latencia individual baja (< 100ms)
    await test('Latencia de respuesta individual en GET /api/turnos < 100ms', async () => {
      const res = await peticionAsync('GET', '/api/turnos');
      assert.strictEqual(res.status, 200);
      console.log(`    📊 Latencia individual: ${res.ms} ms`);
      assert.ok(res.ms < 100, `Latencia esperada < 100ms, obtenida: ${res.ms}ms`);
    });

  } finally {
    servidor.close();
  }

  console.log(`  Subtotal Carga y Concurrencia: ${pasadas}/${total} exitosas\n`);
  return { pasadas, total };
}

if (require.main === module) {
  correrPruebasCarga();
}

module.exports = { correrPruebasCarga };
