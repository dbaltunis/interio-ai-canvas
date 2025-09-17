import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { StandardWindow3D } from './windows/StandardWindow3D';
import { BayWindow3D } from './windows/BayWindow3D';
import { FrenchDoors3D } from './windows/FrenchDoors3D';
import { SlidingDoors3D } from './windows/SlidingDoors3D';

interface Window3DRendererProps {
  windowType: string;
  measurements: {
    window_width?: number;
    window_height?: number;
    rail_width?: number;
    drop?: number;
  };
  className?: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

export const Window3DRenderer: React.FC<Window3DRendererProps> = ({
  windowType,
  measurements,
  className = "w-full h-64",
  autoRotate = false,
  showControls = true
}) => {
  const getWindowComponent = () => {
    switch (windowType) {
      case 'bay':
        return <BayWindow3D measurements={measurements} />;
      case 'french_doors':
        return <FrenchDoors3D measurements={measurements} />;
      case 'sliding_doors':
        return <SlidingDoors3D measurements={measurements} />;
      case 'standard':
      default:
        return <StandardWindow3D measurements={measurements} />;
    }
  };

  return (
    <div className={className}>
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          {/* Window Component */}
          {getWindowComponent()}
          
          {/* Room Environment */}
          <mesh position={[0, 0, -2]} receiveShadow>
            <planeGeometry args={[10, 6]} />
            <meshLambertMaterial color="#f5f5f5" />
          </mesh>
          
          {/* Floor */}
          <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshLambertMaterial color="#e8e8e8" />
          </mesh>
          
          {/* Controls */}
          {showControls && (
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={1}
              maxPolarAngle={Math.PI / 2}
              minDistance={2}
              maxDistance={8}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};