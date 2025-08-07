//TRAVELLING SALESMAN PROBLEM
export const runTSP = (nodes, edges, startNodeId, isDirected) => {
  if (nodes.length > 8) {
    return runTSPGreedy(nodes, edges, startNodeId, isDirected);
  }
  
  return runTSPBruteForce(nodes, edges, startNodeId, isDirected);
};

function runTSPBruteForce(nodes, edges, startNodeId, isDirected) {
  const otherNodes = nodes.filter(node => node.id !== startNodeId);
  const permutations = getPermutations(otherNodes.map(n => n.id));
  
  let minDistance = Infinity;
  let bestPath = [];
  
  permutations.forEach(perm => {
    const path = [startNodeId, ...perm, startNodeId];
    const distance = calculatePathDistance(path, edges, isDirected);
    
    if (distance < minDistance) {
      minDistance = distance;
      bestPath = path;
    }
  });
  

  return {
    path: bestPath,
    totalCost: minDistance,
    message: "TSP solved with brute force"
  };
}

function runTSPGreedy(nodes, edges, startNodeId, isDirected) {
  const unvisited = new Set(nodes.map(n => n.id));
  const path = [startNodeId];
  unvisited.delete(startNodeId);
  
  let current = startNodeId;
  let totalCost = 0;
  
  while (unvisited.size > 0) {
    let nearestNode = null;
    let nearestDistance = Infinity;
    
    unvisited.forEach(nodeId => {
      const distance = getEdgeWeight(current, nodeId, edges, isDirected);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestNode = nodeId;
      }
    });
    
    if (nearestNode !== null) {
      path.push(nearestNode);
      totalCost += nearestDistance;
      unvisited.delete(nearestNode);
      current = nearestNode;
    } else {
      break;
    }
  }
  
  // Return to start
  const returnDistance = getEdgeWeight(current, startNodeId, edges, isDirected);
  if (returnDistance !== Infinity) {
    path.push(startNodeId);
    totalCost += returnDistance;
  }
  
  return {
    path,
    totalCost,
    message: "TSP solved with greedy approximation"
  };
}

function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = getPermutations(rest);
    perms.forEach(perm => result.push([arr[i], ...perm]));
  }
  return result;
}

function calculatePathDistance(path, edges, isDirected) {
  let totalDistance = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const distance = getEdgeWeight(path[i], path[i + 1], edges, isDirected);
    if (distance === Infinity) return Infinity;
    totalDistance += distance;
  }
  
  return totalDistance;
}

function getEdgeWeight(from, to, edges, isDirected) {
  const edge = edges.find(e => {
    if (isDirected) {
      return e.from === from && e.to === to;
    } else {
      return (e.from === from && e.to === to) || (e.from === to && e.to === from);
    }
  });
  
  return edge ? edge.weight : Infinity;
}
