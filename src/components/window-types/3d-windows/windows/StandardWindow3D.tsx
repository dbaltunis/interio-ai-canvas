import React from 'react';
import { useRef } from 'react';
import { Group } from 'three';

interface StandardWindow3DProps {
  measurements: {
    window_width?: number;
    window_height?: number;
    rail_width?: number;
    drop?: number;
  };
}

export const StandardWindow3D: React.FC<StandardWindow3DProps> = ({ measurements }) => {
  const groupRef = useRef<Group>(null);
  
  const width = (measurements.window_width || 120) / 100; // Convert to meters
  const height = (measurements.window_height || 100) / 100;
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Window Frame */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.05]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Glass Panes */}
      <mesh position={[0, 0, 0.03]} castShadow>
        <boxGeometry args={[width * 0.9, height * 0.9, 0.01]} />
        <meshPhysicalMaterial 
          color="#87CEEB" 
          transparent={true} 
          opacity={0.3}
          transmission={0.8}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      
      {/* Window Dividers */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.02, height * 0.9, 0.01]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[width * 0.9, 0.02, 0.01]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Window Sill */}
      <mesh position={[0, -height/2 - 0.03, 0.02]} castShadow>
        <boxGeometry args={[width + 0.2, 0.06, 0.1]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
    </group>
  );
};