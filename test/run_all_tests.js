/**
 * ==============================================================================
 * PROMETHEIAX — MASTER TEST RUNNER
 * Archivo: test/run_all_tests.js
 * ==============================================================================
 * Ejecuta todas las suites de pruebas del proyecto:
 * 1. Unitarias (Lógica matemática pura y regla N = 10)
 * 2. Integración (Endpoints HTTP, códigos 200, 201, 400, 404)
 * 3. Seguridad y Casos de Borde (Entradas anómalas, inyecciones, precios inválidos)
 * 4. Carga y Concurrencia (Ráfagas simultáneas y latencias)
 * 
 * Integrantes: John Edison Jordan (#10) y Laura Ximena Sánchez (#19)
 * ==============================================================================
 */

const { correrPruebasUnitarias } = require('./unit.test');
const { correrPruebasIntegracion } = require('./integration.test');
const { correrPruebasSeguridad } = require('./security_edge.test');
const { correrPruebasCarga } = require('./load_stress.test');

async function ejecutarTodasLasPruebas() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║       PROMETHEIAX — REPORTE GLOBAL DE PRUEBAS TÉCNICAS (CIAF)    ║');
  console.log('║   Integrantes: John Edison Jordan (#10) y Laura Sánchez (#19)   ║');
  console.log('║   Parámetro N = 10 · Recargo Prioritario = 20%                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  const inicioGlobal = Date.now();

  const rUnit = await correrPruebasUnitarias();
  const rInteg = await correrPruebasIntegracion();
  const rSec = await correrPruebasSeguridad();
  const rLoad = await correrPruebasCarga();

  const totalPasadas = rUnit.pasadas + rInteg.pasadas + rSec.pasadas + rLoad.pasadas;
  const totalPruebas = rUnit.total + rInteg.total + rSec.total + rLoad.total;
  const duracionTotal = Date.now() - inicioGlobal;
  const porcentaje = Math.round((totalPasadas / totalPruebas) * 100);

  console.log('══════════════════════════════════════════════════════════════════');
  console.log('                  RESUMEN EJECUTIVO DE EVALUACIÓN                 ');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`  1. Pruebas Unitarias (Services & Regla N):      ${rUnit.pasadas}/${rUnit.total} OK`);
  console.log(`  2. Pruebas de Integración (Endpoints & HTTP):    ${rInteg.pasadas}/${rInteg.total} OK`);
  console.log(`  3. Pruebas de Seguridad y Casos de Borde:       ${rSec.pasadas}/${rSec.total} OK`);
  console.log(`  4. Pruebas de Carga y Concurrencia:             ${rLoad.pasadas}/${rLoad.total} OK`);
  console.log('──────────────────────────────────────────────────────────────────');
  console.log(`  TOTAL GENERAL: ${totalPasadas}/${totalPruebas} PRUEBAS EXITOSAS (${porcentaje}%)`);
  console.log(`  TIEMPO DE EJECUCIÓN TOTAL: ${duracionTotal} ms`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  if (totalPasadas !== totalPruebas) {
    process.exit(1);
  }
}

ejecutarTodasLasPruebas().catch(err => {
  console.error('Error fatal al ejecutar suite global:', err);
  process.exit(1);
});
