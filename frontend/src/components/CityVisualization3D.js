import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// Building component
function Building({ position, height, color, onClick, data }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = hovered ? Math.sin(state.clock.elapsedTime) * 0.1 : 0;
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1, height, 1]}
        position={[0, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick && onClick(data)}
      >
        <meshStandardMaterial 
          color={hovered ? '#60a5fa' : color} 
          transparent 
          opacity={hovered ? 0.8 : 0.6}
        />
      </Box>
      {hovered && (
        <Text
          position={[0, height + 1, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {data?.name || 'Building'}
        </Text>
      )}
    </group>
  );
}

// Sensor component
function Sensor({ position, type, status, data, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getColor = () => {
    if (status === 'critical') return '#ef4444';
    if (status === 'warning') return '#f59e0b';
    return '#10b981';
  };

  const getIcon = () => {
    switch (type) {
      case 'air_quality':
        return <Sphere args={[0.2]} />;
      case 'traffic':
        return <Box args={[0.3, 0.1, 0.3]} />;
      case 'energy':
        return <Cylinder args={[0.1, 0.1, 0.4]} />;
      default:
        return <Sphere args={[0.15]} />;
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick && onClick(data)}
      >
        {getIcon()}
        <meshStandardMaterial 
          color={getColor()} 
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>
      {hovered && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {`${type}: ${data?.value || 'N/A'}`}
        </Text>
      )}
    </group>
  );
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1f2937" transparent opacity={0.8} />
    </mesh>
  );
}

// Main 3D City Visualization Component
function CityVisualization3D({ sensorData = [], onSensorClick, onBuildingClick }) {
  const [selectedObject, setSelectedObject] = useState(null);

  // Generate buildings
  const buildings = [
    { id: 1, position: [-3, 0, -3], height: 3, color: '#3b82f6', name: 'City Hall', type: 'government' },
    { id: 2, position: [2, 0, -2], height: 4, color: '#10b981', name: 'Hospital', type: 'healthcare' },
    { id: 3, position: [-1, 0, 2], height: 2.5, color: '#f59e0b', name: 'School', type: 'education' },
    { id: 4, position: [3, 0, 3], height: 5, color: '#8b5cf6', name: 'Office Complex', type: 'commercial' },
    { id: 5, position: [-4, 0, 1], height: 2, color: '#ef4444', name: 'Fire Station', type: 'emergency' },
    { id: 6, position: [0, 0, -4], height: 3.5, color: '#06b6d4', name: 'Library', type: 'public' },
  ];

  // Generate sensors based on real data or mock data
  const sensors = sensorData.length > 0 ? sensorData.map((sensor, index) => ({
    id: sensor.id || index,
    position: [
      (Math.random() - 0.5) * 8,
      0.5,
      (Math.random() - 0.5) * 8
    ],
    type: sensor.type || 'air_quality',
    status: sensor.status || (sensor.value > 80 ? 'critical' : sensor.value > 60 ? 'warning' : 'normal'),
    data: sensor
  })) : [
    { id: 'aq1', position: [-2, 0.5, -1], type: 'air_quality', status: 'normal', data: { value: 45, unit: 'AQI' } },
    { id: 'tr1', position: [1, 0.5, 1], type: 'traffic', status: 'warning', data: { value: 75, unit: '%' } },
    { id: 'en1', position: [-1, 0.5, -2], type: 'energy', status: 'critical', data: { value: 95, unit: 'kW' } },
    { id: 'aq2', position: [3, 0.5, 0], type: 'air_quality', status: 'normal', data: { value: 38, unit: 'AQI' } },
  ];

  const handleSensorClick = (sensorData) => {
    setSelectedObject({ type: 'sensor', data: sensorData });
    onSensorClick && onSensorClick(sensorData);
  };

  const handleBuildingClick = (buildingData) => {
    setSelectedObject({ type: 'building', data: buildingData });
    onBuildingClick && onBuildingClick(buildingData);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />

          {/* Ground */}
          <Ground />

          {/* Buildings */}
          {buildings.map((building) => (
            <Building
              key={building.id}
              position={building.position}
              height={building.height}
              color={building.color}
              data={building}
              onClick={handleBuildingClick}
            />
          ))}

          {/* Sensors */}
          {sensors.map((sensor) => (
            <Sensor
              key={sensor.id}
              position={sensor.position}
              type={sensor.type}
              status={sensor.status}
              data={sensor.data}
              onClick={handleSensorClick}
            />
          ))}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>

      {/* Info Panel */}
      {selectedObject && (
        <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-90 text-white p-4 rounded-lg max-w-xs">
          <h3 className="font-bold text-lg mb-2">
            {selectedObject.type === 'sensor' ? 'Sensor Data' : 'Building Info'}
          </h3>
          {selectedObject.type === 'sensor' ? (
            <div>
              <p><strong>Type:</strong> {selectedObject.data.type}</p>
              <p><strong>Value:</strong> {selectedObject.data.value} {selectedObject.data.unit}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  selectedObject.data.status === 'critical' ? 'bg-red-500' :
                  selectedObject.data.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {selectedObject.data.status}
                </span>
              </p>
            </div>
          ) : (
            <div>
              <p><strong>Name:</strong> {selectedObject.data.name}</p>
              <p><strong>Type:</strong> {selectedObject.data.type}</p>
              <p><strong>Height:</strong> {selectedObject.data.height}m</p>
            </div>
          )}
          <button
            onClick={() => setSelectedObject(null)}
            className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 text-white p-3 rounded-lg text-sm">
        <p><strong>Controls:</strong></p>
        <p>• Left click + drag: Rotate</p>
        <p>• Right click + drag: Pan</p>
        <p>• Scroll: Zoom</p>
        <p>• Click objects for details</p>
      </div>
    </div>
  );
}

export default CityVisualization3D;
