
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, FileText, Settings2, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import { runDijkstra } from '@/algorithms/dijkstra';
import { runAStar } from '@/algorithms/astar';
import { runBellmanFord } from '@/algorithms/bellmanFord';
import { runFloydWarshall } from '@/algorithms/floydWarshall';
import { runTSP } from '@/algorithms/tsp';
import { runMST } from '@/algorithms/mst';

export const AlgorithmPanel = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  isDirected,
  setIsDirected,
  setAnimationPath,
  setResults
}) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra');
  const [startNode, setStartNode] = useState(0);
  const [endNode, setEndNode] = useState(1);
  const [newNodeName, setNewNodeName] = useState('');
  const [newEdgeFrom, setNewEdgeFrom] = useState('');
  const [newEdgeTo, setNewEdgeTo] = useState('');
  const [newEdgeWeight, setNewEdgeWeight] = useState('');
  const [algorithmResults, setAlgorithmResults] = useState([]);

  const algorithms = {
    dijkstra: {
      name: "Dijkstra's Algorithm",
      description: "Finds shortest path from single source to all other vertices",
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V)",
      pseudocode: `1. Initialize distances to all vertices as infinite
2. Set distance to source as 0
3. Create a priority queue and add source
4. While queue is not empty:
   a. Extract vertex with minimum distance
   b. For each adjacent vertex:
      - Calculate new distance
      - If new distance < current distance:
        Update distance and add to queue`
    },
    astar: {
      name: "A* Algorithm",
      description: "Finds shortest path using heuristic to guide search",
      timeComplexity: "O(b^d)",
      spaceComplexity: "O(b^d)",
      pseudocode: `1. Initialize open and closed sets
2. Add start node to open set
3. While open set is not empty:
   a. Select node with lowest f(n) = g(n) + h(n)
   b. If node is goal, return path
   c. Move node to closed set
   d. For each neighbor:
      - Calculate g, h, and f values
      - Add to open set if better path found`
    },
    bellmanFord: {
      name: "Bellman-Ford Algorithm",
      description: "Finds shortest paths and detects negative cycles",
      timeComplexity: "O(VE)",
      spaceComplexity: "O(V)",
      pseudocode: `1. Initialize distances to all vertices as infinite
2. Set distance to source as 0
3. Repeat V-1 times:
   For each edge (u,v) with weight w:
     If dist[u] + w < dist[v]:
       dist[v] = dist[u] + w
4. Check for negative cycles`
    },
    floydWarshall: {
      name: "Floyd-Warshall Algorithm",
      description: "Finds shortest paths between all pairs of vertices",
      timeComplexity: "O(V³)",
      spaceComplexity: "O(V²)",
      pseudocode: `1. Initialize distance matrix with edge weights
2. For k from 1 to V:
   For i from 1 to V:
     For j from 1 to V:
       If dist[i][k] + dist[k][j] < dist[i][j]:
         dist[i][j] = dist[i][k] + dist[k][j]`
    },
    tsp: {
      name: "Traveling Salesman Problem",
      description: "Finds shortest route visiting all cities exactly once",
      timeComplexity: "O(n!)",
      spaceComplexity: "O(n)",
      pseudocode: `1. Generate all possible permutations of cities
2. For each permutation:
   a. Calculate total distance
   b. Keep track of minimum distance
3. Return permutation with minimum distance`
    },
    mst: {
      name: "Minimum Spanning Tree (Kruskal)",
      description: "Finds minimum cost to connect all vertices",
      timeComplexity: "O(E log E)",
      spaceComplexity: "O(V)",
      pseudocode: `1. Sort all edges by weight
2. Initialize disjoint set for each vertex
3. For each edge in sorted order:
   If edge connects different components:
     Add edge to MST
     Union the components`
    }
  };

  const runAlgorithm = () => {
    if (nodes.length === 0) {
      toast.error("Please add some nodes first");
      return;
    }

    const startTime = performance.now();
    let result;

    try {
      switch (selectedAlgorithm) {
        case 'dijkstra':
          result = runDijkstra(nodes, edges, startNode, endNode, isDirected);
          break;
        case 'astar':
          result = runAStar(nodes, edges, startNode, endNode, isDirected);
          break;
        case 'bellmanFord':
          result = runBellmanFord(nodes, edges, startNode, endNode, isDirected);
          break;
        case 'floydWarshall':
          result = runFloydWarshall(nodes, edges, startNode, endNode, isDirected);
          break;
        case 'tsp':
          result = runTSP(nodes, edges, startNode, isDirected);
          break;
        case 'mst':
          result = runMST(nodes, edges, isDirected);
          break;
        default:
          throw new Error("Unknown algorithm");
      }

      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);

      const algorithmInfo = algorithms[selectedAlgorithm];
      const finalResult = {
        ...result,
        algorithm: algorithmInfo.name,
        timeComplexity: algorithmInfo.timeComplexity,
        spaceComplexity: algorithmInfo.spaceComplexity,
        executionTime
      };

      setResults(finalResult);
      setAnimationPath(result.path || []);
      
      // Add to results history
      setAlgorithmResults(prev => [...prev, {
        ...finalResult,
        timestamp: new Date().toLocaleTimeString()
      }]);

      toast.success(`${algorithmInfo.name} completed successfully!`);
    } catch (error) {
      toast.error(`Algorithm failed: ${error.message}`);
    }
  };

  const addNode = () => {
    if (!newNodeName.trim()) {
      toast.error("Please enter a node name");
      return;
    }

    const newNode = {
      id: Math.max(...nodes.map(n => n.id), -1) + 1,
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      name: newNodeName.trim()
    };

    setNodes([...nodes, newNode]);
    setNewNodeName('');
    toast.success(`Added node: ${newNode.name}`);
  };

  const addEdge = () => {
    const from = parseInt(newEdgeFrom);
    const to = parseInt(newEdgeTo);
    const weight = parseInt(newEdgeWeight);

    if (isNaN(from) || isNaN(to) || isNaN(weight)) {
      toast.error("Please enter valid node IDs and weight");
      return;
    }

    if (!nodes.find(n => n.id === from) || !nodes.find(n => n.id === to)) {
      toast.error("Invalid node IDs");
      return;
    }

    if (from === to) {
      toast.error("Cannot create self-loop");
      return;
    }

    const newEdge = { from, to, weight };
    setEdges([...edges, newEdge]);
    setNewEdgeFrom('');
    setNewEdgeTo('');
    setNewEdgeWeight('');
    toast.success(`Added edge from ${from} to ${to} with weight ${weight}`);
  };

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.from !== nodeId && e.to !== nodeId));
    toast.success("Node deleted");
  };

  const deleteEdge = (index) => {
    setEdges(edges.filter((_, i) => i !== index));
    toast.success("Edge deleted");
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="algorithm" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="algorithm">
            <Play size={16} className="mr-2" />
            Algorithm
          </TabsTrigger>
          <TabsTrigger value="graph">
            <Settings2 size={16} className="mr-2" />
            Graph Setup
          </TabsTrigger>
          <TabsTrigger value="results">
            <BarChart size={16} className="mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="theory">
            <FileText size={16} className="mr-2" />
            Theory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="algorithm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Selection & Execution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="algorithm">Choose Algorithm</Label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(algorithms).map(([key, algo]) => (
                        <SelectItem key={key} value={key}>
                          {algo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="directed"
                    checked={isDirected}
                    onCheckedChange={setIsDirected}
                  />
                  <Label htmlFor="directed">Directed Graph</Label>
                </div>
              </div>

              {selectedAlgorithm !== 'mst' && selectedAlgorithm !== 'tsp' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Node ID</Label>
                    <Select value={startNode.toString()} onValueChange={(value) => setStartNode(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {nodes.map(node => (
                          <SelectItem key={node.id} value={node.id.toString()}>
                            {node.id} - {node.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAlgorithm !== 'floydWarshall' && (
                    <div className="space-y-2">
                      <Label htmlFor="end">End Node ID</Label>
                      <Select value={endNode.toString()} onValueChange={(value) => setEndNode(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {nodes.filter(node => node.id !== startNode).map(node => (
                            <SelectItem key={node.id} value={node.id.toString()}>
                              {node.id} - {node.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={runAlgorithm} className="w-full" size="lg">
                <Play className="mr-2" size={16} />
                Run {algorithms[selectedAlgorithm]?.name}
              </Button>

              {algorithms[selectedAlgorithm] && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">{algorithms[selectedAlgorithm].name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{algorithms[selectedAlgorithm].description}</p>
                  <div className="flex gap-4 text-xs">
                    <Badge variant="outline">Time: {algorithms[selectedAlgorithm].timeComplexity}</Badge>
                    <Badge variant="outline">Space: {algorithms[selectedAlgorithm].spaceComplexity}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Node</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nodeName">Node Name</Label>
                  <Input
                    id="nodeName"
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    placeholder="Enter node name"
                  />
                </div>
                <Button onClick={addNode} className="w-full">Add Node</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Edge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input
                      type="number"
                      value={newEdgeFrom}
                      onChange={(e) => setNewEdgeFrom(e.target.value)}
                      placeholder="From ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      type="number"
                      value={newEdgeTo}
                      onChange={(e) => setNewEdgeTo(e.target.value)}
                      placeholder="To ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <Input
                      type="number"
                      value={newEdgeWeight}
                      onChange={(e) => setNewEdgeWeight(e.target.value)}
                      placeholder="Weight"
                    />
                  </div>
                </div>
                <Button onClick={addEdge} className="w-full">Add Edge</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Nodes ({nodes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {nodes.map(node => (
                    <div key={node.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>ID: {node.id} - {node.name}</span>
                      <Button 
                        onClick={() => deleteNode(node.id)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Edges ({edges.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {edges.map((edge, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{edge.from} → {edge.to} (weight: {edge.weight})</span>
                      <Button 
                        onClick={() => deleteEdge(index)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Comparison Results</CardTitle>
            </CardHeader>
            <CardContent>
              {algorithmResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No results yet. Run some algorithms to see comparisons.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Algorithm</th>
                        <th className="text-left p-2">Path</th>
                        <th className="text-left p-2">Cost</th>
                        <th className="text-left p-2">Execution (ms)</th>
                        <th className="text-left p-2">Time Complexity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {algorithmResults.map((result, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{result.timestamp}</td>
                          <td className="p-2">{result.algorithm}</td>
                          <td className="p-2">{result.path?.join(' → ') || 'N/A'}</td>
                          <td className="p-2">{result.totalCost || 'N/A'}</td>
                          <td className="p-2">{result.executionTime}</td>
                          <td className="p-2">{result.timeComplexity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Theory & Pseudocode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="theoryAlgorithm">Select Algorithm for Details</Label>
                <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(algorithms).map(([key, algo]) => (
                      <SelectItem key={key} value={key}>
                        {algo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {algorithms[selectedAlgorithm] && (
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{algorithms[selectedAlgorithm].name}</h3>
                    <p className="text-gray-600">{algorithms[selectedAlgorithm].description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Badge className="mb-2">Time Complexity</Badge>
                      <p className="font-mono text-sm">{algorithms[selectedAlgorithm].timeComplexity}</p>
                    </div>
                    <div>
                      <Badge className="mb-2">Space Complexity</Badge>
                      <p className="font-mono text-sm">{algorithms[selectedAlgorithm].spaceComplexity}</p>
                    </div>
                  </div>

                  <div>
                    <Badge className="mb-2">Pseudocode</Badge>
                    <Textarea
                      value={algorithms[selectedAlgorithm].pseudocode}
                      readOnly
                      className="font-mono text-sm h-64"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
