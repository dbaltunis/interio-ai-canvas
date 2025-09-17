import React from 'react';
import { useRef } from 'react';
import { Group } from 'three';

interface BayWindow3DProps {
  measurements: {
    window_width?: number;
    window_height?: number;
    rail_width?: number;
    drop?: number;
  };
}

export const BayWindow3D: React.FC<BayWindow3DProps> = ({ measurements }) => {
  const groupRef = useRef<Group>(null);
  
  const width = (measurements.window_width || 160) / 100; // Convert to meters
  const height = (measurements.window_height || 100) / 100;
  const depth = 0.3; // Bay window depth
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Center Window Panel */}
      <group position={[0, 0, depth]}>
        <mesh castShadow>
          <boxGeometry args={[width * 0.5, height + 0.1, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[width * 0.45, height * 0.9, 0.01]} />
          <meshPhysicalMaterial 
            color="#87CEEB" 
            transparent={true} 
            opacity={0.3}
            transmission={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>
      
      {/* Left Angled Panel */}
      <group position={[-width * 0.3, 0, depth * 0.7]} rotation={[0, Math.PI / 6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[width * 0.35, height + 0.1, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[width * 0.3, height * 0.9, 0.01]} />
          <meshPhysicalMaterial 
            color="#87CEEB" 
            transparent={true} 
            opacity={0.3}
            transmission={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>
      
      {/* Right Angled Panel */}
      <group position={[width * 0.3, 0, depth * 0.7]} rotation={[0, -Math.PI / 6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[width * 0.35, height + 0.1, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[width * 0.3, height * 0.9, 0.01]} />
          <meshPhysicalMaterial 
            color="#87CEEB" 
            transparent={true} 
            opacity={0.3}
            transmission={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>
      
      {/* Bay Window Sill */}
      <mesh position={[0, -height/2 - 0.03, depth * 0.5]} castShadow>
        <boxGeometry args={[width + 0.2, 0.06, depth + 0.1]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
    </group>
  );
};