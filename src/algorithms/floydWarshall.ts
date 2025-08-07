
export const runFloydWarshall = (nodes, edges, startNodeId, endNodeId, isDirected) => {
  const n = nodes.length;
  const dist = Array(n).fill(null).map(() => Array(n).fill(Infinity));
  const next = Array(n).fill(null).map(() => Array(n).fill(null));

  // Map node IDs to indices
  const nodeToIndex = {};
  const indexToNode = {};
  nodes.forEach((node, index) => {
    nodeToIndex[node.id] = index;
    indexToNode[index] = node.id;
  });

  // Initialize distance matrix
  nodes.forEach((node, i) => {
    dist[i][i] = 0;
  });

  edges.forEach(edge => {
    const i = nodeToIndex[edge.from];
    const j = nodeToIndex[edge.to];
    dist[i][j] = edge.weight;
    next[i][j] = j;
    
    if (!isDirected) {
      dist[j][i] = edge.weight;
      next[j][i] = i;
    }
  });

  // Floyd-Warshall algorithm
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
  }

  // Reconstruct path
  const startIndex = nodeToIndex[startNodeId];
  const endIndex = nodeToIndex[endNodeId];
  
  if (dist[startIndex][endIndex] === Infinity) {
    return {
      path: [],
      totalCost: Infinity,
      message: "No path found"
    };
  }

  const path = [];
  let current = startIndex;
  path.push(indexToNode[current]);

  while (current !== endIndex) {
    current = next[current][endIndex];
    if (current === null) break;
    path.push(indexToNode[current]);
  }

  return {
    path: path.map(nodeId => parseInt(nodeId)),
    totalCost: dist[startIndex][endIndex],
    distances: dist,
    message: "All-pairs shortest path computed"
  };
};
