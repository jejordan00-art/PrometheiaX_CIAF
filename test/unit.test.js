/**
 * ==============================================================================
 * PROMETHEIAX — PRUEBAS UNITARIAS (UNIT TESTS)
 * Archivo: test/unit.test.js
 * ==============================================================================
 * Evalúa las funciones de lógica pura y matemática en services/turnos.service.js
 * de forma completamente aislada, sin levantar servidores web ni sockets.
 */

const assert = require('assert');
const turnosService = require('../services/turnos.service');

async function correrPruebasUnitarias() {
  console.log('\n--- 🔬 PRUEBAS UNITARIAS (services/turnos.service.js) ---');
  let pasadas = 0;
  let total = 0;

  function unitTest(descripcion, fn) {
    total++;
    try {
      fn();
      console.log(`  ✔ [UNIT-${total}] ${descripcion}`);
      pasadas++;
    } catch (err) {
      console.error(`  ✖ [FALLO UNIT-${total}] ${descripcion}`);
      console.error(`    Detalle: ${err.message}`);
    }
  }

  // U1: Verificación del parámetro N oficial
  unitTest('obtenerParametroN() debe devolver 10 (por John Edison Jordan #10)', () => {
    const N = turnosService.obtenerParametroN();
    assert.strictEqual(typeof N, 'number', 'N debe ser numérico');
    assert.strictEqual(N, 10, 'N oficial debe ser 10');
  });

  // U2: Verificación de configuración de negocio
  unitTest('obtenerConfiguracionNegocio() debe retornar N=10 y porcentajeRecargo=20', () => {
    const config = turnosService.obtenerConfiguracionNegocio();
    assert.strictEqual(config.parametroN, 10);
    assert.strictEqual(config.porcentajeRecargo, 20);
    assert.ok(config.formula.includes('10'), 'La fórmula debe incluir el 10');
  });

  // U3: Cálculo matemático con prioritario = true
  unitTest('calcularTarifa(200000, true) debe aplicar recargo del 20% (Total: 240.000 COP)', () => {
    const calculo = turnosService.calcularTarifa(200000, true);
    assert.strictEqual(calculo.parametroN, 10);
    assert.strictEqual(calculo.porcentajeRecargo, 20);
    assert.strictEqual(calculo.valorRecargo, 40000);
    assert.strictEqual(calculo.totalPagar, 240000);
    assert.strictEqual(calculo.prioritario, true);
  });

  // U4: Cálculo matemático con prioritario = false
  unitTest('calcularTarifa(150000, false) no debe aplicar recargo (Total: 150.000 COP)', () => {
    const calculo = turnosService.calcularTarifa(150000, false);
    assert.strictEqual(calculo.parametroN, 10);
    assert.strictEqual(calculo.porcentajeRecargo, 0);
    assert.strictEqual(calculo.valorRecargo, 0);
    assert.strictEqual(calculo.totalPagar, 150000);
    assert.strictEqual(calculo.prioritario, false);
  });

  // U5: Cálculo matemático cuando prioridad es omitida / undefined
  unitTest('calcularTarifa(80000, undefined) debe asumir prioridad false por defecto', () => {
    const calculo = turnosService.calcularTarifa(80000, undefined);
    assert.strictEqual(calculo.valorRecargo, 0);
    assert.strictEqual(calculo.totalPagar, 80000);
    assert.strictEqual(calculo.prioritario, false);
  });

  // U6: Redondeo matemático correcto de centavos a enteros
  unitTest('calcularTarifa(123455, true) debe redondear el recargo a enteros', () => {
    const calculo = turnosService.calcularTarifa(123455, true);
    const recargoEsperado = Math.round((123455 * 20) / 100);
    assert.strictEqual(calculo.valorRecargo, recargoEsperado);
    assert.strictEqual(calculo.totalPagar, 123455 + recargoEsperado);
  });

  console.log(`  Subtotal Unitarias: ${pasadas}/${total} exitosas\n`);
  return { pasadas, total };
}

if (require.main === module) {
  correrPruebasUnitarias();
}

module.exports = { correrPruebasUnitarias };
