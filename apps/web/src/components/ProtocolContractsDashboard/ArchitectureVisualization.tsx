/**
 * Architecture Visualization Component
 * 
 * 2D/3D interactive visualization of contract architecture
 * Supports switching between D3.js 2D and Three.js 3D views
 * Shows directional arrows for one-way and two-way communications
 */

'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3';
import { Network, Box, Layers, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { Contract } from '@/types/contracts';

interface ArchitectureVisualizationProps {
  contracts: Contract[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Core': '#3b82f6',
  'Token': '#10b981',
  'Pool': '#8b5cf6',
  'Hook': '#f59e0b',
  'FHENIX': '#ec4899',
  'Oracle': '#06b6d4',
  'Governance': '#6366f1',
  'Bridge': '#f97316',
  'default': '#64748b',
};

// Connection types with descriptions
const CONNECTION_TYPES = {
  dependency: { color: '#3b82f6', label: 'Dependency', desc: 'Contract depends on another (one-way)', dashed: false },
  bidirectional: { color: '#8b5cf6', label: 'Bidirectional', desc: 'Two-way communication between contracts', dashed: false },
  dataFlow: { color: '#10b981', label: 'Data Flow', desc: 'Data flows between contracts', dashed: true },
};

interface NodeData {
  id: string; name: string; category: string; status: string;
  position: [number, number, number]; color: string;
}

interface ConnectionData {
  from: [number, number, number]; to: [number, number, number];
  fromId: string; toId: string;
  type: 'dependency' | 'bidirectional' | 'dataFlow';
}


// ============== 3D COMPONENTS ==============

function Node3D({ data, isSelected, onSelect }: { data: NodeData; isSelected: boolean; onSelect: (id: string | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = data.position[1] + Math.sin(state.clock.elapsedTime + data.position[0]) * 0.05;
      meshRef.current.rotation.y += 0.003;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
      glowRef.current.scale.setScalar(hovered || isSelected ? scale * 1.2 : scale);
    }
  });

  const size = data.category === 'Core' ? 0.5 : data.category === 'Token' ? 0.4 : 0.35;
  const statusColor = data.status === 'active' ? '#22c55e' : data.status === 'testing' ? '#eab308' : '#ef4444';

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={data.position}>
        <mesh ref={glowRef}>
          <sphereGeometry args={[size * 1.4, 32, 32]} />
          <meshBasicMaterial color={data.color} transparent opacity={hovered || isSelected ? 0.25 : 0.12} />
        </mesh>
        <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : data.id); }}
          onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshPhysicalMaterial color={data.color} metalness={0.3} roughness={0.2} clearcoat={1}
            emissive={data.color} emissiveIntensity={hovered || isSelected ? 0.4 : 0.15} />
        </mesh>
        <mesh><sphereGeometry args={[size * 0.4, 32, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.25} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[size * 1.1, 0.025, 16, 100]} /><meshBasicMaterial color={statusColor} /></mesh>
        <Html position={[0, -size - 0.6, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className="text-center whitespace-nowrap">
            <div className="text-[10px] font-bold text-white bg-slate-900/90 px-2 py-1 rounded backdrop-blur-sm border border-slate-700">{data.name}</div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function Connection3D({ from, to, type }: ConnectionData) {
  const config = CONNECTION_TYPES[type];
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y += 0.3;
    return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(30);
  }, [from, to]);
  
  return (
    <group>
      <Line points={points} color={config.color} lineWidth={type === 'bidirectional' ? 2 : 1.5} 
        transparent opacity={0.6} dashed={config.dashed} dashScale={8} />
      {/* Arrow at end */}
      <mesh position={points[points.length - 3] || points[0]} rotation={[0, Math.atan2(to[0] - from[0], to[2] - from[2]), 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Second arrow for bidirectional */}
      {type === 'bidirectional' && (
        <mesh position={points[3] || points[0]} rotation={[0, Math.atan2(from[0] - to[0], from[2] - to[2]), 0]}>
          <coneGeometry args={[0.08, 0.2, 8]} />
          <meshBasicMaterial color={config.color} />
        </mesh>
      )}
    </group>
  );
}

function CentralHub() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (meshRef.current) { meshRef.current.rotation.y += 0.008; }
    if (ringsRef.current) { ringsRef.current.rotation.z += 0.004; }
  });
  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}><icosahedronGeometry args={[0.25, 2]} /><meshPhysicalMaterial color="#60a5fa" metalness={0.8} roughness={0.1} emissive="#3b82f6" emissiveIntensity={0.4} /></mesh>
      <group ref={ringsRef}>
        {[0.4, 0.55, 0.7].map((r, i) => (<mesh key={i} rotation={[Math.PI / 2 + i * 0.3, i * 0.4, 0]}><torusGeometry args={[r, 0.015, 16, 100]} /><meshBasicMaterial color="#60a5fa" transparent opacity={0.4 - i * 0.1} /></mesh>))}
      </group>
      <Html position={[0, -1, 0]} center><div className="text-[10px] font-bold text-blue-400 bg-slate-900/90 px-2 py-0.5 rounded-full">LUKAS</div></Html>
    </group>
  );
}

function Scene3D({ contracts, selectedNode, onSelectNode }: { contracts: Contract[]; selectedNode: string | null; onSelectNode: (id: string | null) => void }) {
  const { nodes, connections } = useMemo(() => {
    const nodeData: NodeData[] = [];
    const connectionData: ConnectionData[] = [];
    const radius = 5;
    const angleStep = (Math.PI * 2) / Math.max(contracts.length, 1);

    contracts.forEach((contract, index) => {
      const angle = angleStep * index;
      const heightOffset = (index % 3 - 1) * 0.4;
      const position: [number, number, number] = [Math.cos(angle) * radius, heightOffset, Math.sin(angle) * radius];
      nodeData.push({ id: contract.id, name: contract.name, category: contract.category, status: contract.state.status, position, color: CATEGORY_COLORS[contract.category] || CATEGORY_COLORS.default });
    });

    // Create connections with proper types
    nodeData.forEach((node, i) => {
      // Core contracts have bidirectional with hub
      connectionData.push({ from: [0, 0, 0], to: node.position, fromId: 'hub', toId: node.id, type: node.category === 'Core' ? 'bidirectional' : 'dependency' });
      
      // Same category = bidirectional, different = data flow
      const nextNode = nodeData[(i + 1) % nodeData.length];
      if (nextNode && nodeData.length > 2) {
        const connType = node.category === nextNode.category ? 'bidirectional' : 'dataFlow';
        connectionData.push({ from: node.position, to: nextNode.position, fromId: node.id, toId: nextNode.id, type: connType });
      }
    });

    return { nodes: nodeData, connections: connectionData };
  }, [contracts]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#3b82f6" />
      <Stars radius={60} depth={50} count={1500} factor={4} fade speed={0.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}><planeGeometry args={[40, 40, 40, 40]} /><meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.2} /></mesh>
      <CentralHub />
      {connections.map((conn, i) => <Connection3D key={i} {...conn} />)}
      {nodes.map((node) => <Node3D key={node.id} data={node} isSelected={selectedNode === node.id} onSelect={onSelectNode} />)}
      <OrbitControls enablePan enableZoom enableRotate autoRotate={!selectedNode} autoRotateSpeed={0.3} minDistance={4} maxDistance={20} />
    </>
  );
}


// ============== 2D D3 COMPONENT ==============

interface D3Node extends d3.SimulationNodeDatum { id: string; name: string; category: string; status: string; radius: number; }
interface D3Link { source: string; target: string; type: 'dependency' | 'bidirectional' | 'dataFlow'; }

function Visualization2D({ contracts, selectedNode, onSelectNode, svgRef }: { 
  contracts: Contract[]; selectedNode: string | null; 
  onSelectNode: (id: string | null) => void; 
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({ width: Math.max(containerRef.current.getBoundingClientRect().width - 32, 400), height: 600 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || contracts.length === 0) return;
    d3.select(svgRef.current).selectAll('*').remove();
    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3]).on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);
    const g = svg.append('g');

    const nodes: D3Node[] = contracts.map((c) => ({
      id: c.id, name: c.name, category: c.category, status: c.state.status,
      radius: c.category === 'Core' ? 40 : c.category === 'Token' ? 35 : 30,
    }));

    const links: D3Link[] = [];
    const hubNode = nodes.find(n => n.category === 'Core') || nodes[0];
    
    // Create meaningful connections
    nodes.forEach((node) => {
      if (node.id !== hubNode?.id) {
        // Core contracts have bidirectional, others have dependency
        links.push({ source: hubNode?.id || '', target: node.id, type: node.category === 'Core' ? 'bidirectional' : 'dependency' });
      }
    });
    
    // Same category contracts communicate bidirectionally
    nodes.forEach((node, i) => {
      nodes.forEach((other, j) => {
        if (i < j && node.category === other.category) {
          links.push({ source: node.id, target: other.id, type: 'bidirectional' });
        } else if (i < j && (node.category === 'Token' || other.category === 'Token')) {
          links.push({ source: node.id, target: other.id, type: 'dataFlow' });
        }
      });
    });

    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, any>(links).id((d: any) => d.id).distance(220).strength(0.3))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 60));

    // Defs for gradients and arrows
    const defs = svg.append('defs');
    
    // Arrow markers for each type
    Object.entries(CONNECTION_TYPES).forEach(([type, config]) => {
      defs.append('marker').attr('id', `arrow-${type}`).attr('viewBox', '0 -5 10 10')
        .attr('refX', 25).attr('refY', 0).attr('markerWidth', 8).attr('markerHeight', 8).attr('orient', 'auto')
        .append('path').attr('fill', config.color).attr('d', 'M0,-5L10,0L0,5');
      
      // Reverse arrow for bidirectional
      if (type === 'bidirectional') {
        defs.append('marker').attr('id', `arrow-${type}-start`).attr('viewBox', '0 -5 10 10')
          .attr('refX', -15).attr('refY', 0).attr('markerWidth', 8).attr('markerHeight', 8).attr('orient', 'auto-start-reverse')
          .append('path').attr('fill', config.color).attr('d', 'M0,-5L10,0L0,5');
      }
    });

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Node gradients
    nodes.forEach((d) => {
      const color = CATEGORY_COLORS[d.category] || CATEGORY_COLORS.default;
      const grad = defs.append('radialGradient').attr('id', `node-${d.id}`);
      grad.append('stop').attr('offset', '0%').attr('stop-color', d3.color(color)?.brighter(0.5)?.toString() || color);
      grad.append('stop').attr('offset', '100%').attr('stop-color', color);
    });

    // Links with arrows
    const link = g.append('g').selectAll('path').data(links).join('path')
      .attr('fill', 'none')
      .attr('stroke', (d) => CONNECTION_TYPES[d.type].color)
      .attr('stroke-opacity', 0.7)
      .attr('stroke-width', (d) => d.type === 'bidirectional' ? 3 : 2)
      .attr('stroke-dasharray', (d) => CONNECTION_TYPES[d.type].dashed ? '8,4' : 'none')
      .attr('marker-end', (d) => `url(#arrow-${d.type})`)
      .attr('marker-start', (d) => d.type === 'bidirectional' ? `url(#arrow-${d.type}-start)` : null);

    // Nodes
    const node = g.append('g').selectAll<SVGGElement, D3Node>('g').data(nodes).join('g').attr('cursor', 'pointer');
    
    node.call(d3.drag<SVGGElement, D3Node>()
      .on('start', (e: any) => { if (!e.active) simulation.alphaTarget(0.3).restart(); e.subject.fx = e.subject.x; e.subject.fy = e.subject.y; })
      .on('drag', (e: any) => { e.subject.fx = e.x; e.subject.fy = e.y; })
      .on('end', (e: any) => { if (!e.active) simulation.alphaTarget(0); e.subject.fx = null; e.subject.fy = null; }) as any);

    // Glow
    node.append('circle').attr('r', (d) => d.radius + 10)
      .attr('fill', (d) => CATEGORY_COLORS[d.category] || CATEGORY_COLORS.default).attr('opacity', 0.15).attr('filter', 'url(#glow)');
    
    // Main circle
    node.append('circle').attr('r', (d) => d.radius).attr('fill', (d) => `url(#node-${d.id})`).attr('stroke', '#1e293b').attr('stroke-width', 3);
    
    // Status indicator
    node.append('circle').attr('r', 10).attr('cx', (d) => d.radius - 8).attr('cy', (d) => -d.radius + 8)
      .attr('fill', (d) => d.status === 'active' ? '#22c55e' : d.status === 'testing' ? '#eab308' : '#ef4444').attr('stroke', '#1e293b').attr('stroke-width', 2);
    
    // Category text
    node.append('text').attr('dy', 5).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '11px').attr('font-weight', '700')
      .text((d) => d.category.substring(0, 3).toUpperCase());
    
    // Name label
    node.append('text').attr('dy', (d) => d.radius + 22).attr('text-anchor', 'middle').attr('fill', '#e2e8f0').attr('font-size', '12px').attr('font-weight', '600')
      .text((d) => d.name.length > 16 ? d.name.substring(0, 14) + '...' : d.name);

    node.on('click', (e, d) => { e.stopPropagation(); onSelectNode(selectedNode === d.id ? null : d.id); });
    svg.on('click', () => onSelectNode(null));

    simulation.on('tick', () => {
      link.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x, dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.6;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [contracts, dimensions, selectedNode, onSelectNode, svgRef]);

  return (
    <div ref={containerRef} className="bg-slate-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
      {contracts.length === 0 ? (
        <div className="flex items-center justify-center h-full"><Network className="w-16 h-16 text-slate-600" /></div>
      ) : (
        <svg ref={svgRef as React.RefObject<SVGSVGElement>} className="w-full h-full" />
      )}
    </div>
  );
}


// ============== MAIN COMPONENT ==============

export default function ArchitectureVisualization({ contracts }: ArchitectureVisualizationProps) {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [key3D, setKey3D] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedContract = contracts.find(c => c.id === selectedNode);
  const contractsByCategory = contracts.reduce((acc, contract) => {
    if (!acc[contract.category]) acc[contract.category] = [];
    acc[contract.category].push(contract);
    return acc;
  }, {} as Record<string, Contract[]>);

  const handleZoom2D = (direction: 'in' | 'out' | 'reset') => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3]);
    if (direction === 'reset') {
      svg.transition().duration(500).call(zoom.transform as any, d3.zoomIdentity);
    } else {
      svg.transition().duration(300).call(zoom.scaleBy as any, direction === 'in' ? 1.4 : 0.7);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded" />
            Architecture
          </h2>
          <p className="text-muted-foreground text-sm">
            {viewMode === '3d' ? 'Interactive 3D visualization - drag to rotate, scroll to zoom' : 'Interactive 2D graph - drag nodes, scroll to zoom'}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <button onClick={() => setViewMode('3d')} title="3D View"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === '3d' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Box className="w-4 h-4" /><span>3D</span>
          </button>
          <button onClick={() => setViewMode('2d')} title="2D View"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === '2d' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Layers className="w-4 h-4" /><span>2D</span>
          </button>
        </div>
      </div>

      <div className="relative border border-slate-700 rounded-lg overflow-hidden">
        {/* Camera Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {viewMode === '2d' ? (
            <>
              <button onClick={() => handleZoom2D('in')} className="p-2 bg-card hover:bg-muted rounded-lg border border-border transition-colors" title="Zoom in">
                <ZoomIn className="w-4 h-4 text-foreground" />
              </button>
              <button onClick={() => handleZoom2D('out')} className="p-2 bg-card hover:bg-muted rounded-lg border border-border transition-colors" title="Zoom out">
                <ZoomOut className="w-4 h-4 text-foreground" />
              </button>
              <button onClick={() => handleZoom2D('reset')} className="p-2 bg-card hover:bg-muted rounded-lg border border-border transition-colors" title="Reset view">
                <Maximize2 className="w-4 h-4 text-foreground" />
              </button>
            </>
          ) : (
            <button onClick={() => setKey3D(k => k + 1)} className="p-2 bg-card hover:bg-muted rounded-lg border border-border transition-colors" title="Reset 3D view">
              <RefreshCw className="w-4 h-4 text-foreground" />
            </button>
          )}
        </div>

        {selectedContract && (
          <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 max-w-xs">
            <h3 className="font-semibold text-foreground mb-2">{selectedContract.name}</h3>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Category: <span className="text-foreground">{selectedContract.category}</span></p>
              <p className="text-muted-foreground">Status: <span className={selectedContract.state.status === 'active' ? 'text-green-400' : selectedContract.state.status === 'testing' ? 'text-yellow-400' : 'text-red-400'}>{selectedContract.state.status}</span></p>
              <p className="text-muted-foreground">Version: <span className="text-foreground">{selectedContract.state.version}</span></p>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-10 text-xs text-muted-foreground">
          {viewMode === '3d' ? '🖱️ Drag to rotate • Scroll to zoom • Click node for details' : '🖱️ Drag nodes • Scroll to zoom • Click for details'}
        </div>

        {viewMode === '3d' ? (
          <Suspense fallback={<div className="flex items-center justify-center h-[600px] bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" /></div>}>
            <div style={{ height: '600px' }}>
              <Canvas key={key3D} camera={{ position: [0, 4, 12], fov: 55 }} gl={{ antialias: true }} style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}>
                <Scene3D contracts={contracts} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
              </Canvas>
            </div>
          </Suspense>
        ) : (
          <Visualization2D contracts={contracts} selectedNode={selectedNode} onSelectNode={setSelectedNode} svgRef={svgRef} />
        )}
      </div>

      {/* Category Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(contractsByCategory).map(([category, categoryContracts]) => (
          <div key={category} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default, boxShadow: `0 0 10px ${CATEGORY_COLORS[category] || CATEGORY_COLORS.default}` }} />
              <h3 className="font-semibold text-foreground">{category}</h3>
            </div>
            <div className="space-y-1">
              {categoryContracts.map((contract) => (
                <div key={contract.id} onClick={() => setSelectedNode(selectedNode === contract.id ? null : contract.id)}
                  className={`text-xs flex items-center gap-2 cursor-pointer transition-colors ${selectedNode === contract.id ? 'text-blue-400' : 'text-muted-foreground hover:text-foreground'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${contract.state.status === 'active' ? 'bg-green-500' : contract.state.status === 'testing' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  {contract.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Connection Types Legend */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Connection Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(CONNECTION_TYPES).map(([type, config]) => (
            <div key={type} className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-1 mt-1">
                {config.dashed ? (
                  <div className="flex items-center">
                    <div className="w-2 h-0.5 rounded" style={{ backgroundColor: config.color }} />
                    <div className="w-1 h-0.5" />
                    <div className="w-2 h-0.5 rounded" style={{ backgroundColor: config.color }} />
                    <div className="w-1 h-0.5" />
                    <div className="w-2 h-0.5 rounded" style={{ backgroundColor: config.color }} />
                  </div>
                ) : (
                  <div className="w-8 h-0.5 rounded" style={{ backgroundColor: config.color }} />
                )}
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M0,6 L8,6 M5,3 L8,6 L5,9" stroke={config.color} strokeWidth="2" fill="none" />
                </svg>
                {type === 'bidirectional' && (
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: 'rotate(180deg)', marginLeft: '-20px' }}>
                    <path d="M0,6 L8,6 M5,3 L8,6 L5,9" stroke={config.color} strokeWidth="2" fill="none" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{config.label}</p>
                <p className="text-xs text-muted-foreground">{config.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Status Legend */}
        <h3 className="text-sm font-semibold text-foreground mt-4 mb-3">Contract Status</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /><span className="text-xs text-muted-foreground">Active - Deployed and operational</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full" /><span className="text-xs text-muted-foreground">Testing - Under development</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /><span className="text-xs text-muted-foreground">Deprecated - No longer active</span></div>
        </div>
      </div>
    </div>
  );
}
