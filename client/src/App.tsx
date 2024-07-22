import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

const initialNodes: Node[] = [
  {
    id: "lb",
    data: { label: "LB" },
    position: { x: 0, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "ip1",
    data: { label: "IP1: 0" },
    position: { x: 200, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "ip2",
    data: { label: "IP2: 0" },
    position: { x: 200, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "ip3",
    data: { label: "IP3: 0" },
    position: { x: 200, y: 200 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "service",
    data: { label: "Service" },
    position: { x: 400, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-lb-ip1",
    source: "lb",
    target: "ip1",
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-lb-ip2",
    source: "lb",
    target: "ip2",
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-lb-ip3",
    source: "lb",
    target: "ip3",
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-ip1-service",
    source: "ip1",
    target: "service",
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-ip2-service",
    source: "ip2",
    target: "service",
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e-ip3-service",
    source: "ip3",
    target: "service",
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

type Algorithm = "round_robin" | "random" | "least_connections";

interface Stats {
  [key: string]: number;
}

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [algorithm, setAlgorithm] = useState<Algorithm>("round_robin");
  const [result, setResult] = useState<string>("");
  const [requestsPerSecond, setRequestsPerSecond] = useState<number>(1);
  const [isLoadTesting, setIsLoadTesting] = useState<boolean>(false);
  const [results, setResults] = useState<string[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const setLoadBalancingAlgorithm = async (newAlgorithm: Algorithm) => {
    await axios.get(`/api/set_algorithm/${newAlgorithm}`);
    setAlgorithm(newAlgorithm);
  };

  const sendRequest = async () => {
    try {
      const response = await axios.get("/api/get_ip");
      const {
        ip,
        message,
        stats,
      }: { ip: string; message: string; stats: Stats } = response.data;

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id.startsWith("ip")) {
            const ipNum = node.id.slice(2);
            return {
              ...node,
              data: {
                ...node.data,
                label: `IP${ipNum}: ${stats[`ip${ipNum}`]}`,
              },
              style:
                node.id === ip.toLowerCase() ? { background: "#4CAF50" } : {},
            };
          }
          return node;
        })
      );

      setResults((prevResults) => [
        ...prevResults,
        `Request handled by ${ip}. Response: "${message}"`,
      ]);

      // Remove the setTimeout here as it might interfere with high-frequency requests
    } catch (error) {
      console.error("Error sending request:", error);
      setResults((prevResults) => [...prevResults, `Error: ${error}`]);
    }
  };
  const runLoadTest = async (duration: number = 10) => {
    setIsLoadTesting(true);
    setResults([]);
    const interval = 1000 / requestsPerSecond;
    let counter = 0;

    const sendRequests = async () => {
      if (counter < duration * requestsPerSecond) {
        await sendRequest();
        counter++;
        setTimeout(sendRequests, interval);
      } else {
        setIsLoadTesting(false);
        console.log("Load test completed");
      }
    };

    sendRequests();
  };

  const addNewIP = async () => {
    const newIPNumber =
      nodes.filter((node) => node.id.startsWith("ip")).length + 1;
    const newIPId = `ip${newIPNumber}`;
    const newNode: Node = {
      id: newIPId,
      data: { label: `IP${newIPNumber}: 0` },
      position: { x: 200, y: (newIPNumber - 1) * 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    const newEdgeFromLB: Edge = {
      id: `e-lb-${newIPId}`,
      source: "lb",
      target: newIPId,
      type: "smoothstep",
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    };

    const newEdgeToService: Edge = {
      id: `e-${newIPId}-service`,
      source: newIPId,
      target: "service",
      type: "smoothstep",
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
    setEdges((prevEdges) => [...prevEdges, newEdgeFromLB, newEdgeToService]);

    try {
      await axios.post("/api/add_ip", { ip: newIPId });
    } catch (error) {
      console.error("Failed to add new IP to backend:", error);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f0f0f0",
          borderBottom: "1px solid #ddd",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            margin: "0 0 15px 0",
            color: "#333",
            fontSize: "24px",
          }}
        >
          Load Balancer Visualization
        </h2>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => setLoadBalancingAlgorithm("round_robin")}
            style={buttonStyle(algorithm === "round_robin")}
          >
            Round Robin
          </button>
          <button
            onClick={() => setLoadBalancingAlgorithm("random")}
            style={buttonStyle(algorithm === "random")}
          >
            Random
          </button>
          <button
            onClick={() => setLoadBalancingAlgorithm("least_connections")}
            style={buttonStyle(algorithm === "least_connections")}
          >
            Least Connections
          </button>
          <button
            onClick={sendRequest}
            style={{
              ...buttonStyle(false),
              backgroundColor: "#4CAF50",
              color: "white",
            }}
          >
            Send Request
          </button>
          <button
            onClick={addNewIP}
            style={{
              ...buttonStyle(false),
              backgroundColor: "#007bff",
              color: "white",
            }}
          >
            Add IP
          </button>
          <button
            onClick={() => setResults([])}
            style={{
              ...buttonStyle(false),
              backgroundColor: "#dc3545",
              color: "white",
            }}
          >
            Clear Results
          </button>
        </div>
        <div style={{ fontSize: "16px", color: "#555" }}>
          Active Algorithm:{" "}
          <span style={{ fontWeight: "bold", color: "#333" }}>
            {algorithm.replace("_", " ")}
          </span>
        </div>
        <div style={{ marginTop: "10px", fontSize: "16px", color: "#555" }}>
          {result}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="number"
          value={requestsPerSecond}
          onChange={(e) =>
            setRequestsPerSecond(Math.max(1, Number(e.target.value)))
          }
          min="1"
          max="100"
          style={{ marginRight: "10px", width: "50px" }}
        />
        <span style={{ marginRight: "10px" }}>requests per second</span>
        <button
          onClick={() => runLoadTest(10)}
          style={{
            ...buttonStyle(false),
            backgroundColor: "#ff7f50",
            color: "white",
          }}
          disabled={isLoadTesting}
        >
          {isLoadTesting ? "Testing..." : "Run 10s Load Test"}
        </button>
      </div>
      <div
        style={{
          marginTop: "10px",
          fontSize: "14px",
          color: "#555",
          maxHeight: "100px",
          overflowY: "auto",
        }}
      >
        {results.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
      </div>
    </div>
  );
}

// Button style function
const buttonStyle = (isActive: boolean) => ({
  padding: "10px 15px",
  margin: "0 10px 0 0",
  fontSize: "14px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  backgroundColor: isActive ? "#007bff" : "#ffffff",
  color: isActive ? "#ffffff" : "#333333",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  transition: "all 0.3s ease",
});

export default App;
