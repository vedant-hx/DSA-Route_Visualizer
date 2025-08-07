// MINIUM SPANNING TREE
export const runMST = (nodes, edges, isDirected) => {
  if (isDirected) {
    return {
      path: [],
      totalCost: 0,
      message: "MST not applicable for directed graphs"
    };
  }
  
  return runKruskal(nodes, edges);
};

function runKruskal(nodes, edges) {
  // Sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  
  // Initialize disjoint set
  const parent = {};
  const rank = {};
  
  nodes.forEach(node => {
    parent[node.id] = node.id;
    rank[node.id] = 0;
  });
  
  function find(x) {
    if (parent[x] !== x) {
      parent[x] = find(parent[x]);
    }
    return parent[x];
  }
  
  function union(x, y) {
    const rootX = find(x);
    const rootY = find(y);
    
    if (rootX !== rootY) {
      if (rank[rootX] < rank[rootY]) {
        parent[rootX] = rootY;
      } else if (rank[rootX] > rank[rootY]) {
        parent[rootY] = rootX;
      } else {
        parent[rootY] = rootX;
        rank[rootX]++;
      }
      return true;
    }
    return false;
  }
  
  const mstEdges = [];
  let totalCost = 0;
  
  sortedEdges.forEach(edge => {
    if (union(edge.from, edge.to)) {
      mstEdges.push(edge);
      totalCost += edge.weight;
    }
  });
  
  // Create path for visualization (DFS traversal of MST)
  const adjacencyList = {};
  nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  mstEdges.forEach(edge => {
    adjacencyList[edge.from].push(edge.to);
    adjacencyList[edge.to].push(edge.from);
  });
  
  const visited = new Set();
  const path = [];
  
  function dfs(nodeId) {
    visited.add(nodeId);
    path.push(nodeId);
    
    adjacencyList[nodeId].forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    });
  }
  
  if (nodes.length > 0) {
    dfs(nodes[0].id);
  }
  
  return {
    path,
    totalCost,
    mstEdges,
    message: `MST found with ${mstEdges.length} edges`
  };
}
