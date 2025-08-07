
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraphVisualizer } from '@/components/GraphVisualizer';
import { AlgorithmPanel } from '@/components/AlgorithmPanel';
import { Route, MapPin, Settings, BarChart3 } from 'lucide-react';

const Index = () => {
  const [nodes, setNodes] = useState([
    { id: 0, x: 150, y: 100, name: "Warehouse" },
    { id: 1, x: 300, y: 150, name: "Stop A" },
    { id: 2, x: 200, y: 250, name: "Stop B" },
    { id: 3, x: 400, y: 200, name: "Stop C" },
    { id: 4, x: 350, y: 350, name: "Stop D" }
  ]);

  const [edges, setEdges] = useState([
    { from: 0, to: 1, weight: 10 },
    { from: 0, to: 2, weight: 15 },
    { from: 1, to: 2, weight: 8 },
    { from: 1, to: 3, weight: 12 },
    { from: 2, to: 3, weight: 6 },
    { from: 2, to: 4, weight: 20 },
    { from: 3, to: 4, weight: 9 }
  ]);

  const [isDirected, setIsDirected] = useState(false);
  const [animationPath, setAnimationPath] = useState([]);
  const [results, setResults] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Route className="text-blue-600" size={40} />
            Delivery Route Optimizer
          </h1>
          <p className="text-lg text-gray-600">
            Interactive Algorithm Visualizer for Data Structures & Algorithms
          </p>
        </div>

        <Tabs defaultValue="visualizer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="visualizer" className="flex items-center gap-2">
              <MapPin size={18} />
              Route Visualization
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Settings size={18} />
              Algorithm Controls
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualizer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="text-green-600" />
                  Interactive Graph Visualization
                </CardTitle>
                <CardDescription>
                  Click to add nodes, drag to connect them, and watch algorithms find optimal paths
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GraphVisualizer
                  nodes={nodes}
                  edges={edges}
                  setNodes={setNodes}
                  setEdges={setEdges}
                  isDirected={isDirected}
                  animationPath={animationPath}
                  results={results}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <AlgorithmPanel
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              isDirected={isDirected}
              setIsDirected={setIsDirected}
              setAnimationPath={setAnimationPath}
              setResults={setResults}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
