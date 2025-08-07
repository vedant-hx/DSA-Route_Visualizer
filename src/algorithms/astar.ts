
export const runAStar = (nodes, edges, startNodeId, endNodeId, isDirected) => {
  const gScore = {};
  const fScore = {};
  const previous = {};
  const openSet = [];
  const closedSet = new Set();

  // Initialize scores
  nodes.forEach(node => {
    gScore[node.id] = node.id === startNodeId ? 0 : Infinity;
    fScore[node.id] = node.id === startNodeId ? heuristic(node.id, endNodeId, nodes) : Infinity;
    previous[node.id] = null;
  });

  openSet.push(startNodeId);

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let current = openSet.reduce((lowest, node) => 
      fScore[node] < fScore[lowest] ? node : lowest
    );

    if (current === endNodeId) {
      // Reconstruct path
      const path = [];
      while (current !== null) {
        path.unshift(current);
        current = previous[current];
      }
      return {
        path,
        totalCost: gScore[endNodeId],
        message: "Path found with A*"
      };
    }

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(current);

    // Find neighbors
    const adjacentEdges = edges.filter(edge => {
      if (isDirected) {
        return edge.from === current;
      } else {
        return edge.from === current || edge.to === current;
      }
    });

    adjacentEdges.forEach(edge => {
      const neighbor = edge.from === current ? edge.to : edge.from;
      
      if (closedSet.has(neighbor)) return;

      const tentativeGScore = gScore[current] + edge.weight;

      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= gScore[neighbor]) {
        return;
      }

      previous[neighbor] = current;
      gScore[neighbor] = tentativeGScore;
      fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, endNodeId, nodes);
    });
  }

  return {
    path: [],
    totalCost: Infinity,
    message: "No path found"
  };
};

function heuristic(nodeId1, nodeId2, nodes) {
  const node1 = nodes.find(n => n.id === nodeId1);
  const node2 = nodes.find(n => n.id === nodeId2);
  
  if (!node1 || !node2) return 0;
  
  // Euclidean distance as heuristic
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  return Math.sqrt(dx * dx + dy * dy) / 10; // Scale down for better performance
}
