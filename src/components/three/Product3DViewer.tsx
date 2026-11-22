import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, Pause, Play } from 'lucide-react';
import { Model3DType } from '../../types';
import { buildProductModel } from './proceduralModels';

interface Product3DViewerProps {
  modelType: Model3DType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  theme?: 'light' | 'dark' | 'transparent';
  badgeLabel?: string;
  dragHint?: string;
  resetLabel?: string;
  autoSpinLabel?: string;
  className?: string;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({
  modelType,
  primaryColor,
  secondaryColor,
  accentColor,
  theme = 'light',
  badgeLabel = 'Interactive 3D',
  dragHint = 'Drag to rotate · Scroll to zoom',
  resetLabel = 'Reset',
  autoSpinLabel = 'Auto-Spin',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const autoSpinRef = useRef(true);
  const [autoSpin, setAutoSpin] = useState(true);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoSpin;
    }
  }, [autoSpin]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    if (theme === 'light') {
      scene.background = new THREE.Color('#F5F5F7');
    } else if (theme === 'dark') {
      scene.background = new THREE.Color('#0B1018');
    } else {
      scene.background = null;
    }

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(2.2, 1.35, 3.25);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: theme === 'transparent',
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = theme === 'light' ? 1.15 : 1.25;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio 3-point lighting
    const hemiLight = new THREE.HemisphereLight(
      theme === 'light' ? '#ffffff' : '#cfe8ff',
      theme === 'light' ? '#cbd5e1' : '#1e293b',
      theme === 'light' ? 1.4 : 0.9
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', theme === 'light' ? 2.0 : 2.4);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      theme === 'light' ? '#93c5fd' : '#38bdf8',
      1.1
    );
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight('#fff7ed', 0.7, 15);
    fillLight.position.set(-3, -1, 3);
    scene.add(fillLight);

    // Build procedural 3D product assembly
    const productGroup = buildProductModel(modelType, {
      primaryColor,
      secondaryColor,
      accentColor,
    });
    productGroup.position.y = 0.08;
    scene.add(productGroup);

    // Soft studio shadow catcher disc
    const shadowPlane = new THREE.Mesh(
      new THREE.CircleGeometry(1.75, 48),
      new THREE.ShadowMaterial({
        opacity: theme === 'light' ? 0.16 : 0.35,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.95;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Subtle circular turntable ring
    const turntableRing = new THREE.Mesh(
      new THREE.RingGeometry(1.18, 1.21, 64),
      new THREE.MeshBasicMaterial({
        color: theme === 'light' ? '#CBD5E1' : '#38BDF8',
        transparent: true,
        opacity: theme === 'light' ? 0.6 : 0.25,
        side: THREE.DoubleSide,
      })
    );
    turntableRing.rotation.x = -Math.PI / 2;
    turntableRing.position.y = -0.94;
    scene.add(turntableRing);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.1;
    controls.maxDistance = 6.2;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.maxPolarAngle = Math.PI * 0.72;
    controls.autoRotate = autoSpinRef.current;
    controls.autoRotateSpeed = 1.65;
    controlsRef.current = controls;

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      productGroup.position.y = 0.05 + Math.sin(t * 1.8) * 0.045;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, [modelType, primaryColor, secondaryColor, accentColor, theme]);

  const handleReset = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(2.2, 1.35, 3.25);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const isLight = theme === 'light';

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top-left subtle 3D badge */}
      <div
        className={`pointer-events-none absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-wider backdrop-blur-md ${
          isLight
            ? 'bg-white/80 text-slate-700 border border-slate-200/80 shadow-xs'
            : 'bg-black/45 text-white/85 border border-white/15'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-pulse" />
        {badgeLabel}
      </div>

      {/* Bottom control bar */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none">
        <span
          className={`rounded-full px-3 py-1 text-[11px] backdrop-blur-md ${
            isLight
              ? 'bg-white/75 text-slate-500 border border-slate-200/70'
              : 'bg-black/45 text-white/70 border border-white/10'
          }`}
        >
          {dragHint}
        </span>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setAutoSpin((s) => !s)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md transition cursor-pointer ${
              isLight
                ? 'bg-white/85 text-slate-700 hover:bg-white border border-slate-200'
                : 'bg-black/55 text-white/85 hover:bg-black/75 border border-white/15'
            }`}
            title={autoSpinLabel}
          >
            {autoSpin ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden sm:inline">{autoSpinLabel}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md transition cursor-pointer ${
              isLight
                ? 'bg-white/85 text-slate-700 hover:bg-white border border-slate-200'
                : 'bg-black/55 text-white/85 hover:bg-black/75 border border-white/15'
            }`}
            title={resetLabel}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{resetLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
