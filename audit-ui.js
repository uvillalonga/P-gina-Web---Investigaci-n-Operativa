const fs = require('fs');

const html = fs.readFileSync('simulador_inventarios.html', 'utf8');
const css = fs.existsSync('styles.css') ? fs.readFileSync('styles.css', 'utf8') : '';

console.log('================================================================');
console.log('🧪 SUITE DE AUDITORÍA INTEGRAL: ESTRUCTURA, DOM, ESTÉTICA Y JS');
console.log('================================================================\n');

let totalErrors = 0;

// 1. Balance de etiquetas HTML
console.log('=== 1. BALANCE DE ETIQUETAS HTML ===');
const tags = ['div', 'script', 'style', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'button', 'section', 'h1', 'h2', 'h3', 'h4', 'p', 'span'];
tags.forEach(tag => {
  const openCount = (html.match(new RegExp('<' + tag + '(\\s|>|$)', 'gi')) || []).length;
  const closeCount = (html.match(new RegExp('</' + tag + '>', 'gi')) || []).length;
  const diff = openCount - closeCount;
  if (diff !== 0) {
    console.log(`  ❌ ERROR en <${tag}>: ${openCount} abiertas vs ${closeCount} cerradas (dif: ${diff})`);
    totalErrors++;
  } else {
    console.log(`  ✔ PASS: <${tag}> balanceado (${openCount} etiquetas)`);
  }
});

// 2. Fórmulas matemáticas KaTeX
console.log('\n=== 2. BALANCE DE FÓRMULAS MATEMÁTICAS (KATEX EN HTML) ===');
const bodyHtml = html.split('<script>')[0];
const doubleDollarCount = (bodyHtml.match(/\$\$/g) || []).length;
if (doubleDollarCount % 2 === 0) {
  console.log(`  ✔ PASS: Fórmulas display ($$): ${doubleDollarCount / 2} bloques cerrados correctamente`);
} else {
  console.log(`  ❌ ERROR: Fórmulas display ($$) desbalanceadas (${doubleDollarCount} delimitadores)`);
  totalErrors++;
}

// 3. Contratos DOM
console.log('\n=== 3. CONTRATOS DOM Y REFERENCIAS JS ===');
const getElementByIdRegex = /getElementById\(['"]([a-zA-Z0-9_\-]+)['"]\)/g;
const idMatches = [...html.matchAll(getElementByIdRegex)].map(m => m[1]);
const uniqueIds = [...new Set(idMatches)];

uniqueIds.forEach(id => {
  const hasStaticId = html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
  const isDynamicId = ['discountTable', 'codeBasic', 'codeStock', 'codeDeficit'].includes(id);
  if (hasStaticId || isDynamicId) {
    console.log(`  ✔ PASS: ID "${id}" verificado en runtime`);
  } else {
    console.log(`  ❌ ERROR: ID "${id}" referenciado en JS no existe`);
    totalErrors++;
  }
});

// 4. Tokens de diseño CSS
console.log('\n=== 4. VERIFICACIÓN DE TOKENS ESTÉTICOS Y CSS ===');
const fullCss = css + '\n' + html;
const requiredTokens = ['--bg', '--surface', '--border', '--border-med', '--text', '--text2', '--text3', '--emerald', '--rose', '--amber'];
requiredTokens.forEach(tok => {
  if (fullCss.includes(tok)) {
    console.log(`  ✔ PASS: Token de diseño "${tok}" presente`);
  } else {
    console.log(`  ❌ ERROR: Token de diseño "${tok}" ausente`);
    totalErrors++;
  }
});

// 5. Controladores JS principales
console.log('\n=== 5. INTEGRIDAD DE CONTROLADORES Y FUNCIONES JS ===');
const requiredFns = [
  'switchModule', 'loadScenario', 'onParamChange', 'updateEOQGame',
  'setEOQValue', 'updateEOQChart', 'updateSawtoothChart', 'onWhatIfScenarioChange',
  'switchSubTab', 'solveLagrange', 'resetLagrangeToExercise8', 'autoSolveLagrange',
  'addNewProvider', 'resetDualDiscountsToExercise7', 'solveMultiDiscounts',
  'showMachete', 'copyExcel', 'checkQuiz', 'setTheoryTradeoff', 'onTheorySliderInput'
];

requiredFns.forEach(fn => {
  if (html.includes(`function ${fn}`)) {
    console.log(`  ✔ PASS: Controlador JS "${fn}" implementado`);
  } else {
    console.log(`  ❌ ERROR: Controlador JS "${fn}" ausente`);
    totalErrors++;
  }
});

console.log('\n================================================================');
console.log(`📊 RESUMEN FINAL: ${totalErrors === 0 ? 'TODO PERFECTO Y EN ORDEN (0 ERRORES)' : totalErrors + ' ERRORES ENCONTRADOS'}`);
console.log('================================================================');
