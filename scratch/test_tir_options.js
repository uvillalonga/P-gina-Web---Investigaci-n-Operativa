var cashFlowTemprano = [30, 0, 0, 80, 0, 0, 0, 0, 142, 0, 152, 0, 132, 32, 40, 372, 0, 200];
var cashFlowTardio = [30, 0, 0, 80, 0, 0, 0, 0, 76, 18, 48, 72, 212, 0, 0, 444, 0, 200];

function solveIRR(target, flows, getDiscountedSum) {
  var low = -0.999;
  var high = 2.0;
  for (var i = 0; i < 100; i++) {
    var mid = (low + high) / 2;
    var val = getDiscountedSum(flows, mid);
    if (Math.abs(val - target) < 1e-7) return mid;
    if (val > target) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

// Option 1: 500 = sum_{t=0} C_t / (1+r)^t
var opt1_temp = solveIRR(500, cashFlowTemprano, function(f, r) {
  var s = 0;
  for(var t=0; t<f.length; t++) s += f[t] / Math.pow(1+r, t);
  return s;
});
var opt1_tard = solveIRR(500, cashFlowTardio, function(f, r) {
  var s = 0;
  for(var t=0; t<f.length; t++) s += f[t] / Math.pow(1+r, t);
  return s;
});

// Option 2: 500 = sum_{t=1} C_t / (1+r)^t  (omitting t=0)
var opt2_temp = solveIRR(500, cashFlowTemprano, function(f, r) {
  var s = 0;
  for(var t=1; t<f.length; t++) s += f[t] / Math.pow(1+r, t);
  return s;
});
var opt2_tard = solveIRR(500, cashFlowTardio, function(f, r) {
  var s = 0;
  for(var t=1; t<f.length; t++) s += f[t] / Math.pow(1+r, t);
  return s;
});

// Option 3: 500 = sum_{t=0} C_t / (1+r)^{t+1} (shifted by 1)
var opt3_temp = solveIRR(500, cashFlowTemprano, function(f, r) {
  var s = 0;
  for(var t=0; t<f.length; t++) s += f[t] / Math.pow(1+r, t+1);
  return s;
});
var opt3_tard = solveIRR(500, cashFlowTardio, function(f, r) {
  var s = 0;
  for(var t=0; t<f.length; t++) s += f[t] / Math.pow(1+r, t+1);
  return s;
});

// Option 4: 500 = sum_{t=1} C_t / (1+r)^{t+1} (omitting t=0, shifted by 1)
var opt4_temp = solveIRR(500, cashFlowTemprano, function(f, r) {
  var s = 0;
  for(var t=1; t<f.length; t++) s += f[t] / Math.pow(1+r, t+1);
  return s;
});
var opt4_tard = solveIRR(500, cashFlowTardio, function(f, r) {
  var s = 0;
  for(var t=1; t<f.length; t++) s += f[t] / Math.pow(1+r, t+1);
  return s;
});

WScript.Echo("Option 1 (unshifted, all): " + (opt1_temp*100).toFixed(4) + "% vs " + (opt1_tard*100).toFixed(4) + "%");
WScript.Echo("Option 2 (unshifted, omit t=0): " + (opt2_temp*100).toFixed(4) + "% vs " + (opt2_tard*100).toFixed(4) + "%");
WScript.Echo("Option 3 (shifted 1, all): " + (opt3_temp*100).toFixed(4) + "% vs " + (opt3_tard*100).toFixed(4) + "%");
WScript.Echo("Option 4 (shifted 1, omit t=0): " + (opt4_temp*100).toFixed(4) + "% vs " + (opt4_tard*100).toFixed(4) + "%");
