var cashFlowTemprano = [
  0,   // t=0 (omitted 30)
  0,   // t=1
  0,   // t=2
  80,  // t=3
  0,   // t=4
  0,   // t=5
  0,   // t=6
  0,   // t=7
  142, // t=8
  0,   // t=9
  152, // t=10
  0,   // t=11
  132, // t=12
  32,  // t=13
  40,  // t=14
  372, // t=15
  0,   // t=16
  200  // t=17
];

var cashFlowTardio = [
  0,   // t=0 (omitted 30)
  0,   // t=1
  0,   // t=2
  80,  // t=3
  0,   // t=4
  0,   // t=5
  0,   // t=6
  0,   // t=7
  76,  // t=8
  18,  // t=9
  48,  // t=10
  72,  // t=11
  212, // t=12
  0,   // t=13
  0,   // t=14
  444, // t=15
  0,   // t=16
  200  // t=17
];

function calcularVAN(flujoEgresos, tasa, inversionInicial) {
  var sum = 0;
  for (var t = 0; t < flujoEgresos.length; t++) {
    sum += flujoEgresos[t] / Math.pow(1 + tasa, t);
  }
  return inversionInicial - sum;
}

function calcularTIR(flujoEgresos, inversionInicial) {
  var low = -0.999;
  var high = 10.0;
  var vanLow = calcularVAN(flujoEgresos, low, inversionInicial);
  var vanHigh = calcularVAN(flujoEgresos, high, inversionInicial);

  if (vanLow * vanHigh > 0) {
    var found = false;
    for (var h = 10.0; h <= 1000.0; h *= 2) {
      high = h;
      vanHigh = calcularVAN(flujoEgresos, high, inversionInicial);
      if (vanLow * vanHigh <= 0) {
        found = true;
        break;
      }
    }
    if (!found) return null;
  }

  for (var i = 0; i < 100; i++) {
    var mid = (low + high) / 2;
    var vanMid = calcularVAN(flujoEgresos, mid, inversionInicial);
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

WScript.Echo("TIR early: " + calcularTIR(cashFlowTemprano, 530));
WScript.Echo("TIR late: " + calcularTIR(cashFlowTardio, 530));
