import React from 'react';
import { useRef } from 'react';
import { Group } from 'three';

interface SlidingDoors3DProps {
  measurements: {
    window_width?: number;
    window_height?: number;
    rail_width?: number;
    drop?: number;
  };
}

export const SlidingDoors3D: React.FC<SlidingDoors3DProps> = ({ measurements }) => {
  const groupRef = useRef<Group>(null);
  
  const width = (measurements.window_width || 200) / 100; // Wider for sliding doors
  const height = (measurements.window_height || 180) / 100;
  const panelWidth = width / 3; // Three panels
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Fixed Left Panel */}
      <group position={[-width/3, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[panelWidth, height, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[panelWidth * 0.9, height * 0.9, 0.01]} />
          <meshPhysicalMaterial 
            color="#87CEEB" 
            transparent={true} 
            opacity={0.3}
            transmission={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>
      
      {/* Sliding Center Panel */}
      <group position={[0, 0, 0.02]}>
        <mesh castShadow>
          <boxGeometry args={[panelWidth, height, 0.05]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[panelWidth * 0.9, height * 0.9, 0.01]} />
          <meshPhysicalMaterial 
            color="#87CEEB" 
            transparent={true} 
            opacity={0.3}
            transmission={0.8}
            roughness={0.1}
          />
        </mesh>
        
        {/* Handle */}
        <mesh position={[panelWidth * 0.3, 0, 0.08]} castShadow>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>
      
      {/* Fixed Right Panel */}
      <group position={[width/3, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[panelWidth, height, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[panelWidth * 0.9, height * 0.9, 0.01]} />
          <meshPhysicalMaterial 
            color="#87CEEB" 
            transparent={true} 
            opacity={0.3}
            transmission={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>
      
      {/* Track System */}
      <mesh position={[0, height/2 + 0.05, 0]} castShadow>
        <boxGeometry args={[width + 0.1, 0.05, 0.08]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
      
      <mesh position={[0, -height/2 - 0.03, 0]} castShadow>
        <boxGeometry args={[width + 0.1, 0.05, 0.08]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
      
      {/* Door Threshold */}
      <mesh position={[0, -height/2 - 0.06, 0]} castShadow>
        <boxGeometry args={[width + 0.1, 0.06, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
};