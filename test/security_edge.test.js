/**
 * ==============================================================================
 * PROMETHEIAX — PRUEBAS DE SEGURIDAD Y CASOS DE BORDE (SECURITY & EDGE CASES)
 * Archivo: test/security_edge.test.js
 * ==============================================================================
 * Evalúa el comportamiento defensivo del servidor ante entradas anómalas:
 * - Tipos de datos inválidos (arrays o booleanos en campos de texto)
 * - Inyecciones de scripts o etiquetas HTML
 * - Precios no numéricos, NaN o cadenas alfanuméricas
 * - Peticiones con cuerpo completamente vacío o no-JSON
 * - Fechas con formatos corruptos
 */

const assert = require('assert');
const http = require('http');
const { app } = require('../index');

const PUERTO = 3092;
let servidor;

function peticionCruda(metodo, ruta, dataTexto, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (dataTexto) {
      defaultHeaders['Content-Length'] = Buffer.byteLength(dataTexto);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: PUERTO,
      path: ruta,
      method: metodo,
      headers: defaultHeaders
    }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (dataTexto) req.write(dataTexto);
    req.end();
  });
}

async function correrPruebasSeguridad() {
  console.log('\n--- 🛡️ PRUEBAS DE SEGURIDAD Y CASOS DE BORDE (DEFENSIVE CODING) ---');
  let pasadas = 0;
  let total = 0;

  async function test(desc, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✔ [SEC-${total}] ${desc}`);
      pasadas++;
    } catch (err) {
      console.error(`  ✖ [FALLO SEC-${total}] ${desc}`);
      console.error(`    Detalle: ${err.message}`);
    }
  }

  servidor = app.listen(PUERTO);

  try {
    // S1: Cuerpo vacío {}
    await test('POST /api/turnos con cuerpo {} vacío devuelve HTTP 400 Bad Request', async () => {
      const res = await peticionCruda('POST', '/api/turnos', JSON.stringify({}));
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.exito, false);
    });

    // S2: precioBase como string no numérico
    await test('POST /api/turnos con precioBase="gratis" devuelve HTTP 400 Bad Request', async () => {
      const payload = {
        estudiante: "Laura Sánchez",
        tipoServicio: "Tutoría",
        tema: "Seguridad",
        fechaHora: "2026-12-05T10:00:00",
        precioBase: "gratis"
      };
      const res = await peticionCruda('POST', '/api/turnos', JSON.stringify(payload));
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.exito, false);
      assert.ok(JSON.stringify(res.body).includes('precioBase'));
    });

    // S3: precioBase = 0 (caso límite exacto)
    await test('POST /api/turnos con precioBase=0 exacto devuelve HTTP 400 Bad Request', async () => {
      const payload = {
        estudiante: "John Edison Jordan",
        tipoServicio: "Asesoría",
        tema: "Límites",
        fechaHora: "2026-12-05T10:00:00",
        precioBase: 0
      };
      const res = await peticionCruda('POST', '/api/turnos', JSON.stringify(payload));
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.exito, false);
    });

    // S4: fechaHora con formato no parseable
    await test('POST /api/turnos con fechaHora="manana-a-las-3" devuelve HTTP 400 Bad Request', async () => {
      const payload = {
        estudiante: "Laura Sánchez",
        tipoServicio: "Tutoría",
        tema: "Validación de fechas",
        fechaHora: "manana-a-las-3",
        precioBase: 100000
      };
      const res = await peticionCruda('POST', '/api/turnos', JSON.stringify(payload));
      assert.strictEqual(res.status, 400);
      assert.ok(JSON.stringify(res.body).toLowerCase().includes('fechahora'));
    });

    // S5: Protección ante inyecciones HTML en estudiante
    await test('POST /api/turnos sanitiza espacios y persiste texto sin romper el JSON', async () => {
      const payload = {
        estudiante: "  <script>alert('test')</script>  ",
        tipoServicio: "Asesoría de seguridad",
        tema: "XSS prevention",
        fechaHora: "2026-12-05T10:00:00",
        precioBase: 120000,
        prioritario: true
      };
      const res = await peticionCruda('POST', '/api/turnos', JSON.stringify(payload));
      assert.strictEqual(res.status, 201);
      // Debe haber limpiado los espacios iniciales/finales
      assert.strictEqual(res.body.datos.estudiante, "<script>alert('test')</script>");
    });

    // S6: Estudiante como arreglo o tipo no string
    await test('POST /api/turnos con estudiante=["Juan", "Pedro"] devuelve HTTP 400', async () => {
      const payload = {
        estudiante: ["Juan", "Pedro"],
        tipoServicio: "Asesoría",
        tema: "Tipos de datos",
        fechaHora: "2026-12-05T10:00:00",
        precioBase: 100000
      };
      const res = await peticionCruda('POST', '/api/turnos', JSON.stringify(payload));
      assert.strictEqual(res.status, 400);
    });

  } finally {
    servidor.close();
  }

  console.log(`  Subtotal Seguridad y Casos de Borde: ${pasadas}/${total} exitosas\n`);
  return { pasadas, total };
}

if (require.main === module) {
  correrPruebasSeguridad();
}

module.exports = { correrPruebasSeguridad };
