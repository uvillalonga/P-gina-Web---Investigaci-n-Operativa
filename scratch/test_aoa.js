const prefabData = [
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
  const taskMap = {};
  tasks.forEach(t => {
    taskMap[t.tarea] = { ...t, preds: [], succs: [] };
  });

  for (const t of tasks) {
    if (t.prec && t.prec !== '-') {
      const pArr = t.prec.split(';');
      for (const p of pArr) {
        const parent = tasks.find(x => String(x.id) === p.trim() || x.tarea === p.trim());
        if (!parent) return { error: `Precedente no encontrado: ${p}` };
        taskMap[t.tarea].preds.push(parent.tarea);
        taskMap[parent.tarea].succs.push(t.tarea);
      }
    }
  }

  const taskList = Object.values(taskMap);

  const uniqueSets = new Set();
  taskList.forEach(t => {
    const key = t.preds.slice().sort().join(';');
    uniqueSets.add(key);
  });

  taskList.forEach(t => {
    if (t.succs.length > 0) {
      uniqueSets.add(t.tarea);
    }
  });

  const predSetsArray = Array.from(uniqueSets).map(key => {
    return key === '' ? [] : key.split(';');
  });

  let nodeIdCounter = 1;
  const setNodeMap = {};

  function getSetKey(arr) {
    return arr.slice().sort().join(';');
  }

  const emptyKey = getSetKey([]);
  setNodeMap[emptyKey] = nodeIdCounter++;

  predSetsArray.forEach(set => {
    const key = getSetKey(set);
    if (!setNodeMap[key]) {
      setNodeMap[key] = nodeIdCounter++;
    }
  });

  const finalNodeId = nodeIdCounter++;
  let edges = [];

  taskList.forEach(t => {
    const startKey = getSetKey(t.preds);
    const startNode = setNodeMap[startKey];
    
    let endNode;
    if (t.succs.length === 0) {
      endNode = finalNodeId;
    } else {
      const endKey = getSetKey([t.tarea]);
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
  });

  const nonStartSets = predSetsArray.filter(s => s.length > 0);
  
  function isSubset(a, b) {
    return a.every(x => b.includes(x));
  }

  nonStartSets.forEach(B => {
    const keyB = getSetKey(B);
    const nodeB = setNodeMap[keyB];

    const properSubsets = nonStartSets.filter(A => {
      return A.length < B.length && isSubset(A, B);
    });

    const maximalSubsets = properSubsets.filter(A => {
      return !properSubsets.some(C => {
        return C.length > A.length && isSubset(A, C) && isSubset(C, B);
      });
    });

    maximalSubsets.forEach(A => {
      const keyA = getSetKey(A);
      const nodeA = setNodeMap[keyA];
      edges.push({
        id: `Ficticia_${nodeA}_${nodeB}`,
        tarea: 'Ficticia',
        desc: 'Tarea Ficticia',
        cost: 0,
        te: 0,
        from: nodeA,
        to: nodeB,
        isDummy: true
      });
    });

    const covered = new Set();
    maximalSubsets.forEach(A => A.forEach(x => covered.add(x)));
    B.forEach(x => {
      if (!covered.has(x)) {
        const keyA = getSetKey([x]);
        const nodeA = setNodeMap[keyA];
        if (nodeA !== nodeB) {
          edges.push({
            id: `Ficticia_${nodeA}_${nodeB}`,
            tarea: 'Ficticia',
            desc: 'Tarea Ficticia',
            cost: 0,
            te: 0,
            from: nodeA,
            to: nodeB,
            isDummy: true
          });
        }
      }
    });
  });

  let nodes = Array.from(new Set(edges.flatMap(e => [e.from, e.to])));

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (e.isDummy) {
        if (canContract(i, edges)) {
          contract(i, edges);
          changed = true;
          break;
        }
      }
    }
  }

  nodes = Array.from(new Set(edges.flatMap(e => [e.from, e.to])));

  function hasPath(from, to, edgesList, ignoreIdx) {
    const adj = {};
    edgesList.forEach((edge, idx) => {
      if (idx === ignoreIdx) return;
      if (!adj[edge.from]) adj[edge.from] = [];
      adj[edge.from].push(edge.to);
    });

    const visited = new Set();
    const queue = [from];
    visited.add(from);

    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr === to) return true;
      const neighbors = adj[curr] || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return false;
  }

  function canContract(eIdx, edgesList) {
    const edge = edgesList[eIdx];
    const u = edge.from;
    const v = edge.to;

    if (hasPath(u, v, edgesList, eIdx)) {
      return false;
    }

    const temp = edgesList.map((edge, idx) => {
      if (idx === eIdx) return null;
      const from = edge.from === u ? v : edge.from;
      const to = edge.to === u ? v : edge.to;
      return { from, to };
    }).filter(Boolean);

    for (let i = 0; i < temp.length; i++) {
      for (let j = i + 1; j < temp.length; j++) {
        if (temp[i].from === temp[j].from && temp[i].to === temp[j].to) {
          return false;
        }
      }
    }

    return true;
  }

  function contract(eIdx, edgesList) {
    const edge = edgesList[eIdx];
    const u = edge.from;
    const v = edge.to;

    edgesList.forEach(edge => {
      if (edge.from === u) edge.from = v;
      if (edge.to === u) edge.to = v;
    });

    edgesList.splice(eIdx, 1);
  }

  const adj = {};
  const inDegree = {};
  nodes.forEach(n => {
    adj[n] = [];
    inDegree[n] = 0;
  });
  edges.forEach(e => {
    adj[e.from].push(e.to);
    inDegree[e.to]++;
  });

  const queue = [];
  nodes.forEach(n => {
    if (inDegree[n] === 0) queue.push(n);
  });

  const sortedNodes = [];
  while (queue.length > 0) {
    const curr = queue.shift();
    sortedNodes.push(curr);
    const neighbors = adj[curr] || [];
    for (const n of neighbors) {
      inDegree[n]--;
      if (inDegree[n] === 0) {
        queue.push(n);
      }
    }
  }

  if (sortedNodes.length !== nodes.length) {
    return { error: 'Inconsistencia lógica: Se detectó un ciclo en la red de actividades.' };
  }

  const nodeRenumberMap = {};
  sortedNodes.forEach((oldId, idx) => {
    nodeRenumberMap[oldId] = idx + 1;
  });

  edges.forEach(e => {
    e.from = nodeRenumberMap[e.from];
    e.to = nodeRenumberMap[e.to];
  });

  const N = sortedNodes.length;
  const Fti = Array(N + 1).fill(0);
  const FTj = Array(N + 1).fill(0);

  for (let i = 1; i <= N; i++) {
    const incoming = edges.filter(e => e.to === i);
    if (incoming.length > 0) {
      let maxVal = 0;
      incoming.forEach(e => {
        const val = Fti[e.from] + e.te;
        if (val > maxVal) maxVal = val;
      });
      Fti[i] = maxVal;
    }
  }

  const projectDuration = Fti[N];

  FTj[N] = projectDuration;
  for (let i = N - 1; i >= 1; i--) {
    const outgoing = edges.filter(e => e.from === i);
    let minVal = projectDuration;
    outgoing.forEach(e => {
      const val = FTj[e.to] - e.te;
      if (val < minVal) minVal = val;
    });
    FTj[i] = minVal;
  }

  edges.forEach(e => {
    e.ES = Fti[e.from];
    e.EF = Fti[e.from] + e.te;
    e.LF = FTj[e.to];
    e.LS = FTj[e.to] - e.te;
    e.MT = Math.round((e.LF - e.ES - e.te) * 1000000) / 1000000;
    e.critical = (e.MT === 0);
  });

  const finalNodes = [];
  for (let i = 1; i <= N; i++) {
    finalNodes.push({
      id: i,
      Fti: Fti[i],
      FTj: FTj[i]
    });
  }

  return {
    ok: true,
    nodes: finalNodes,
    edges: edges,
    projectDuration: projectDuration
  };
}

const result = computeAOA(prefabData);
console.log("Project Duration:", result.projectDuration);
console.log("Nodes:", JSON.stringify(result.nodes, null, 2));
console.log("Edges:", JSON.stringify(result.edges.map(e => ({ tarea: e.tarea, from: e.from, to: e.to, te: e.te, ES: e.ES, LF: e.LF, MT: e.MT, critical: e.critical })), null, 2));
