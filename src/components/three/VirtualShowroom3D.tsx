import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Currency, Lang, Product, ProductCategory } from '../../types';
import { buildProductModel } from './proceduralModels';
import { formatPrice } from '../../utils/currency';
import { getCopy } from '../../i18n/translations';
import { Sparkles, Eye } from 'lucide-react';

type BayFilter = 'all' | ProductCategory;

interface VirtualShowroom3DProps {
  products: Product[];
  lang: Lang;
  currency: Currency;
  onSelectProduct: (product: Product) => void;
}

const BAY_CAMERA_PRESETS: Record<
  BayFilter,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  all: { pos: [0, 3.3, 10.6], target: [0, 0.85, -0.4] },
  kits: { pos: [-3.9, 2.2, 5.2], target: [-3.2, 0.85, -0.8] },
  'food-water': { pos: [-1.1, 2.1, 5.6], target: [-0.8, 0.85, -1.0] },
  survival: { pos: [1.8, 2.1, 5.5], target: [1.8, 0.85, -0.9] },
  'power-med': { pos: [4.2, 2.2, 5.2], target: [3.4, 0.85, -0.6] },
};

export const VirtualShowroom3D: React.FC<VirtualShowroom3DProps> = ({
  products,
  lang,
  currency,
  onSelectProduct,
}) => {
  const copy = getCopy(lang);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeBay, setActiveBay] = useState<BayFilter>('all');
  const [hoveredInfo, setHoveredInfo] = useState<{
    product: Product;
    x: number;
    y: number;
  } | null>(null);

  const desiredCamPosRef = useRef(new THREE.Vector3(...BAY_CAMERA_PRESETS.all.pos));
  const desiredTargetRef = useRef(new THREE.Vector3(...BAY_CAMERA_PRESETS.all.target));
  const isTransitioningRef = useRef(false);
  const activeBayRef = useRef<BayFilter>('all');
  const onSelectRef = useRef(onSelectProduct);
  onSelectRef.current = onSelectProduct;

  const handleSwitchBay = (bay: BayFilter) => {
    setActiveBay(bay);
    activeBayRef.current = bay;
    const preset = BAY_CAMERA_PRESETS[bay];
    desiredCamPosRef.current.set(...preset.pos);
    desiredTargetRef.current.set(...preset.target);
    isTransitioningRef.current = true;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 620;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070B12');
    scene.fog = new THREE.FogExp2('#070B12', 0.042);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(...BAY_CAMERA_PRESETS.all.pos);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Tactical architectural lighting (KALLE cyber-slate aesthetic)
    const ambient = new THREE.HemisphereLight('#b8dcff', '#0a1220', 0.9);
    scene.add(ambient);

    const topSpot = new THREE.DirectionalLight('#ffffff', 2.2);
    topSpot.position.set(2, 10, 6);
    topSpot.castShadow = true;
    topSpot.shadow.mapSize.width = 1024;
    topSpot.shadow.mapSize.height = 1024;
    scene.add(topSpot);

    const cyanRim = new THREE.PointLight('#38BDF8', 2.4, 22);
    cyanRim.position.set(-7, 4, -4);
    scene.add(cyanRim);

    const limeRim = new THREE.PointLight('#39FF14', 1.4, 18);
    limeRim.position.set(7, 3.5, -2);
    scene.add(limeRim);

    // Matte dark floor + glowing cyan tactical grid (Video 1 look)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 26),
      new THREE.MeshStandardMaterial({
        color: '#0A101A',
        roughness: 0.72,
        metalness: 0.25,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(32, 32, '#1E3A5F', '#0F233A');
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Curved rear tactical wireframe backdrop wall
    const wallCurve = new THREE.Mesh(
      new THREE.CylinderGeometry(12.5, 12.5, 6.2, 36, 6, true, Math.PI * 0.65, Math.PI * 0.7),
      new THREE.MeshBasicMaterial({
        color: '#1E3A5F',
        wireframe: true,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      })
    );
    wallCurve.position.set(0, 3.0, 2.5);
    scene.add(wallCurve);

    // Place all 8 products along an elegant curved showroom gallery arc
    const displayEntries: {
      product: Product;
      group: THREE.Group;
      model: THREE.Group;
      ring: THREE.Mesh;
      baseY: number;
      hitBox: THREE.Mesh;
    }[] = [];

    const hitTargets: THREE.Object3D[] = [];

    // Order products spatially by bay so camera presets focus cleanly on each group
    const orderedProducts = [
      ...products.filter((p) => p.category === 'kits'),
      ...products.filter((p) => p.category === 'food-water'),
      ...products.filter((p) => p.category === 'survival'),
      ...products.filter((p) => p.category === 'power-med'),
    ];

    const total = orderedProducts.length;
    orderedProducts.forEach((product, idx) => {
      const t = total > 1 ? idx / (total - 1) : 0.5;
      const angle = (t - 0.5) * 1.15; // gentle semi-circular bay arc
      const radius = 7.4;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + 5.8;

      const bayGroup = new THREE.Group();
      bayGroup.position.set(x, 0, z);
      bayGroup.lookAt(0, 0, 5.5);

      // Matte metallic pedestal plinth
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.78, 0.36, 28),
        new THREE.MeshStandardMaterial({
          color: '#111927',
          roughness: 0.45,
          metalness: 0.65,
        })
      );
      plinth.position.y = 0.18;
      plinth.receiveShadow = true;
      bayGroup.add(plinth);

      // Neon-lime / cyan targeting halo ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#38BDF8',
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.71, 0.77, 48), ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.37;
      bayGroup.add(ring);

      // Product 3D model
      const model = buildProductModel(product.model3D.type, {
        primaryColor: product.model3D.primaryColor,
        secondaryColor: product.model3D.secondaryColor,
        accentColor: product.model3D.accentColor,
      });
      const scale = 0.68;
      model.scale.setScalar(scale);
      const baseY = 1.02;
      model.position.y = baseY;
      bayGroup.add(model);

      // Invisible generous raycast hitbox for effortless hovering & clicking
      const hitBox = new THREE.Mesh(
        new THREE.CylinderGeometry(0.78, 0.78, 1.85, 16),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitBox.position.y = 1.0;
      hitBox.userData = { productId: product.id };
      bayGroup.add(hitBox);
      hitTargets.push(hitBox);

      scene.add(bayGroup);
      displayEntries.push({ product, group: bayGroup, model, ring, baseY, hitBox });
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 3.6;
    controls.maxDistance = 13.5;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(...BAY_CAMERA_PRESETS.all.target);

    const stopTransition = () => {
      isTransitioningRef.current = false;
    };
    controls.addEventListener('start', stopTransition);

    // Raycasting for Video 1 floating hover tooltip & click inspect
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    let hoveredId: string | null = null;
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(hitTargets, false);
      if (intersects.length > 0) {
        const pid = intersects[0].object.userData.productId as string;
        hoveredId = pid;
        renderer.domElement.style.cursor = 'pointer';
        const match = displayEntries.find((d) => d.product.id === pid);
        if (match) {
          setHoveredInfo({
            product: match.product,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      } else {
        if (hoveredId !== null) {
          hoveredId = null;
          renderer.domElement.style.cursor = 'grab';
          setHoveredInfo(null);
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = Math.abs(e.clientX - pointerDownPos.x);
      const dy = Math.abs(e.clientY - pointerDownPos.y);
      if (dx < 6 && dy < 6 && hoveredId) {
        const match = displayEntries.find((d) => d.product.id === hoveredId);
        if (match) {
          onSelectRef.current(match.product);
        }
      }
    };

    const onPointerLeave = () => {
      hoveredId = null;
      setHoveredInfo(null);
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth camera transition when clicking bottom floating dock tabs
      if (isTransitioningRef.current) {
        camera.position.lerp(desiredCamPosRef.current, 0.065);
        controls.target.lerp(desiredTargetRef.current, 0.065);
        if (
          camera.position.distanceTo(desiredCamPosRef.current) < 0.04 &&
          controls.target.distanceTo(desiredTargetRef.current) < 0.04
        ) {
          isTransitioningRef.current = false;
        }
      }

      // Animate models: gentle hover lift, neon-lime highlight for active bay / hovered item
      displayEntries.forEach((entry, i) => {
        const isHovered = entry.product.id === hoveredId;
        const isCategoryActive =
          activeBayRef.current === 'all' ||
          entry.product.category === activeBayRef.current;

        const targetY = entry.baseY + (isHovered ? 0.24 : Math.sin(t * 1.4 + i) * 0.045);
        entry.model.position.y += (targetY - entry.model.position.y) * 0.12;
        entry.model.rotation.y += isHovered ? 0.025 : 0.0045;

        const ringMat = entry.ring.material as THREE.MeshBasicMaterial;
        if (isHovered) {
          ringMat.color.set('#39FF14');
          ringMat.opacity = 1.0;
          entry.ring.scale.lerp(new THREE.Vector3(1.16, 1.16, 1.16), 0.14);
        } else if (isCategoryActive) {
          ringMat.color.set(activeBayRef.current === 'all' ? '#38BDF8' : '#39FF14');
          ringMat.opacity = activeBayRef.current === 'all' ? 0.5 : 0.85;
          entry.ring.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
        } else {
          ringMat.color.set('#1E293B');
          ringMat.opacity = 0.2;
          entry.ring.scale.lerp(new THREE.Vector3(0.92, 0.92, 0.92), 0.12);
        }
      });

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
      controls.removeEventListener('start', stopTransition);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      controls.dispose();
      renderer.dispose();
    };
  }, [products]);

  const dockTabs: { id: BayFilter; label: string }[] = [
    { id: 'all', label: copy.showroom.tabs.all },
    { id: 'kits', label: copy.showroom.tabs.kits },
    { id: 'food-water', label: copy.showroom.tabs['food-water'] },
    { id: 'survival', label: copy.showroom.tabs.survival },
    { id: 'power-med', label: copy.showroom.tabs['power-med'] },
  ];

  return (
    <section
      id="showroom"
      className="relative bg-[#070B12] py-16 md:py-20 overflow-hidden border-y border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main KALLE-inspired HUD Frame */}
        <div className="relative h-[580px] sm:h-[640px] lg:h-[680px] rounded-3xl overflow-hidden border border-sky-400/20 bg-[#070B12] shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
          {/* Interactive 3D WebGL Canvas */}
          <div
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          {/* Four L-shaped Tactical HUD Corner Reticle Brackets (Video 1 signature) */}
          <div className="pointer-events-none absolute inset-4 sm:inset-6">
            <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-[#39FF14]/80 rounded-tl-sm" />
            <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-sky-400/60 rounded-tr-sm" />
            <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-sky-400/60 rounded-bl-sm" />
            <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-[#39FF14]/80 rounded-br-sm" />
          </div>

          {/* Top HUD Header Bar */}
          <div className="pointer-events-none absolute top-6 sm:top-8 left-7 sm:left-10 right-7 sm:right-10 flex items-start justify-between gap-4">
            {/* Top-left active section code */}
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs font-semibold tracking-widest text-[#39FF14]">
                <span className="h-2 w-2 rounded-full bg-[#39FF14] animate-pulse" />
                {copy.showroom.sectionCodes[activeBay]}
              </div>
              <p className="hidden md:block text-xs text-slate-400 max-w-sm">
                {copy.showroom.instructions}
              </p>
            </div>

            {/* Top-center pixel mark + wordmark (nod to KALLE Virtual Store) */}
            <div className="hidden sm:flex flex-col items-center text-center">
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-3 gap-0.5 p-0.5">
                  {[1, 0, 1, 1, 1, 0, 1, 0, 1].map((lit, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-[1px] ${
                        lit ? 'bg-[#39FF14]' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-display text-lg font-bold tracking-[0.22em] text-white">
                  CALMO
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.28em] text-slate-400 mt-0.5">
                {copy.showroom.subtitle}
              </span>
            </div>

            {/* Top-right system tag */}
            <div className="font-mono text-[11px] sm:text-xs tracking-widest text-sky-300/80 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-md border border-sky-400/20">
              {copy.showroom.sysTag}
            </div>
          </div>

          {/* Floating Cursor Hover Tooltip (Video 1: SIGNAL WINDBREAKER $120 style) */}
          {hoveredInfo && (
            <div
              className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-[125%] transition-opacity duration-150"
              style={{
                left: Math.min(Math.max(hoveredInfo.x, 120), 860),
                top: Math.max(hoveredInfo.y, 90),
              }}
            >
              <div className="flex items-center gap-3 rounded-full bg-[#0C131F]/95 border border-[#39FF14]/60 px-4 py-2 shadow-[0_12px_36px_rgba(0,0,0,0.65)] backdrop-blur-xl whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-[#39FF14]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  {hoveredInfo.product.name[lang]}
                </span>
                <span className="font-mono text-xs font-bold text-[#39FF14]">
                  {formatPrice(hoveredInfo.product.priceEur, currency)}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 border-l border-white/15 pl-2.5">
                  <Eye className="w-3 h-3" />
                  3D
                </span>
              </div>
            </div>
          )}

          {/* Bottom Floating Navigation Dock (Video 1 signature pill dock) */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 max-w-[94%]">
            <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#0E1624]/88 border border-white/15 p-1.5 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.7)] overflow-x-auto">
              {dockTabs.map((tab) => {
                const isActive = activeBay === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSwitchBay(tab.id)}
                    className={`px-3.5 sm:px-5 py-2 rounded-full font-mono text-[11px] sm:text-xs font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#39FF14] text-black shadow-[0_0_24px_rgba(57,255,20,0.45)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
              <div className="hidden md:flex items-center gap-1.5 pl-2 pr-3 text-[11px] font-mono text-slate-400 border-l border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>WebGL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
