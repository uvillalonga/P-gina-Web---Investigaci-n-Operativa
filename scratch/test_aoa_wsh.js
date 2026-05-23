var prefabData = [
  { id: 1, tarea: 'EST', desc: 'EREGIR LA ESTRUCTURA', prec: '2', te: 5, cost: 1000 },
  { id: 2, tarea: 'CIM', desc: 'HACER LOS CIMIENTOS', prec: '-', te: 3, cost: 2000 },
  { id: 3, tarea: 'VITE', desc: 'PONER LAS VIGAS TECHO', prec: '1', te: 2, cost: 800 },
  { id: 4, tarea: 'RETE', desc: 'REVESTIR EL TECHO', prec: '3', te: 3, cost: 1200 },
  { id: 5, tarea: 'ELEC', desc: 'CABLEADO ELECTRICO', prec: '1', te: 4, cost: 1500 },
  { id: 6, tarea: 'EXT', desc: 'TABLAS PAREDES EXTERIORES', prec: '7', te: 4, cost: 1100 },
  { id: 7, tarea: 'VENT', desc: 'COLOCAR LAS VENTANAS', prec: '1', te: 2, cost: 500 },
  { id: 8, tarea: 'INT', desc: 'TABLAS PAREDES INTERIORES', prec: '5 ; 7', te: 3, cost: 600 },
  { id: 9, tarea: 'PINT', desc: 'PINTURA EXT. E INT.', prec: '4 ; 6 ; 8', te: 2, cost: 900 }
];

function computeAOA(tasks) {
  var taskMap = {};
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    taskMap[t.tarea] = { id: t.id, tarea: t.tarea, desc: t.desc, prec: t.prec, te: t.te, cost: t.cost, preds: [], succs: [] };
  }

  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    if (t.prec && t.prec !== '-') {
      var pArr = t.prec.split(';');
      for (var j = 0; j < pArr.length; j++) {
        var p = pArr[j].replace(/^\s+|\s+$/g, ''); // trim
        var parent = null;
        for (var k = 0; k < tasks.length; k++) {
          if (String(tasks[k].id) === p || tasks[k].tarea === p) {
            parent = tasks[k];
            break;
          }
        }
        if (!parent) return { error: "Precedente no encontrado: " + p };
        taskMap[t.tarea].preds.push(parent.tarea);
        taskMap[parent.tarea].succs.push(t.tarea);
      }
    }
  }

  var taskList = [];
  for (var k in taskMap) {
    taskList.push(taskMap[k]);
  }

  // Unique sets
  var uniqueSets = {};
  for (var i = 0; i < taskList.length; i++) {
    var key = taskList[i].preds.slice().sort().join(';');
    uniqueSets[key] = true;
  }
  for (var i = 0; i < taskList.length; i++) {
    if (taskList[i].succs.length > 0) {
      uniqueSets[taskList[i].tarea] = true;
    }
  }

  var predSetsArray = [];
  for (var key in uniqueSets) {
    predSetsArray.push(key === '' ? [] : key.split(';'));
  }

  var nodeIdCounter = 1;
  var setNodeMap = {};

  function getSetKey(arr) {
    return arr.slice().sort().join(';');
  }

  var emptyKey = getSetKey([]);
  setNodeMap[emptyKey] = nodeIdCounter++;

  for (var i = 0; i < predSetsArray.length; i++) {
    var key = getSetKey(predSetsArray[i]);
    if (!setNodeMap[key]) {
      setNodeMap[key] = nodeIdCounter++;
    }
  }

  var finalNodeId = nodeIdCounter++;
  var edges = [];

  for (var i = 0; i < taskList.length; i++) {
    var t = taskList[i];
    var startKey = getSetKey(t.preds);
    var startNode = setNodeMap[startKey];
    
    var endNode;
    if (t.succs.length === 0) {
      endNode = finalNodeId;
    } else {
      var endKey = getSetKey([t.tarea]);
      endNode = setNodeMap[endKey];
    }

    edges.push({
      id: t.tarea,
      tarea: t.tarea,
      desc: t.desc,
      cost: t.cost,
      te: t.te,
      from: startNode,
      to: endNode,
      isDummy: false
    });
  }

  var nonStartSets = [];
  for (var i = 0; i < predSetsArray.length; i++) {
    if (predSetsArray[i].length > 0) nonStartSets.push(predSetsArray[i]);
  }
  
  function isSubset(a, b) {
    for (var i = 0; i < a.length; i++) {
      var found = false;
      for (var j = 0; j < b.length; j++) {
        if (a[i] === b[j]) { found = true; break; }
      }
      if (!found) return false;
    }
    return true;
  }

  for (var bIdx = 0; bIdx < nonStartSets.length; bIdx++) {
    var B = nonStartSets[bIdx];
    var keyB = getSetKey(B);
    var nodeB = setNodeMap[keyB];

    var properSubsets = [];
    for (var i = 0; i < nonStartSets.length; i++) {
      var A = nonStartSets[i];
      if (A.length < B.length && isSubset(A, B)) properSubsets.push(A);
    }

    var maximalSubsets = [];
    for (var i = 0; i < properSubsets.length; i++) {
      var A = properSubsets[i];
      var is_max = true;
      for (var j = 0; j < properSubsets.length; j++) {
        var C = properSubsets[j];
        if (C.length > A.length && isSubset(A, C) && isSubset(C, B)) {
          is_max = false;
          break;
        }
      }
      if (is_max) maximalSubsets.push(A);
    }

    for (var i = 0; i < maximalSubsets.length; i++) {
      var A = maximalSubsets[i];
      var keyA = getSetKey(A);
      var nodeA = setNodeMap[keyA];
      edges.push({
        id: "Ficticia_" + nodeA + "_" + nodeB,
        tarea: "Ficticia",
        desc: "Tarea Ficticia",
        cost: 0,
        te: 0,
        from: nodeA,
        to: nodeB,
        isDummy: true
      });
    }

    var covered = {};
    for (var i = 0; i < maximalSubsets.length; i++) {
      var A = maximalSubsets[i];
      for (var j = 0; j < A.length; j++) covered[A[j]] = true;
    }
    for (var i = 0; i < B.length; i++) {
      var x = B[i];
      if (!covered[x]) {
        var keyA = getSetKey([x]);
        var nodeA = setNodeMap[keyA];
        if (nodeA !== nodeB) {
          edges.push({
            id: "Ficticia_" + nodeA + "_" + nodeB,
            tarea: "Ficticia",
            desc: "Tarea Ficticia",
            cost: 0,
            te: 0,
            from: nodeA,
            to: nodeB,
            isDummy: true
          });
        }
      }
    }
  }

  function getReachability(tasksList, edgesList) {
    var adj = {};
    for (var i = 0; i < edgesList.length; i++) {
      var edge = edgesList[i];
      if (!adj[edge.from]) adj[edge.from] = [];
      adj[edge.from].push(edge.to);
    }

    var reach = {};
    var realTasks = [];
    for (var i = 0; i < edgesList.length; i++) {
      if (!edgesList[i].isDummy) realTasks.push(edgesList[i]);
    }

    for (var i = 0; i < realTasks.length; i++) {
      var t1 = realTasks[i];
      reach[t1.tarea] = {};

      var visited = {};
      var queue = [t1.to];
      visited[t1.to] = true;

      while (queue.length > 0) {
        var curr = queue.shift();
        var neighbors = adj[curr] || [];
        for (var j = 0; j < neighbors.length; j++) {
          var n = neighbors[j];
          if (!visited[n]) {
            visited[n] = true;
            queue.push(n);
          }
        }
      }

      for (var j = 0; j < realTasks.length; j++) {
        var t2 = realTasks[j];
        if (visited[t2.from]) {
          reach[t1.tarea][t2.tarea] = true;
        }
      }
    }
    return reach;
  }

  var initialReach = getReachability(taskList, edges);

  function hasPath(from, to, edgesList, ignoreIdx) {
    var adj = {};
    for (var i = 0; i < edgesList.length; i++) {
      if (i === ignoreIdx) continue;
      var edge = edgesList[i];
      if (!adj[edge.from]) adj[edge.from] = [];
      adj[edge.from].push(edge.to);
    }

    var visited = {};
    var queue = [from];
    visited[from] = true;

    while (queue.length > 0) {
      var curr = queue.shift();
      if (curr === to) return true;
      var neighbors = adj[curr] || [];
      for (var i = 0; i < neighbors.length; i++) {
        var n = neighbors[i];
        if (!visited[n]) {
          visited[n] = true;
          queue.push(n);
        }
      }
    }
    return false;
  }

  function canContract(eIdx, edgesList) {
    var edge = edgesList[eIdx];
    var u = edge.from;
    var v = edge.to;

    if (hasPath(u, v, edgesList, eIdx)) {
      return false;
    }

    var temp = [];
    for (var i = 0; i < edgesList.length; i++) {
      if (i === eIdx) continue;
      var edge_item = edgesList[i];
      var fr = edge_item.from === u ? v : edge_item.from;
      var to = edge_item.to === u ? v : edge_item.to;
      temp.push({ id: edge_item.id, tarea: edge_item.tarea, from: fr, to: to, isDummy: edge_item.isDummy });
    }

    for (var i = 0; i < temp.length; i++) {
      for (var j = i + 1; j < temp.length; j++) {
        if (temp[i].from === temp[j].from && temp[i].to === temp[j].to) {
          return false;
        }
      }
    }

    var tempReach = getReachability(taskList, temp);
    for (var i = 0; i < taskList.length; i++) {
      var t1 = taskList[i].tarea;
      for (var j = 0; j < taskList.length; j++) {
        var t2 = taskList[j].tarea;
        var before = !!(initialReach[t1] && initialReach[t1][t2]);
        var after = !!(tempReach[t1] && tempReach[t1][t2]);
        if (before !== after) return false;
      }
    }

    return true;
  }

  function contract(eIdx, edgesList) {
    var edge = edgesList[eIdx];
    var u = edge.from;
    var v = edge.to;

    for (var i = 0; i < edgesList.length; i++) {
      var edge_item = edgesList[i];
      if (edge_item.from === u) edge_item.from = v;
      if (edge_item.to === u) edge_item.to = v;
    }

    edgesList.splice(eIdx, 1);
  }

  var changed = true;
  while (changed) {
    changed = false;
    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      if (e.isDummy) {
        if (canContract(i, edges)) {
          contract(i, edges);
          changed = true;
          break;
        }
      }
    }
  }

  var nodesMap = {};
  for (var i = 0; i < edges.length; i++) {
    nodesMap[edges[i].from] = true;
    nodesMap[edges[i].to] = true;
  }
  var nodes = [];
  for (var k in nodesMap) nodes.push(Number(k));

  var adj = {};
  var inDegree = {};
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    adj[n] = [];
    inDegree[n] = 0;
  }
  for (var i = 0; i < edges.length; i++) {
    var e = edges[i];
    adj[e.from].push(e.to);
    inDegree[e.to]++;
  }

  var queue = [];
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    if (inDegree[n] === 0) queue.push(n);
  }

  var sortedNodes = [];
  while (queue.length > 0) {
    var curr = queue.shift();
    sortedNodes.push(curr);
    var neighbors = adj[curr] || [];
    for (var i = 0; i < neighbors.length; i++) {
      var n = neighbors[i];
      inDegree[n]--;
      if (inDegree[n] === 0) {
        queue.push(n);
      }
    }
  }

  var nodeRenumberMap = {};
  for (var i = 0; i < sortedNodes.length; i++) {
    nodeRenumberMap[sortedNodes[i]] = i + 1;
  }

  for (var i = 0; i < edges.length; i++) {
    edges[i].from = nodeRenumberMap[edges[i].from];
    edges[i].to = nodeRenumberMap[edges[i].to];
  }

  var N = sortedNodes.length;
  var Fti = [];
  var FTj = [];
  for (var i = 0; i <= N; i++) {
    Fti.push(0);
    FTj.push(0);
  }

  for (var i = 1; i <= N; i++) {
    var incoming = [];
    for (var j = 0; j < edges.length; j++) {
      if (edges[j].to === i) incoming.push(edges[j]);
    }
    if (incoming.length > 0) {
      var maxVal = 0;
      for (var j = 0; j < incoming.length; j++) {
        var val = Fti[incoming[j].from] + incoming[j].te;
        if (val > maxVal) maxVal = val;
      }
      Fti[i] = maxVal;
    }
  }

  var projectDuration = Fti[N];

  FTj[N] = projectDuration;
  for (var i = N - 1; i >= 1; i--) {
    var outgoing = [];
    for (var j = 0; j < edges.length; j++) {
      if (edges[j].from === i) outgoing.push(edges[j]);
    }
    var minVal = projectDuration;
    for (var j = 0; j < outgoing.length; j++) {
      var val = FTj[outgoing[j].to] - outgoing[j].te;
      if (val < minVal) minVal = val;
    }
    FTj[i] = minVal;
  }

  for (var i = 0; i < edges.length; i++) {
    var e = edges[i];
    e.ES = Fti[e.from];
    e.EF = Fti[e.from] + e.te;
    e.LF = FTj[e.to];
    e.LS = FTj[e.to] - e.te;
    e.MT = e.LF - e.ES - e.te;
    e.critical = (e.MT === 0);
  }

  var finalNodes = [];
  for (var i = 1; i <= N; i++) {
    finalNodes.push({ id: i, Fti: Fti[i], FTj: FTj[i] });
  }

  return {
    nodes: finalNodes,
    edges: edges,
    projectDuration: projectDuration
  };
}

var res = computeAOA(prefabData);
WScript.Echo("Duration: " + res.projectDuration);
for (var i = 0; i < res.nodes.length; i++) {
  var n = res.nodes[i];
  WScript.Echo("Node " + n.id + ": Fti=" + n.Fti + ", FTj=" + n.FTj);
}
for (var i = 0; i < res.edges.length; i++) {
  var e = res.edges[i];
  WScript.Echo(e.tarea + " (" + e.from + "->" + e.to + "), te=" + e.te + ", ES=" + e.ES + ", LF=" + e.LF + ", MT=" + e.MT + ", critical=" + e.critical);
}
