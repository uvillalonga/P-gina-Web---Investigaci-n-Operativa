function calcularVAN(flujoEgresos, tasa, inversionInicial) {
  let sum = 0;
  for (let t = 0; t < flujoEgresos.length; t++) {
    sum += flujoEgresos[t] / Math.pow(1 + tasa, t);
  }
  return inversionInicial - sum;
}

function calcularTIR(flujoEgresos, inversionInicial) {
  let low = -0.999;
  let high = 10.0;
  let vanLow = calcularVAN(flujoEgresos, low, inversionInicial);
  let vanHigh = calcularVAN(flujoEgresos, high, inversionInicial);

  console.log(`Initial: low=${low}, vanLow=${vanLow}, high=${high}, vanHigh=${vanHigh}`);

  if (vanLow * vanHigh > 0) {
    let found = false;
    for (let h = 10.0; h <= 1000.0; h *= 2) {
      high = h;
      vanHigh = calcularVAN(flujoEgresos, high, inversionInicial);
      if (vanLow * vanHigh <= 0) {
        found = true;
        break;
      }
    }
    if (!found) return null;
  }

  for (let i = 0; i < 100; i++) {
    let mid = (low + high) / 2;
    let vanMid = calcularVAN(flujoEgresos, mid, inversionInicial);
    if (Math.abs(vanMid) < 1e-6) {
      return mid;
    }
    if (vanLow * vanMid < 0) {
      high = mid;
      vanHigh = vanMid;
    } else {
      low = mid;
      vanLow = vanMid;
    }
  }
  return (low + high) / 2;
}

const cashFlowTemprano = [30, 0, 0, 80, 0, 0, 0, 0, 142, 0, 92, 60, 132, 32, 0, 412, 0, 200];
const inversion = 500;
const tir = calcularTIR(cashFlowTemprano, inversion);
console.log("Calculated TIR:", tir);
