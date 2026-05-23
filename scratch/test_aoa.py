import json

prefab_data = [
    { "id": 1, "tarea": 'EST', "desc": 'EREGIR LA ESTRUCTURA', "prec": '2', "te": 5, "cost": 1000 },
    { "id": 2, "tarea": 'CIM', "desc": 'HACER LOS CIMIENTOS', "prec": '-', "te": 3, "cost": 2000 },
    { "id": 3, "tarea": 'VITE', "desc": 'PONER LAS VIGAS TECHO', "prec": '1', "te": 2, "cost": 800 },
    { "id": 4, "tarea": 'RETE', "desc": 'REVESTIR EL TECHO', "prec": '3', "te": 3, "cost": 1200 },
    { "id": 5, "tarea": 'ELEC', "desc": 'CABLEADO ELECTRICO', "prec": '1', "te": 4, "cost": 1500 },
    { "id": 6, "tarea": 'EXT', "desc": 'TABLAS PAREDES EXTERIORES', "prec": '7', "te": 4, "cost": 1100 },
    { "id": 7, "tarea": 'VENT', "desc": 'COLOCAR LAS VENTANAS', "prec": '1', "te": 2, "cost": 500 },
    { "id": 8, "tarea": 'INT', "desc": 'TABLAS PAREDES INTERIORES', "prec": '5 ; 7', "te": 3, "cost": 600 },
    { "id": 9, "tarea": 'PINT', "desc": 'PINTURA EXT. E INT.', "prec": '4 ; 6 ; 8', "te": 2, "cost": 900 }
]

def computeAOA(tasks):
    taskMap = {}
    for t in tasks:
        taskMap[t["tarea"]] = {**t, "preds": [], "succs": []}

    for t in tasks:
        if t["prec"] and t["prec"] != '-':
            pArr = [p.strip() for p in t["prec"].split(';') if p.strip()]
            for p in pArr:
                parent = None
                for x in tasks:
                    if str(x["id"]) == p or x["tarea"] == p:
                        parent = x
                        break
                if not parent:
                    return {"error": f"Precedente no encontrado: {p}"}
                taskMap[t["tarea"]]["preds"].append(parent["tarea"])
                taskMap[parent["tarea"]]["succs"].append(t["tarea"])

    taskList = list(taskMap.values())

    uniqueSets = set()
    for t in taskList:
        key = ";".join(sorted(t["preds"]))
        uniqueSets.add(key)

    for t in taskList:
        if len(t["succs"]) > 0:
            uniqueSets.add(t["tarea"])

    predSetsArray = []
    for key in uniqueSets:
        if key == '':
            predSetsArray.append([])
        else:
            predSetsArray.append(key.split(';'))

    nodeIdCounter = 1
    setNodeMap = {}

    def getSetKey(arr):
        return ";".join(sorted(arr))

    emptyKey = getSetKey([])
    setNodeMap[emptyKey] = nodeIdCounter
    nodeIdCounter += 1

    for s in predSetsArray:
        key = getSetKey(s)
        if key not in setNodeMap:
            setNodeMap[key] = nodeIdCounter
            nodeIdCounter += 1

    finalNodeId = nodeIdCounter
    nodeIdCounter += 1
    edges = []

    for t in taskList:
        startKey = getSetKey(t["preds"])
        startNode = setNodeMap[startKey]
        
        if len(t["succs"]) == 0:
            endNode = finalNodeId
        else:
            endKey = getSetKey([t["tarea"]])
            endNode = setNodeMap[endKey]

        edges.append({
            "id": t["tarea"],
            "tarea": t["tarea"],
            "desc": t["desc"],
            "cost": t["cost"],
            "te": t["te"],
            "from": startNode,
            "to": endNode,
            "isDummy": False
        })

    nonStartSets = [s for s in predSetsArray if len(s) > 0]
    
    def isSubset(a, b):
        return all(x in b for x in a)

    for B in nonStartSets:
        keyB = getSetKey(B)
        nodeB = setNodeMap[keyB]

        properSubsets = [A for A in nonStartSets if len(A) < len(B) and isSubset(A, B)]

        maximalSubsets = []
        for A in properSubsets:
            # Check if there is another set C in properSubsets such that A C C C B
            is_max = True
            for C in properSubsets:
                if len(C) > len(A) and isSubset(A, C) and isSubset(C, B):
                    is_max = False
                    break
            if is_max:
                maximalSubsets.append(A)

        for A in maximalSubsets:
            keyA = getSetKey(A)
            nodeA = setNodeMap[keyA]
            edges.append({
                "id": f"Ficticia_{nodeA}_{nodeB}",
                "tarea": "Ficticia",
                "desc": "Tarea Ficticia",
                "cost": 0,
                "te": 0,
                "from": nodeA,
                "to": nodeB,
                "isDummy": True
            })

        covered = set()
        for A in maximalSubsets:
            for x in A:
                covered.add(x)
        for x in B:
            if x not in covered:
                keyA = getSetKey([x])
                nodeA = setNodeMap[keyA]
                if nodeA != nodeB:
                    edges.append({
                        "id": f"Ficticia_{nodeA}_{nodeB}",
                        "tarea": "Ficticia",
                        "desc": "Tarea Ficticia",
                        "cost": 0,
                        "te": 0,
                        "from": nodeA,
                        "to": nodeB,
                        "isDummy": True
                    })

    def hasPath(start, target, edgesList, ignoreIdx):
        adj = {}
        for idx, edge in enumerate(edgesList):
            if idx == ignoreIdx:
                continue
            if edge["from"] not in adj:
                adj[edge["from"]] = []
            adj[edge["from"]].append(edge["to"])

        visited = set()
        queue = [start]
        visited.add(start)

        while queue:
            curr = queue.pop(0)
            if curr == target:
                return True
            neighbors = adj.get(curr, [])
            for n in neighbors:
                if n not in visited:
                    visited.add(n)
                    queue.append(n)
        return False

    def canContract(eIdx, edgesList):
        edge = edgesList[eIdx]
        u = edge["from"]
        v = edge["to"]

        if hasPath(u, v, edgesList, eIdx):
            return False

        temp = []
        for idx, edge_item in enumerate(edgesList):
            if idx == eIdx:
                continue
            fr = v if edge_item["from"] == u else edge_item["from"]
            to = v if edge_item["to"] == u else edge_item["to"]
            temp.append((fr, to))

        for i in range(len(temp)):
            for j in range(i + 1, len(temp)):
                if temp[i][0] == temp[j][0] and temp[i][1] == temp[j][1]:
                    return False
        return True

    def contract(eIdx, edgesList):
        edge = edgesList[eIdx]
        u = edge["from"]
        v = edge["to"]

        for edge_item in edgesList:
            if edge_item["from"] == u:
                edge_item["from"] = v
            if edge_item["to"] == u:
                edge_item["to"] = v

        edgesList.pop(eIdx)

    changed = True
    while changed:
        changed = False
        for i in range(len(edges)):
            e = edges[i]
            if e["isDummy"]:
                if canContract(i, edges):
                    contract(i, edges)
                    changed = True
                    break

    nodes = list(set(e["from"] for e in edges) | set(e["to"] for e in edges))

    adj = {n: [] for n in nodes}
    inDegree = {n: 0 for n in nodes}
    for e in edges:
        adj[e["from"]].append(e["to"])
        inDegree[e["to"]] += 1

    queue = [n for n in nodes if inDegree[n] == 0]
    sortedNodes = []
    while queue:
        curr = queue.pop(0)
        sortedNodes.append(curr)
        for neighbors in adj.get(curr, []):
            inDegree[neighbors] -= 1
            if inDegree[neighbors] == 0:
                queue.append(neighbors)

    nodeRenumberMap = {oldId: idx + 1 for idx, oldId in enumerate(sortedNodes)}

    for e in edges:
        e["from"] = nodeRenumberMap[e["from"]]
        e["to"] = nodeRenumberMap[e["to"]]

    N = len(sortedNodes)
    Fti = [0] * (N + 1)
    FTj = [0] * (N + 1)

    for i in range(1, N + 1):
        incoming = [e for e in edges if e["to"] == i]
        if incoming:
            maxVal = 0
            for e in incoming:
                val = Fti[e["from"]] + e["te"]
                if val > maxVal:
                    maxVal = val
            Fti[i] = maxVal

    projectDuration = Fti[N]

    FTj[N] = projectDuration
    for i in range(N - 1, 0, -1):
        outgoing = [e for e in edges if e["from"] == i]
        minVal = projectDuration
        for e in outgoing:
            val = FTj[e["to"]] - e["te"]
            if val < minVal:
                minVal = val
        FTj[i] = minVal

    for e in edges:
        e["ES"] = Fti[e["from"]]
        e["EF"] = Fti[e["from"]] + e["te"]
        e["LF"] = FTj[e["to"]]
        e["LS"] = FTj[e["to"]] - e["te"]
        e["MT"] = e["LF"] - e["ES"] - e["te"]
        e["critical"] = (e["MT"] == 0)

    finalNodes = [{"id": i, "Fti": Fti[i], "FTj": FTj[i]} for i in range(1, N + 1)]

    return {
        "nodes": finalNodes,
        "edges": edges,
        "projectDuration": projectDuration
    }

res = computeAOA(prefabData)
print("Duration:", res["projectDuration"])
print("Nodes:")
for n in res["nodes"]:
    print(n)
print("Edges:")
for e in res["edges"]:
    print(f"{e['tarea']} ({e['from']} -> {e['to']}), te={e['te']}, ES={e['ES']}, LF={e['LF']}, MT={e['MT']}, critical={e['critical']}")
