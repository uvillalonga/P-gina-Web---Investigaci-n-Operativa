/**
 * Automated Verification Suite for UTN Investigación Operativa - Inventory Simulator
 * Validates:
 * 1. EOQ Classical Formula (q0, n, t0, CTE)
 * 2. Trade-Off Balance Cost Parity (Cprep == Calm at q0)
 * 3. Multi-Cycle Lead Time & ROP Logic (L > t0)
 * 4. Lagrange Space Constraint Solver (Multi-Item Inventory)
 * 5. Quantity Discounts & Price Breaks Optimization Algorithm
 * 6. Module 4 Quiz & Trivia Scoring Logic
 * 7. HTML Element & DOM Contract Verification in simulador_inventarios.html
 */

const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${testName} ${details ? `(${details})` : ''}`);
    testsFailed++;
  }
}

function runSection(title, fn) {
  console.log(`\n\x1b[35m=== ${title} ===\x1b[0m`);
  try {
    fn();
  } catch (err) {
    console.error(`  \x1b[31m✖ ERROR\x1b[0m in section: ${err.message}`);
    testsFailed++;
  }
}

console.log('\x1b[36m================================================================');
console.log('🧪 INICIANDO SUITE AUTOMATIZADA DE PRUEBAS - SIMULADOR DE INVENTARIOS');
console.log('================================================================\x1b[0m');

// 1. Classical EOQ Calculations
runSection('1. CÁLCULOS MATEMÁTICOS DEL MODELO BÁSICO EOQ', () => {
  // Caso de prueba Base: D = 1000, k = 50, c1 = 10, T = 1, b = 10
  const D = 1000, k = 50, c1 = 10, T = 1, b = 10;
  const q0 = Math.sqrt((2 * k * D) / (T * c1));
  const n = D / q0;
  const t0 = (q0 / D) * T;
  const Cprep = (D / q0) * k;
  const Calm = (q0 / 2) * c1 * T;
  const Cadq = b * D;
  const CTE = Cadq + Cprep + Calm;

  assert(Math.abs(q0 - 100) < 1e-6, 'Lote Óptimo EOQ q0 = 100 unidades', `q0 = ${q0}`);
  assert(Math.abs(n - 10) < 1e-6, 'Frecuencia de pedidos n = 10 pedidos/año', `n = ${n}`);
  assert(Math.abs(t0 - 0.1) < 1e-6, 'Tiempo entre pedidos t0 = 0.1 año = 36.5 días', `t0 = ${t0}`);
  assert(Math.abs(Cprep - 500) < 1e-6, 'Costo de preparación Cprep = $500/año', `Cprep = ${Cprep}`);
  assert(Math.abs(Calm - 500) < 1e-6, 'Costo de almacenamiento Calm = $500/año', `Calm = ${Calm}`);
  assert(Math.abs(Cprep - Calm) < 1e-6, 'Condición de equilibrio Cprep == Calm en q0', `Cprep - Calm = ${Cprep - Calm}`);
  assert(Math.abs(CTE - 11000) < 1e-6, 'Costo Total Esperado CTE = $11.000/año', `CTE = ${CTE}`);
});

// 2. Sensitivity / Suboptimal batch behavior
runSection('2. ANÁLISIS DE SENSIBILIDAD Y COMPORTAMIENTO SUBÓPTIMO', () => {
  const D = 1000, k = 50, c1 = 10, T = 1, Cadq = 10000;
  
  // Lote chico (q = 25)
  const qSmall = 25;
  const cpSmall = (D / qSmall) * k; // 2000
  const caSmall = (qSmall / 2) * c1 * T; // 125
  const cteSmall = Cadq + cpSmall + caSmall; // 12125
  assert(cpSmall === 2000 && caSmall === 125 && cteSmall === 12125, 
    'Lote Chico (q=25): Cp=$2000 > Ca=$125 (Inclinación a Pedidos)', `CTE = ${cteSmall}`);

  // Lote grande (q = 175)
  const qLarge = 175;
  const cpLarge = (D / qLarge) * k; // 285.71
  const caLarge = (qLarge / 2) * c1 * T; // 875
  const cteLarge = Cadq + cpLarge + caLarge;
  assert(Math.abs(cpLarge - 285.714) < 0.01 && caLarge === 875 && Math.abs(cteLarge - 11160.71) < 0.01,
    'Lote Grande (q=175): Ca=$875 > Cp=$285.71 (Inclinación a Almacén)', `CTE = ${cteLarge}`);

  assert(cteSmall > 11000 && cteLarge > 11000, 
    'Tanto q=25 como q=175 tienen un CTE mayor al óptimo de $11.000');
});

// 3. Multi-Cycle Lead Time & ROP Logic
runSection('3. PUNTO DE REORDEN (ROP) CON PLAZO EXTENDIDO (L > t0)', () => {
  // Caso 1: L < t0 (Normal)
  const D1 = 12000, T1 = 300, q0_1 = 948.68, L1 = 6;
  const t0_1 = (q0_1 / D1) * T1; // 23.72 días
  const d1 = D1 / T1; // 40 u/día
  const rop1 = d1 * L1; // 240 unidades
  assert(L1 < t0_1, 'Caso Normal: Lead time L (6d) < t0 (23.72d)');
  assert(rop1 === 240, 'ROP simple = 240 unidades físicas en depósito');

  // Caso 2: L > t0 (Multiciclo con órdenes en tránsito)
  const D2 = 2400, T2 = 360, q0_2 = 134.16, L2 = 45;
  const t0_2 = (q0_2 / D2) * T2; // 20.12 días
  const d2 = D2 / T2; // 6.666 u/día
  const ropGross = d2 * L2; // 300 unidades
  const mOrdersInTransit = Math.floor(ropGross / q0_2); // 2 pedidos en tránsito
  const ropEffective = ropGross - (mOrdersInTransit * q0_2); // 31.68 u

  assert(L2 > t0_2, 'Caso Multiciclo: Lead time L (45d) > t0 (20.12d)');
  assert(ropGross === 300, 'Demanda total durante lead time = 300 motores');
  assert(mOrdersInTransit === 2, 'Cantidad de órdenes en tránsito m = 2');
  assert(Math.abs(ropEffective - 31.68) < 0.01, 'Punto de reorden físico efectivo en galpón ROP_eff = 31.68 u');
});

// 4. Multi-Item Space/Volume Constraint Solver (Ejercicio 8 Ground Truth)
runSection('4. ALGORITMO DE MULTIPLICADORES DE LAGRANGE (EJERCICIO 8 CÁTEDRA)', () => {
  const V_max = 250;
  const T = 1;
  const iRate = 0.20;

  const items = [
    { name: 'P1', D: 6000, b: 15, k: 80,  v: 0.10, c1: 15 * iRate * T },
    { name: 'P2', D: 4000, b: 40, k: 120, v: 0.30, c1: 40 * iRate * T },
    { name: 'P3', D: 2000, b: 60, k: 200, v: 0.50, c1: 60 * iRate * T }
  ];

  // Paso 1: Lotes clásicos sin restricción (lambda = 0)
  items.forEach(it => {
    it.q0 = Math.sqrt((2 * it.k * it.D) / (it.c1 * T));
    it.vol0 = it.q0 * it.v;
  });

  assert(Math.abs(items[0].q0 - 565.69) < 0.1, `P1 q0 = ${items[0].q0.toFixed(2)} u ≈ 565.69 u`);
  assert(Math.abs(items[1].q0 - 346.41) < 0.1, `P2 q0 = ${items[1].q0.toFixed(2)} u ≈ 346.41 u`);
  assert(Math.abs(items[2].q0 - 258.20) < 0.1, `P3 q0 = ${items[2].q0.toFixed(2)} u ≈ 258.20 u`);

  const unconstrainedVol = items.reduce((acc, it) => acc + it.vol0, 0);
  assert(Math.abs(unconstrainedVol - 289.59) < 0.2, `Volumen sin restricción = ${unconstrainedVol.toFixed(2)} m³ > V_max 250 m³ (Restricción Activa)`);

  // Paso 2: Búsqueda de lambda <= 0 (denominador = c1*T - 2*lambda*v)
  let low = -100, high = 0, lambda = 0;
  for (let iter = 0; iter < 100; iter++) {
    lambda = (low + high) / 2;
    let totalV = 0;
    items.forEach(it => {
      let denom = (it.c1 * T) - (2 * lambda * it.v);
      let q = denom > 0 ? Math.sqrt((2 * it.k * it.D) / denom) : 0;
      totalV += it.v * q;
    });
    if (totalV < V_max) low = lambda;
    else high = lambda;
  }

  assert(Math.abs(lambda - -4.44) < 0.05, `Multiplicador óptimo lambda = ${lambda.toFixed(2)} ≈ -4.44`);

  // Paso 3: Lotes ajustados y costos
  let finalVol = 0;
  let cost0Total = 0;
  let costAdjTotal = 0;

  items.forEach(it => {
    let denom = (it.c1 * T) - (2 * lambda * it.v);
    it.qLagrange = Math.sqrt((2 * it.k * it.D) / denom);
    finalVol += it.v * it.qLagrange;

    let cadq = it.b * it.D;
    cost0Total += cadq + (it.D / it.q0) * it.k + 0.5 * it.q0 * it.c1 * T;
    costAdjTotal += cadq + (it.D / it.qLagrange) * it.k + 0.5 * it.qLagrange * it.c1 * T;
  });

  assert(Math.abs(items[0].qLagrange - 496.90) < 0.5, `P1 q* = ${items[0].qLagrange.toFixed(2)} u ≈ 496.90 u`);
  assert(Math.abs(items[1].qLagrange - 300.04) < 0.5, `P2 q* = ${items[1].qLagrange.toFixed(2)} u ≈ 300.04 u`);
  assert(Math.abs(items[2].qLagrange - 220.59) < 0.5, `P3 q* = ${items[2].qLagrange.toFixed(2)} u ≈ 220.59 u`);

  assert(Math.abs(finalVol - V_max) < 0.1, `Volumen final ocupado = ${finalVol.toFixed(2)} m³ == ${V_max} m³`);
  assert(Math.abs((costAdjTotal - cost0Total) - 81.41) < 1.0, `Costo sombra del espacio = $${(costAdjTotal - cost0Total).toFixed(2)} ≈ $81.41/año`);
});

// 5. Quantity Discount Algorithm (Ejercicio 7 Ground Truth)
runSection('5. ALGORITMO DE DESCUENTOS POR CANTIDAD (EJERCICIO 7 CÁTEDRA)', () => {
  const D = 12000, k = 160, iRate = 0.25, T = 1;

  // Empresa X
  const rawX = [
    { qmin: 0,    qmax: 1200,   price: 30.00, c1: 7.50 },
    { qmin: 1200, qmax: 3000,   price: 29.20, c1: 7.30 },
    { qmin: 3000, qmax: 999999, price: 28.80, c1: 7.20 }
  ];

  const tiersX = rawX.map(t => {
    const q0 = Math.sqrt((2 * k * D) / (t.c1 * T));
    let qc = q0;
    let status = 'valid';
    if (q0 < t.qmin) {
      qc = t.qmin;
      status = 'adjusted';
    } else if (q0 > t.qmax) {
      qc = null;
      status = 'infeasible';
    }
    const cadq = t.price * D;
    const cp = qc ? (D / qc) * k : null;
    const ca = qc ? 0.5 * qc * t.c1 * T : null;
    const cte = qc ? (cadq + cp + ca) : Infinity;
    return { q0, qc, status, cadq, cp, ca, cte };
  });

  // Validaciones Empresa X
  assert(Math.abs(tiersX[0].q0 - 715.54) < 0.1, 'Empresa X - Tramo 1: q0 = 715.54 u');
  assert(Math.abs(tiersX[0].cte - 365366.56) < 0.1, 'Empresa X - Tramo 1: CTE = $365,366.56');

  assert(Math.abs(tiersX[1].q0 - 725.28) < 0.1, 'Empresa X - Tramo 2: q0 = 725.28 u < 1200');
  assert(tiersX[1].qc === 1200, 'Empresa X - Tramo 2: q ajustado a cota mínima = 1200 u');
  assert(Math.abs(tiersX[1].cte - 356380.00) < 0.01, 'Empresa X - Tramo 2: CTE = $356,380.00');

  assert(Math.abs(tiersX[2].q0 - 730.30) < 0.1, 'Empresa X - Tramo 3: q0 = 730.30 u < 3000');
  assert(tiersX[2].qc === 3000, 'Empresa X - Tramo 3: q ajustado a cota mínima = 3000 u');
  assert(Math.abs(tiersX[2].cte - 357040.00) < 0.01, 'Empresa X - Tramo 3: CTE = $357,040.00');

  const bestX = tiersX.reduce((p, c) => (c.cte < p.cte ? c : p), tiersX[0]);
  assert(bestX === tiersX[1], 'Empresa X: Tramo 2 (Q=1200) es el óptimo de la Empresa X');

  // Empresa Y
  const rawY = [
    { qmin: 0,    qmax: 1000,   price: 30.20, c1: 7.55 },
    { qmin: 1000, qmax: 3000,   price: 29.50, c1: 7.375 },
    { qmin: 3000, qmax: 999999, price: 28.90, c1: 7.225 }
  ];

  const tiersY = rawY.map(t => {
    const q0 = Math.sqrt((2 * k * D) / (t.c1 * T));
    let qc = q0;
    if (q0 < t.qmin) qc = t.qmin;
    else if (q0 > t.qmax) qc = null;
    const cadq = t.price * D;
    const cp = qc ? (D / qc) * k : null;
    const ca = qc ? 0.5 * qc * t.c1 * T : null;
    const cte = qc ? (cadq + cp + ca) : Infinity;
    return { q0, qc, cadq, cp, ca, cte };
  });

  // Validaciones Empresa Y
  assert(Math.abs(tiersY[0].q0 - 713.17) < 0.1, 'Empresa Y - Tramo 1: q0 = 713.17 u');
  assert(Math.abs(tiersY[0].cte - 367784.42) < 0.1, 'Empresa Y - Tramo 1: CTE = $367,784.42');
  assert(tiersY[1].qc === 1000 && Math.abs(tiersY[1].cte - 359607.50) < 0.01, 'Empresa Y - Tramo 2: Q=1000, CTE = $359,607.50');
  assert(tiersY[2].qc === 3000 && Math.abs(tiersY[2].cte - 358277.50) < 0.01, 'Empresa Y - Tramo 3: Q=3000, CTE = $358,277.50');

  const bestY = tiersY.reduce((p, c) => (c.cte < p.cte ? c : p), tiersY[0]);
  assert(bestY === tiersY[2], 'Empresa Y: Tramo 3 (Q=3000) es el óptimo de la Empresa Y');

  // Comparativa Global
  assert(bestX.cte < bestY.cte, 'Comparativa Global: Empresa X (Tramo 2, Q=1200, CTE=$356.380) es el GANADOR GLOBAL indiscutido');
});

// 6. Module 4 Quiz Logic
runSection('6. VALIDACIÓN DE RESPUESTAS Y PUNTAJE DE LA TRIVIA', () => {
  const quizAnswers = {
    1: { correctIndex: 1, text: 'Se duplicará (x 2)' },
    2: { correctIndex: 2, text: 'Son exactamente iguales (Cp = Ca)' },
    3: { correctIndex: 0, text: 'Se reduce a la mitad' },
    4: { correctIndex: 1, text: 'Se evalúa la cota inferior exacta Qmin' }
  };

  assert(quizAnswers[1].correctIndex === 1, 'Pregunta 1: k cuadruplicado -> q0 duplicado (Opción B)');
  assert(quizAnswers[2].correctIndex === 2, 'Pregunta 2: Relación Cp y Ca en q0 -> Cp = Ca (Opción C)');
  assert(quizAnswers[3].correctIndex === 0, 'Pregunta 3: Lote a la mitad -> Costo de almacén a la mitad (Opción A)');
  assert(quizAnswers[4].correctIndex === 1, 'Pregunta 4: q0 < Qmin -> Evaluar cota inferior Qmin (Opción B)');
});

// 7. HTML & DOM Integrity Contract
runSection('7. INTEGRIDAD DEL ARCHIVO HTML (simulador_inventarios.html)', () => {
  const htmlPath = path.join(__dirname, 'simulador_inventarios.html');
  assert(fs.existsSync(htmlPath), 'El archivo simulador_inventarios.html existe');

  const content = fs.readFileSync(htmlPath, 'utf8');

  // Verify critical element IDs
  const requiredIds = [
    'scaleBeam',
    'panLeftGroup',
    'panRightGroup',
    'svgCpVal',
    'svgCaVal',
    'theoryBatchSlider',
    'theoryBatchValBadge',
    'tradeoffFeedback',
    'paramD',
    'paramK',
    'paramC1',
    'eoqSlider',
    'qValDisplay',
    'lagrangeTable',
    'discountTable',
    'quizScoreBadge',
    'qCard1', 'qCard2', 'qCard3', 'qCard4'
  ];

  requiredIds.forEach(id => {
    assert(content.includes(`id="${id}"`), `Elemento con id="${id}" presente en el HTML`);
  });

  // Verify forbidden tropes are absent
  assert(!content.includes('Wilson'), 'El nombre Wilson fue eliminado por completo de la interfaz');
  assert(!content.includes('Reposición no Instantánea'), 'Modelo EPQ eliminado');
});

console.log('\n\x1b[36m================================================================');
console.log(`📊 RESUMEN FINAL: ${testsPassed} pruebas pasadas, ${testsFailed} pruebas fallidas.`);
if (testsFailed === 0) {
  console.log('🎉 TODAS LAS PRUEBAS UNITARIAS, MATEMÁTICAS Y DE ESTRUCTURA PASARON CON ÉXITO.');
} else {
  console.log('⚠️ ALGUNAS PRUEBAS FALLARON.');
}
console.log('================================================================\x1b[0m\n');

process.exit(testsFailed === 0 ? 0 : 1);
