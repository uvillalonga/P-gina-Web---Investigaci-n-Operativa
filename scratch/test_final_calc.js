function calcularVAN(flujoEgresos, tasa, inversionInicial) {
  var sum = 0;
  for (var t = 0; t < flujoEgresos.length; t++) {
    sum += flujoEgresos[t] / Math.pow(1 + tasa, t);
  }
  return sum;
}

function calcularTIR(flujoEgresos, inversionInicial) {
  var low = -0.999;
  var high = 2.0;

  var getSum = function(r) {
    var sum = 0;
    for (var t = 0; t < flujoEgresos.length; t++) {
      sum += flujoEgresos[t] / Math.pow(1 + r, t + 1);
    }
    return sum;
  };

  var valLow = getSum(low);
  var valHigh = getSum(high);

  if ((valLow - inversionInicial) * (valHigh - inversionInicial) > 0) {
    var found = false;
    for (var h = 2.0; h <= 100.0; h *= 2) {
      high = h;
      valHigh = getSum(high);
      if ((valLow - inversionInicial) * (valHigh - inversionInicial) <= 0) {
        found = true;
        break;
      }
    }
    if (!found) return null;
  }

  for (var i = 0; i < 100; i++) {
    var mid = (low + high) / 2;
    var valMid = getSum(mid);
    if (Math.abs(valMid - inversionInicial) < 1e-7) {
      return mid;
    }
    if (valMid > inversionInicial) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

var cashFlowTemprano = [30, 0, 0, 80, 0, 0, 0, 0, 142, 0, 152, 0, 132, 32, 40, 372, 0, 200];
var cashFlowTardio = [30, 0, 0, 80, 0, 0, 0, 0, 76, 18, 48, 72, 212, 0, 0, 444, 0, 200];
var inversion = 500;
var tasa = 0.01;

WScript.Echo("VAN early: " + calcularVAN(cashFlowTemprano, tasa, inversion));
WScript.Echo("TIR early: " + (calcularTIR(cashFlowTemprano, inversion) * 100).toFixed(4) + "%");
WScript.Echo("VAN late: " + calcularVAN(cashFlowTardio, tasa, inversion));
WScript.Echo("TIR late: " + (calcularTIR(cashFlowTardio, inversion) * 100).toFixed(4) + "%");
