import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export const GraphVisualizer = ({ 
  nodes, 
  edges, 
  setNodes, 
  setEdges, 
  isDirected, 
  animationPath, 
  results 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [mode, setMode] = useState('select');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [carPosition, setCarPosition] = useState({ x: 0, y: 0 });
  const [currentSegment, setCurrentSegment] = useState(0);

  useEffect(() => {
    drawGraph();
  }, [nodes, edges, selectedNode, carPosition, currentSegment, animationProgress]);

  useEffect(() => {
    if (animationPath.length > 1 && !isAnimating) {
      startLiveAnimation();
    }
  }, [animationPath]);

  const startLiveAnimation = () => {
    if (animationPath.length < 2) return;
    
    setIsAnimating(true);
    setIsPaused(false);
    setCurrentSegment(0);
    setAnimationProgress(0);
    
    const startNode = nodes.find(n => n.id === animationPath[0]);
    if (startNode) {
      setCarPosition({ x: startNode.x, y: startNode.y });
    }
    
    animateCarMovement();
    toast.success("🚚 Starting route optimization!");
  };

  const animateCarMovement = () => {
    const animationSpeed = 2000; // ms per segment
    const frameRate = 60; // fps
    const totalFrames = animationSpeed / (1000 / frameRate);
    
    let currentFrame = 0;
    let segmentIndex = 0;

    const animate = () => {
      if (isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (segmentIndex >= animationPath.length - 1) {
        setIsAnimating(false);
        toast.success("🎯 Route optimization complete!");
        return;
      }

      const fromNode = nodes.find(n => n.id === animationPath[segmentIndex]);
      const toNode = nodes.find(n => n.id === animationPath[segmentIndex + 1]);
      
      if (!fromNode || !toNode) {
        segmentIndex++;
        currentFrame = 0;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = currentFrame / totalFrames;
      const easedProgress = easeInOutCubic(progress);
      
      const x = fromNode.x + (toNode.x - fromNode.x) * easedProgress;
      const y = fromNode.y + (toNode.y - fromNode.y) * easedProgress;
      
      setCarPosition({ x, y });
      setCurrentSegment(segmentIndex);
      setAnimationProgress(easedProgress);

      currentFrame++;
      
      if (currentFrame >= totalFrames) {
        segmentIndex++;
        currentFrame = 0;
        
        // Pause briefly at each node
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, 300);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const pauseAnimation = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      toast.info("⏸️ Animation paused");
    } else {
      toast.info("▶️ Animation resumed");
      animateCarMovement();
    }
  };

  const resetAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    setIsPaused(false);
    setCurrentSegment(0);
    setAnimationProgress(0);
    const startNode = nodes.find(n => n.id === animationPath[0]);
    if (startNode) {
      setCarPosition({ x: startNode.x, y: startNode.y });
    }
    toast.info("🔄 Animation reset");
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Draw edges
    edges.forEach((edge, index) => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return;
      
      // Check if this edge is part of the optimal path
      const isInOptimalPath = animationPath.some((pathNodeId, i) => {
        if (i === 0) return false;
        const prevNodeId = animationPath[i - 1];
        return (prevNodeId === edge.from && pathNodeId === edge.to) ||
               (!isDirected && prevNodeId === edge.to && pathNodeId === edge.from);
      });
      
      // Check if this edge has been traversed by the car
      const isTraversed = currentSegment > 0 && animationPath.slice(0, currentSegment + 1).some((pathNodeId, i) => {
        if (i === 0) return false;
        const prevNodeId = animationPath[i - 1];
        return (prevNodeId === edge.from && pathNodeId === edge.to) ||
               (!isDirected && prevNodeId === edge.to && pathNodeId === edge.from);
      });
      
      ctx.strokeStyle = isTraversed ? '#22c55e' : (isInOptimalPath ? '#ef4444' : '#64748b');
      ctx.lineWidth = isInOptimalPath ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
      
      // Draw arrow for directed graphs
      if (isDirected) {
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(
          toNode.x - arrowLength * Math.cos(angle - arrowAngle),
          toNode.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.lineTo(toNode.x, toNode.y);
        ctx.lineTo(
          toNode.x - arrowLength * Math.cos(angle + arrowAngle),
          toNode.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
      }
      
      // Draw weight
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(midX - 12, midY - 8, 24, 16);
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(edge.weight.toString(), midX, midY + 4);
    });
    
    // Draw nodes
    nodes.forEach((node, index) => {
      const isInOptimalPath = animationPath.includes(node.id);
      const isVisited = currentSegment >= 0 && animationPath.slice(0, currentSegment + 1).includes(node.id);
      
      ctx.fillStyle = isVisited ? '#22c55e' : 
                     isInOptimalPath ? '#fbbf24' : 
                     selectedNode === node.id ? '#3b82f6' : '#10b981';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw node label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.id.toString(), node.x, node.y + 4);
      
      // Draw node name
      ctx.fillStyle = '#374151';
      ctx.font = '10px Arial';
      ctx.fillText(node.name, node.x, node.y + 35);
    });
    
    // Draw animated car
    if (isAnimating || animationPath.length > 0) {
      // Car body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(carPosition.x - 15, carPosition.y - 10, 30, 20, 5);
      ctx.fill();
      
      // Car windows
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.roundRect(carPosition.x - 10, carPosition.y - 6, 20, 12, 2);
      ctx.fill();
      
      // Car wheels
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(carPosition.x - 8, carPosition.y + 8, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(carPosition.x + 8, carPosition.y + 8, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Direction indicator
      if (isAnimating && currentSegment < animationPath.length - 1) {
        const fromNode = nodes.find(n => n.id === animationPath[currentSegment]);
        const toNode = nodes.find(n => n.id === animationPath[currentSegment + 1]);
        if (fromNode && toNode) {
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(carPosition.x + 12 * Math.cos(angle), carPosition.y + 12 * Math.sin(angle));
          ctx.lineTo(carPosition.x + 8 * Math.cos(angle - 0.5), carPosition.y + 8 * Math.sin(angle - 0.5));
          ctx.lineTo(carPosition.x + 8 * Math.cos(angle + 0.5), carPosition.y + 8 * Math.sin(angle + 0.5));
          ctx.fill();
        }
      }
    }
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 20;
    });
    
    if (mode === 'add-node' && !clickedNode) {
      const newNode = {
        id: Math.max(...nodes.map(n => n.id), -1) + 1,
        x,
        y,
        name: `Stop ${String.fromCharCode(65 + nodes.length)}`
      };
      setNodes([...nodes, newNode]);
      toast.success(`Added node: ${newNode.name}`);
    } else if (mode === 'add-edge' && clickedNode) {
      if (selectedNode === null) {
        setSelectedNode(clickedNode.id);
        toast.info("Select destination node");
      } else if (selectedNode !== clickedNode.id) {
        const weight = Math.floor(Math.random() * 20) + 5;
        const newEdge = { from: selectedNode, to: clickedNode.id, weight };
        setEdges([...edges, newEdge]);
        setSelectedNode(null);
        toast.success(`Added edge with weight ${weight}`);
      }
    } else if (mode === 'select') {
      setSelectedNode(clickedNode ? clickedNode.id : null);
    }
  };

  const handleMouseDown = (e) => {
    if (mode !== 'select') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 20;
    });
    
    if (clickedNode) {
      setDraggedNode(clickedNode);
    }
  };

  const handleMouseMove = (e) => {
    if (!draggedNode || mode !== 'select') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setNodes(nodes.map(node => 
      node.id === draggedNode.id ? { ...node, x, y } : node
    ));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const clearGraph = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setIsAnimating(false);
    setIsPaused(false);
    toast.success("Graph cleared");
  };

  const generateRandomGraph = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    setIsPaused(false);
    
    const nodeCount = 6;
    const newNodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      name: i === 0 ? "Warehouse" : `Stop ${String.fromCharCode(65 + i - 1)}`
    }));
    
    const newEdges = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < 0.6) {
          newEdges.push({
            from: i,
            to: j,
            weight: Math.floor(Math.random() * 20) + 5
          });
        }
      }
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
    toast.success("Random graph generated");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={mode === 'select' ? 'default' : 'outline'}
            onClick={() => setMode('select')}
            size="sm"
          >
            Select/Move
          </Button>
          <Button
            variant={mode === 'add-node' ? 'default' : 'outline'}
            onClick={() => setMode('add-node')}
            size="sm"
          >
            <Plus size={16} />
            Add Node
          </Button>
          <Button
            variant={mode === 'add-edge' ? 'default' : 'outline'}
            onClick={() => setMode('add-edge')}
            size="sm"
          >
            Add Edge
          </Button>
        </div>
        
        <div className="flex gap-2">
          {isAnimating && (
            <>
              <Button onClick={pauseAnimation} variant="outline" size="sm">
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button onClick={resetAnimation} variant="outline" size="sm">
                <RotateCcw size={16} />
                Reset
              </Button>
            </>
          )}
          <Button onClick={generateRandomGraph} variant="outline" size="sm">
            <Play size={16} />
            Random Graph
          </Button>
          <Button onClick={clearGraph} variant="destructive" size="sm">
            <Trash2 size={16} />
            Clear
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-2">
          <canvas
            ref={canvasRef}
            className="w-full h-96 border border-gray-200 rounded cursor-pointer bg-white"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Algorithm:</strong> {results.algorithm}
              </div>
              <div>
                <strong>Total Cost:</strong> {results.totalCost}
              </div>
              <div>
                <strong>Path:</strong> {results.path?.join(' → ') || 'None'}
              </div>
              <div>
                <strong>Time Complexity:</strong> {results.timeComplexity}
              </div>
              <div>
                <strong>Space Complexity:</strong> {results.spaceComplexity}
              </div>
              <div>
                <strong>Execution Time:</strong> {results.executionTime}ms
              </div>
            </div>
            {isAnimating && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">🚚 Live Route Progress</span>
                  <span className="text-xs text-gray-600">
                    Segment {currentSegment + 1} of {animationPath.length - 1}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentSegment + animationProgress) / (animationPath.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Select mode: Choose between selecting/moving nodes, adding nodes, or adding edges</li>
          <li>Add nodes: Click on empty space when in "Add Node" mode</li>
          <li>Add edges: Click two nodes in sequence when in "Add Edge" mode</li>
          <li>Move nodes: Drag nodes around when in "Select/Move" mode</li>
          <li>Use the Algorithm Controls tab to run pathfinding algorithms</li>
          <li><strong>🚚 Live Animation:</strong> Watch the delivery car move along the optimal path in real-time!</li>
          <li>Use Pause/Resume and Reset controls during animation</li>
        </ul>
      </div>
    </div>
  );
};
