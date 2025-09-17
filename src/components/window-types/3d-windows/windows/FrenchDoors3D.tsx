import React from 'react';
import { useRef } from 'react';
import { Group } from 'three';

interface FrenchDoors3DProps {
  measurements: {
    window_width?: number;
    window_height?: number;
    rail_width?: number;
    drop?: number;
  };
}

export const FrenchDoors3D: React.FC<FrenchDoors3DProps> = ({ measurements }) => {
  const groupRef = useRef<Group>(null);
  
  const width = (measurements.window_width || 120) / 100;
  const height = (measurements.window_height || 180) / 100; // Taller for doors
  const doorWidth = width / 2;
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Left Door */}
      <group position={[-doorWidth/2, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[doorWidth, height, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Glass Panels */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, height/2 - (i + 0.5) * (height/6), 0.03]}>
            <boxGeometry args={[doorWidth * 0.8, height/6 * 0.8, 0.01]} />
            <meshPhysicalMaterial 
              color="#87CEEB" 
              transparent={true} 
              opacity={0.3}
              transmission={0.8}
              roughness={0.1}
            />
          </mesh>
        ))}
        
        {/* Door Handle */}
        <mesh position={[doorWidth * 0.3, 0, 0.08]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.1]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      </group>
      
      {/* Right Door */}
      <group position={[doorWidth/2, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[doorWidth, height, 0.05]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Glass Panels */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, height/2 - (i + 0.5) * (height/6), 0.03]}>
            <boxGeometry args={[doorWidth * 0.8, height/6 * 0.8, 0.01]} />
            <meshPhysicalMaterial 
              color="#87CEEB" 
              transparent={true} 
              opacity={0.3}
              transmission={0.8}
              roughness={0.1}
            />
          </mesh>
        ))}
        
        {/* Door Handle */}
        <mesh position={[-doorWidth * 0.3, 0, 0.08]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.1]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      </group>
      
      {/* Door Frame */}
      <mesh position={[0, height/2 + 0.05, 0]} castShadow>
        <boxGeometry args={[width + 0.1, 0.1, 0.08]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Door Threshold */}
      <mesh position={[0, -height/2 - 0.03, 0]} castShadow>
        <boxGeometry args={[width + 0.1, 0.06, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
};