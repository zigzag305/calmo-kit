import * as THREE from 'three';
import { Model3DType } from '../../types';

export interface ModelColorConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * Helper to create a rounded box geometry using ExtrudeGeometry for sleek industrial edges
 */
function createRoundedBox(
  width: number,
  height: number,
  depth: number,
  radius = 0.08,
  smoothness = 4
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const eps = 0.00001;
  const r = Math.min(radius, width / 2 - eps, height / 2 - eps);
  const w = width - 2 * r;
  const h = height - 2 * r;

  shape.absarc(-w / 2, -h / 2, r, Math.PI, Math.PI * 1.5, false);
  shape.absarc(w / 2, -h / 2, r, Math.PI * 1.5, Math.PI * 2, false);
  shape.absarc(w / 2, h / 2, r, 0, Math.PI * 0.5, false);
  shape.absarc(-w / 2, h / 2, r, Math.PI * 0.5, Math.PI, false);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.02, depth - r * 2),
    bevelEnabled: true,
    bevelSegments: smoothness,
    steps: 1,
    bevelSize: r,
    bevelThickness: r,
    curveSegments: smoothness,
  });

  geometry.center();
  return geometry;
}

/**
 * Builds high-craft procedural 3D PBR product assemblies for CalmoKit
 */
export function buildProductModel(
  type: Model3DType,
  colors: ModelColorConfig
): THREE.Group {
  const root = new THREE.Group();

  const primaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.primaryColor),
    roughness: 0.42,
    metalness: 0.18,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.secondaryColor),
    roughness: 0.55,
    metalness: 0.25,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#94A3B8'),
    roughness: 0.28,
    metalness: 0.85,
  });

  const darkRubberMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#111418'),
    roughness: 0.82,
    metalness: 0.08,
  });

  const accentGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.accentColor),
    emissive: new THREE.Color(colors.accentColor),
    emissiveIntensity: 0.75,
    roughness: 0.25,
    metalness: 0.1,
  });

  switch (type) {
    case 'crisis-pack': {
      // Main armored hard-shell pack body
      const body = new THREE.Mesh(createRoundedBox(1.18, 1.56, 0.56, 0.14), primaryMat);
      body.castShadow = true;
      root.add(body);

      // Front carbon/matte tactical shield panel
      const frontShell = new THREE.Mesh(
        createRoundedBox(0.92, 1.12, 0.14, 0.08),
        secondaryMat
      );
      frontShell.position.set(0, -0.06, 0.27);
      root.add(frontShell);

      // Horizontal MOLLE webbing straps
      for (let i = -2; i <= 1; i++) {
        const strap = new THREE.Mesh(
          new THREE.BoxGeometry(0.84, 0.06, 0.04),
          darkRubberMat
        );
        strap.position.set(0, i * 0.19 + 0.05, 0.34);
        root.add(strap);
      }

      // Top grab handle
      const handleGeo = new THREE.TorusGeometry(0.18, 0.042, 12, 24, Math.PI);
      const handle = new THREE.Mesh(handleGeo, darkRubberMat);
      handle.position.set(0, 0.78, 0);
      root.add(handle);

      // Side compression buckles
      for (const side of [-1, 1]) {
        const buckle = new THREE.Mesh(
          createRoundedBox(0.08, 0.16, 0.28, 0.02),
          metalMat
        );
        buckle.position.set(side * 0.6, 0.12, 0.05);
        root.add(buckle);
      }

      // Back padded ergonomic shoulder straps
      for (const side of [-0.3, 0.3]) {
        const pad = new THREE.Mesh(
          createRoundedBox(0.22, 1.18, 0.1, 0.04),
          darkRubberMat
        );
        pad.position.set(side, 0, -0.31);
        root.add(pad);
      }

      // Subtle glowing tactical status bar on upper front
      const statusBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.045, 0.03),
        accentGlowMat
      );
      statusBar.position.set(0, 0.57, 0.31);
      root.add(statusBar);

      // Modular side pouch
      const sidePouch = new THREE.Mesh(
        createRoundedBox(0.24, 0.52, 0.3, 0.06),
        secondaryMat
      );
      sidePouch.position.set(0.66, -0.32, 0.02);
      root.add(sidePouch);
      break;
    }

    case 'wilderness-pack': {
      // Olive field rucksack body
      const pack = new THREE.Mesh(createRoundedBox(1.12, 1.48, 0.52, 0.13), primaryMat);
      root.add(pack);

      // Top strapped thermal shelter roll
      const roll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 1.06, 24),
        secondaryMat
      );
      roll.rotation.z = Math.PI / 2;
      roll.position.set(0, 0.85, 0.02);
      root.add(roll);

      // Roll straps
      for (const x of [-0.32, 0.32]) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.198, 0.025, 8, 20),
          darkRubberMat
        );
        ring.rotation.y = Math.PI / 2;
        ring.position.set(x, 0.85, 0.02);
        root.add(ring);
      }

      // Front zip organizer pocket
      const pocket = new THREE.Mesh(
        createRoundedBox(0.84, 0.64, 0.16, 0.06),
        primaryMat
      );
      pocket.position.set(0, -0.25, 0.27);
      root.add(pocket);

      // Anodized carabiner hanging off front loop
      const carabiner = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.024, 10, 20),
        metalMat
      );
      carabiner.position.set(-0.34, 0.26, 0.32);
      carabiner.rotation.y = 0.35;
      root.add(carabiner);

      // Ferro rod & orange striker accent
      const ferro = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.032, 0.32, 12),
        accentGlowMat
      );
      ferro.position.set(0.36, 0.24, 0.31);
      ferro.rotation.z = -0.15;
      root.add(ferro);

      // Side canteen bottle
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.56, 20),
        metalMat
      );
      bottle.position.set(-0.66, -0.26, 0);
      root.add(bottle);
      break;
    }

    case 'blackout-station': {
      // Portable LiFePO4 power station main block
      const station = new THREE.Mesh(
        createRoundedBox(1.16, 0.88, 0.72, 0.09),
        primaryMat
      );
      station.position.set(-0.22, -0.14, 0.08);
      root.add(station);

      // Top carry handle
      const handleBar = new THREE.Mesh(
        createRoundedBox(0.84, 0.09, 0.12, 0.03),
        metalMat
      );
      handleBar.position.set(-0.22, 0.44, 0.08);
      root.add(handleBar);

      for (const side of [-0.36, 0.36]) {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.18, 0.1),
          darkRubberMat
        );
        post.position.set(-0.22 + side, 0.34, 0.08);
        root.add(post);
      }

      // Recessed LCD display screen
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.28, 0.03),
        new THREE.MeshStandardMaterial({
          color: '#060B12',
          roughness: 0.15,
          metalness: 0.4,
        })
      );
      screen.position.set(-0.22, 0.08, 0.44);
      root.add(screen);

      // Glowing battery charge bars on LCD
      for (let i = 0; i < 4; i++) {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.12, 0.015),
          accentGlowMat
        );
        bar.position.set(-0.37 + i * 0.1, 0.08, 0.46);
        root.add(bar);
      }

      // AC Outlets & USB-C ports
      for (let i = 0; i < 2; i++) {
        const outlet = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16),
          darkRubberMat
        );
        outlet.rotation.x = Math.PI / 2;
        outlet.position.set(-0.44 + i * 0.24, -0.26, 0.44);
        root.add(outlet);
      }

      // Folding solar panel propped behind/right
      const solarGroup = new THREE.Group();
      const solarFrame = new THREE.Mesh(
        createRoundedBox(0.88, 1.15, 0.06, 0.03),
        darkRubberMat
      );
      solarGroup.add(solarFrame);

      const cellMat = new THREE.MeshStandardMaterial({
        color: '#111E36',
        roughness: 0.2,
        metalness: 0.72,
      });
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          const cell = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.3, 0.02),
            cellMat
          );
          cell.position.set(c * 0.26, r * 0.34, 0.035);
          solarGroup.add(cell);
        }
      }
      solarGroup.position.set(0.55, 0.05, -0.24);
      solarGroup.rotation.y = -0.45;
      solarGroup.rotation.x = -0.12;
      root.add(solarGroup);

      // Compact glowing tactical lantern on right foreground
      const lanternBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.2, 0.18, 20),
        darkRubberMat
      );
      lanternBase.position.set(0.68, -0.46, 0.28);
      root.add(lanternBase);

      const lanternGlow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.28, 20),
        new THREE.MeshStandardMaterial({
          color: '#FEF3C7',
          emissive: '#F59E0B',
          emissiveIntensity: 0.8,
          roughness: 0.2,
        })
      );
      lanternGlow.position.set(0.68, -0.24, 0.28);
      root.add(lanternGlow);

      const lanternCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.08, 20),
        darkRubberMat
      );
      lanternCap.position.set(0.68, -0.07, 0.28);
      root.add(lanternCap);
      break;
    }

    case 'food-case': {
      // Waterproof hard Pelican-style supply case
      const caseBase = new THREE.Mesh(
        createRoundedBox(1.42, 0.56, 0.96, 0.08),
        primaryMat
      );
      caseBase.position.set(0, -0.32, 0);
      root.add(caseBase);

      // Ribbed protective lid slightly angled open or resting cleanly
      const lid = new THREE.Mesh(
        createRoundedBox(1.42, 0.14, 0.96, 0.06),
        primaryMat
      );
      lid.position.set(0, 0.02, -0.02);
      root.add(lid);

      // Protective ribs on top of lid
      for (let i = -2; i <= 2; i++) {
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 0.05, 0.8),
          secondaryMat
        );
        rib.position.set(i * 0.24, 0.1, -0.02);
        root.add(rib);
      }

      // Heavy front latches
      for (const x of [-0.42, 0.42]) {
        const latch = new THREE.Mesh(
          createRoundedBox(0.16, 0.24, 0.08, 0.02),
          darkRubberMat
        );
        latch.position.set(x, -0.1, 0.48);
        root.add(latch);
      }

      // Front carry handle
      const handle = new THREE.Mesh(
        createRoundedBox(0.46, 0.07, 0.16, 0.02),
        darkRubberMat
      );
      handle.position.set(0, -0.28, 0.54);
      root.add(handle);

      // Standing matte stainless canteen on top-right
      const canteen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.68, 24),
        secondaryMat
      );
      canteen.position.set(0.42, 0.46, -0.05);
      root.add(canteen);

      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.14, 0.12, 20),
        metalMat
      );
      cap.position.set(0.42, 0.84, -0.05);
      root.add(cap);

      // 2 standing foil ration pouches beside canteen
      for (let i = 0; i < 2; i++) {
        const pouch = new THREE.Mesh(
          createRoundedBox(0.42, 0.58, 0.1, 0.03),
          i === 0 ? accentGlowMat : darkRubberMat
        );
        pouch.position.set(-0.34 + i * 0.22, 0.38, -0.08 + i * 0.16);
        pouch.rotation.y = 0.15 - i * 0.25;
        root.add(pouch);
      }
      break;
    }

    case 'water-filter': {
      // Main hollow-fiber filter cylinder
      const filterBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 1.38, 28),
        primaryMat
      );
      filterBody.position.set(-0.32, 0, 0.06);
      filterBody.rotation.z = -0.14;
      root.add(filterBody);

      // Brushed titanium accent rings
      for (const y of [-0.42, 0.35, 0.64]) {
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(0.185, 0.185, 0.1, 28),
          metalMat
        );
        ring.position.set(-0.32 - y * 0.14, y, 0.06);
        ring.rotation.z = -0.14;
        root.add(ring);
      }

      // Mouthpiece cap
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 0.22, 20),
        accentGlowMat
      );
      nozzle.position.set(-0.43, 0.78, 0.06);
      nozzle.rotation.z = -0.14;
      root.add(nozzle);

      // Collapsible frosted-smoke TPU hydration pouch beside it
      const pouchMat = new THREE.MeshPhysicalMaterial({
        color: '#94A3B8',
        roughness: 0.35,
        metalness: 0.05,
        transmission: 0.55,
        transparent: true,
        opacity: 0.85,
      });
      const pouch = new THREE.Mesh(
        createRoundedBox(0.68, 1.1, 0.26, 0.1),
        pouchMat
      );
      pouch.position.set(0.38, -0.08, -0.08);
      pouch.rotation.y = -0.22;
      root.add(pouch);

      const pouchCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.14, 18),
        darkRubberMat
      );
      pouchCap.position.set(0.38, 0.54, -0.08);
      root.add(pouchCap);
      break;
    }

    case 'trauma-kit': {
      // Signal-red molded EVA hard-shell trauma pod
      const pod = new THREE.Mesh(
        createRoundedBox(1.38, 0.94, 0.48, 0.15),
        primaryMat
      );
      root.add(pod);

      // Perimeter matte-black waterproof zipper seam
      const seam = new THREE.Mesh(
        createRoundedBox(1.42, 0.98, 0.07, 0.15),
        darkRubberMat
      );
      root.add(seam);

      // Crisp raised medical cross emblem on front
      const crossMat = new THREE.MeshStandardMaterial({
        color: '#F8FAFC',
        roughness: 0.35,
        metalness: 0.1,
      });
      const crossV = new THREE.Mesh(
        createRoundedBox(0.14, 0.46, 0.05, 0.02),
        crossMat
      );
      crossV.position.set(0, 0, 0.24);
      root.add(crossV);

      const crossH = new THREE.Mesh(
        createRoundedBox(0.46, 0.14, 0.05, 0.02),
        crossMat
      );
      crossH.position.set(0, 0, 0.24);
      root.add(crossH);

      // Carabiner carry loop on top
      const loop = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.03, 10, 20),
        darkRubberMat
      );
      loop.position.set(0, 0.55, 0);
      root.add(loop);
      break;
    }

    case 'weather-radio': {
      // Rugged weather radio chassis
      const chassis = new THREE.Mesh(
        createRoundedBox(1.42, 0.82, 0.56, 0.1),
        primaryMat
      );
      root.add(chassis);

      // Top solar panel
      const solar = new THREE.Mesh(
        new THREE.BoxGeometry(1.06, 0.05, 0.38),
        new THREE.MeshStandardMaterial({
          color: '#0F1F3A',
          roughness: 0.2,
          metalness: 0.78,
        })
      );
      solar.position.set(0, 0.42, 0);
      root.add(solar);

      // Speaker grille dots
      const grille = new THREE.Mesh(
        createRoundedBox(0.48, 0.48, 0.04, 0.05),
        darkRubberMat
      );
      grille.position.set(-0.34, -0.02, 0.28);
      root.add(grille);

      // Frequency tuning window + glowing indicator
      const dialWindow = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.2, 0.03),
        darkRubberMat
      );
      dialWindow.position.set(0.32, 0.12, 0.28);
      root.add(dialWindow);

      const needle = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.16, 0.04),
        accentGlowMat
      );
      needle.position.set(0.28, 0.12, 0.29);
      root.add(needle);

      // Two rotary tuning knobs
      for (const x of [0.2, 0.46]) {
        const knob = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.08, 20),
          metalMat
        );
        knob.rotation.x = Math.PI / 2;
        knob.position.set(x, -0.18, 0.3);
        root.add(knob);
      }

      // Telescopic brushed aluminum antenna
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.028, 1.05, 12),
        metalMat
      );
      antenna.position.set(-0.52, 0.84, -0.14);
      antenna.rotation.z = 0.22;
      root.add(antenna);

      // Side amber LED flashlight beacon ring
      const lensRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.032, 12, 24),
        accentGlowMat
      );
      lensRing.rotation.y = Math.PI / 2;
      lensRing.position.set(0.72, 0, 0);
      root.add(lensRing);

      // Folded back crank handle
      const crank = new THREE.Mesh(
        createRoundedBox(0.54, 0.09, 0.08, 0.02),
        metalMat
      );
      crank.position.set(0.05, 0, -0.32);
      crank.rotation.z = -0.2;
      root.add(crank);
      break;
    }

    case 'meal-pouches': {
      // Three staggered stand-up foil emergency ration pouches
      const pouchPositions: [number, number, number, number, string][] = [
        [-0.36, 0.04, -0.2, 0.18, colors.primaryColor],
        [0, 0, 0, 0, colors.secondaryColor],
        [0.36, -0.04, 0.2, -0.18, colors.primaryColor],
      ];

      for (const [x, y, z, rotY, col] of pouchPositions) {
        const pGroup = new THREE.Group();
        const foilMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(col),
          roughness: 0.32,
          metalness: 0.45,
        });
        const pouchBody = new THREE.Mesh(
          createRoundedBox(0.76, 1.12, 0.16, 0.05),
          foilMat
        );
        pGroup.add(pouchBody);

        // Heat-sealed top crimp band
        const topSeal = new THREE.Mesh(
          new THREE.BoxGeometry(0.76, 0.11, 0.04),
          metalMat
        );
        topSeal.position.set(0, 0.56, 0);
        pGroup.add(topSeal);

        // Minimalist amber nutrition stripe band
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.78, 0.16, 0.175),
          accentGlowMat
        );
        stripe.position.set(0, -0.18, 0);
        pGroup.add(stripe);

        pGroup.position.set(x, y, z);
        pGroup.rotation.y = rotY;
        root.add(pGroup);
      }
      break;
    }
  }

  // Enable shadows across all child meshes
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return root;
}
