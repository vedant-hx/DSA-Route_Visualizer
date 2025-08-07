
export const runBellmanFord = (nodes, edges, startNodeId, endNodeId, isDirected) => {
  const distances = {};
  const previous = {};

  // Initialize distances
  nodes.forEach(node => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
  });

  // Relax edges repeatedly
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.forEach(edge => {
      // For undirected graphs, consider both directions
      const edgesToProcess = isDirected ? [edge] : [edge, { from: edge.to, to: edge.from, weight: edge.weight }];
      
      edgesToProcess.forEach(({ from, to, weight }) => {
        if (distances[from] !== Infinity && distances[from] + weight < distances[to]) {
          distances[to] = distances[from] + weight;
          previous[to] = from;
        }
      });
    });
  }

  // Check for negative cycles
  const hasNegativeCycle = edges.some(edge => {
    const edgesToCheck = isDirected ? [edge] : [edge, { from: edge.to, to: edge.from, weight: edge.weight }];
    return edgesToCheck.some(({ from, to, weight }) => {
      return distances[from] !== Infinity && distances[from] + weight < distances[to];
    });
  });

  if (hasNegativeCycle) {
    return {
      path: [],
      totalCost: -Infinity,
      message: "Negative cycle detected"
    };
  }

  // Reconstruct path
  const path = [];
  let currentNode = endNodeId;
  
  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = previous[currentNode];
  }

  if (path[0] !== startNodeId) {
    return {
      path: [],
      totalCost: Infinity,
      message: "No path found"
    };
  }

  return {
    path,
    totalCost: distances[endNodeId],
    distances,
    message: "Shortest path found (handles negative weights)"
  };
};
