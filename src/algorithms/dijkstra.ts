
export const runDijkstra = (nodes, edges, startNodeId, endNodeId, isDirected) => {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const queue = [];

  // Initialize distances
  nodes.forEach(node => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
  });

  queue.push({ nodeId: startNodeId, distance: 0 });

  while (queue.length > 0) {
    // Sort queue by distance (simple priority queue)
    queue.sort((a, b) => a.distance - b.distance);
    const current = queue.shift();

    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    if (current.nodeId === endNodeId) break;

    // Find adjacent nodes
    const adjacentEdges = edges.filter(edge => {
      if (isDirected) {
        return edge.from === current.nodeId;
      } else {
        return edge.from === current.nodeId || edge.to === current.nodeId;
      }
    });

    adjacentEdges.forEach(edge => {
      const neighborId = edge.from === current.nodeId ? edge.to : edge.from;
      
      if (visited.has(neighborId)) return;

      const newDistance = distances[current.nodeId] + edge.weight;

      if (newDistance < distances[neighborId]) {
        distances[neighborId] = newDistance;
        previous[neighborId] = current.nodeId;
        queue.push({ nodeId: neighborId, distance: newDistance });
      }
    });
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
      distances,
      message: "No path found"
    };
  }

  return {
    path,
    totalCost: distances[endNodeId],
    distances,
    message: "Shortest path found"
  };
};
