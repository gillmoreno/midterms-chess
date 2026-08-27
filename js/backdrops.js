import * as THREE from "three";

const R = 7.52;
const SIDES = 8;
const FENCE_H = 2.22;
const IN = R * Math.cos(Math.PI / SIDES);

const cache = {};

function cached(key, fn) {
  if (!cache[key]) {
    const t = fn();
    t.userData.keep = true;
    cache[key] = t;
  }
  return cache[key];
}

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function std(color, extra) {
  return new THREE.MeshStandardMaterial(
    Object.assign({ color, roughness: 0.55, metalness: 0.12 }, extra || {})
  );
}

function vertexAngle(i) {
  return ((i + 0.5) * Math.PI * 2) / SIDES;
}

function chainTex() {
  return cached("chain", () =>
    canvasTex(96, 192, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(196, 206, 216, 0.92)";
      ctx.lineWidth = 1.15;
      const s = 9;
      for (let y = -s; y < h + s; y += s) {
        const ox = ((y / s) | 0) % 2 === 0 ? 0 : s / 2;
        for (let x = -s; x < w + s; x += s) {
          ctx.strokeRect(x + ox, y, s, s);
        }
      }
    })
  );
}

function grassTex() {
  return cached("grass", () =>
    canvasTex(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#102414";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = i % 3 === 0 ? "#16301c" : i % 3 === 1 ? "#0c1c10" : "#1a3a22";
        ctx.fillRect(Math.random() * w, Math.random() * h, 3, 6);
      }
    })
  );
}

function matTex() {
  return cached("octagon-mat", () =>
    canvasTex(1024, 1024, (ctx, w) => {
      const cx = w / 2;
      const cy = w / 2;
      ctx.clearRect(0, 0, w, w);
      ctx.fillStyle = "#121214";
      ctx.beginPath();
      for (let i = 0; i < SIDES; i++) {
        const a = vertexAngle(i);
        const x = cx + Math.sin(a) * w * 0.48;
        const y = cy + Math.cos(a) * w * 0.48;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.28, 0, Math.PI * 2);
      ctx.clip();
      ctx.clearRect(0, 0, w, w);
      ctx.restore();
      ctx.strokeStyle = "#c9a24a";
      ctx.lineWidth = 10;
      ctx.beginPath();
      for (let i = 0; i < SIDES; i++) {
        const a = vertexAngle(i);
        const x = cx + Math.sin(a) * w * 0.455;
        const y = cy + Math.cos(a) * w * 0.455;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#d4af37";
      ctx.font = "700 42px Times New Roman, serif";
      ctx.textAlign = "center";
      ctx.fillText("THE MIDTERMS", cx, cy + w * 0.4);
    })
  );
}

function facadeTex() {
  return cached("facade", () =>
    canvasTex(512, 256, (ctx, w, h) => {
      ctx.fillStyle = "#e6dfd2";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#cfc6b6";
      ctx.fillRect(0, h * 0.08, w, 6);
      const cols = 9;
      const rows = 3;
      const ww = 28;
      const hh = 38;
      const gx = (w - cols * 48) / 2;
      const gy = 48;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const on = (c + r * 3) % 7 !== 2;
          ctx.fillStyle = on ? "#f2d56a" : "#243044";
          ctx.fillRect(gx + c * 48, gy + r * 56, ww, hh);
        }
      }
    })
  );
}

function facadeEmissive() {
  return cached("facade-em", () =>
    canvasTex(512, 256, (ctx, w, h) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      const cols = 9;
      const rows = 3;
      const gx = (w - cols * 48) / 2;
      const gy = 48;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const on = (c + r * 3) % 7 !== 2;
          ctx.fillStyle = on ? "#ffd978" : "#000";
          ctx.fillRect(gx + c * 48, gy + r * 56, 28, 38);
        }
      }
    })
  );
}

function skyTex() {
  return cached("ufc-sky", () =>
    canvasTex(8, 256, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#07061a");
      g.addColorStop(0.45, "#1a1040");
      g.addColorStop(0.72, "#3a1860");
      g.addColorStop(1, "#12081c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    })
  );
}

function flagTex() {
  return cached("flag", () =>
    canvasTex(256, 140, (ctx, w, h) => {
      const sh = h / 13;
      for (let i = 0; i < 13; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#9e1b2f" : "#f3efe6";
        ctx.fillRect(0, i * sh, w, sh + 1);
      }
      ctx.fillStyle = "#163a7a";
      ctx.fillRect(0, 0, w * 0.42, sh * 7);
      ctx.fillStyle = "#f0c75e";
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 6; c++) {
          ctx.beginPath();
          ctx.arc(14 + c * 16, 10 + r * 18, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    })
  );
}

function addFlag(root, x, y, z, scale) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.035, 2.6, 8),
    std(0xc9a24a, { metalness: 0.7, roughness: 0.3 })
  );
  pole.position.y = 1.3;
  g.add(pole);
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 0.75),
    new THREE.MeshStandardMaterial({
      map: flagTex(),
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
    })
  );
  cloth.position.set(0.68, 2.15, 0);
  g.add(cloth);
  g.position.set(x, y, z);
  g.scale.setScalar(scale || 1);
  root.add(g);
}

function fighterCard(title, house, color, portrait) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 640;
  const ctx = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  function paint(img) {
    ctx.fillStyle = "#0a0a0e";
    ctx.fillRect(0, 0, 512, 640);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 72);
    ctx.fillStyle = "#fff4e8";
    ctx.font = "700 42px Times New Roman, serif";
    ctx.textAlign = "center";
    ctx.fillText("THE MIDTERMS", 256, 50);
    ctx.fillStyle = "#16161c";
    ctx.fillRect(36, 92, 440, 420);
    if (img) ctx.drawImage(img, 36, 92, 440, 420);
    ctx.fillStyle = color;
    ctx.fillRect(0, 520, 512, 120);
    ctx.fillStyle = "#fff4e8";
    ctx.font = "700 48px Times New Roman, serif";
    ctx.fillText(title, 256, 572);
    ctx.font = "600 24px Times New Roman, serif";
    ctx.fillText(house, 256, 610);
    tex.needsUpdate = true;
  }
  paint(null);
  if (portrait) {
    const img = new Image();
    img.onload = () => paint(img);
    img.src = portrait;
  }
  return tex;
}

function addOctagon(root) {
  const black = std(0x141416, { roughness: 0.62, metalness: 0.18 });
  const pad = std(0x0c0c10, { roughness: 0.7 });
  const rail = std(0x1a1a20, { metalness: 0.45, roughness: 0.35 });
  const postMat = std(0x0a0a0c, { metalness: 0.55, roughness: 0.3 });

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(R, R + 0.15, 0.34, SIDES), black);
  platform.position.y = -0.02;
  platform.rotation.y = Math.PI / SIDES;
  platform.receiveShadow = true;
  root.add(platform);

  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.18, R + 0.55, 0.7, SIDES),
    pad
  );
  skirt.position.y = -0.52;
  skirt.rotation.y = Math.PI / SIDES;
  root.add(skirt);

  const mat = new THREE.MeshStandardMaterial({
    map: matTex(),
    transparent: true,
    roughness: 0.55,
    metalness: 0.12,
  });
  const decal = new THREE.Mesh(new THREE.CircleGeometry(R, 48), mat);
  decal.rotation.x = -Math.PI / 2;
  decal.position.y = 0.155;
  root.add(decal);

  const link = new THREE.MeshStandardMaterial({
    map: chainTex(),
    transparent: true,
    alphaTest: 0.12,
    roughness: 0.28,
    metalness: 0.72,
    side: THREE.DoubleSide,
    color: 0xc8d0d8,
  });
  const sideW = 2 * R * Math.sin(Math.PI / SIDES);
  const fenceGeo = new THREE.PlaneGeometry(sideW, FENCE_H);
  const padGeo = new THREE.BoxGeometry(sideW, 0.28, 0.1);
  const railGeo = new THREE.BoxGeometry(sideW + 0.08, 0.1, 0.12);
  const postGeo = new THREE.CylinderGeometry(0.09, 0.1, FENCE_H + 0.35, 8);

  for (let i = 0; i < SIDES; i++) {
    const a0 = vertexAngle(i);
    const a1 = vertexAngle(i + 1);
    const mid = (a0 + a1) / 2;
    const px = Math.sin(mid) * IN;
    const pz = Math.cos(mid) * IN;

    const fence = new THREE.Mesh(fenceGeo, link);
    fence.position.set(px, FENCE_H * 0.5 + 0.14, pz);
    fence.rotation.y = mid;
    root.add(fence);

    const bumper = new THREE.Mesh(padGeo, pad);
    bumper.position.set(px, 0.28, pz);
    bumper.rotation.y = mid;
    root.add(bumper);

    const top = new THREE.Mesh(railGeo, rail);
    top.position.set(px, FENCE_H + 0.22, pz);
    top.rotation.y = mid;
    root.add(top);

    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(Math.sin(a0) * R, (FENCE_H + 0.35) * 0.5, Math.cos(a0) * R);
    post.castShadow = true;
    root.add(post);
  }
}

function addWhiteHouse(root) {
  const stone = std(0xe4ddd0, { roughness: 0.62, metalness: 0.08 });
  const roof = std(0x3a2a28, { roughness: 0.7 });
  const house = new THREE.Group();

  const map = facadeTex();
  const em = facadeEmissive();
  const wall = new THREE.MeshStandardMaterial({
    map,
    emissive: 0xffc878,
    emissiveMap: em,
    emissiveIntensity: 0.85,
    roughness: 0.58,
    metalness: 0.06,
  });

  const center = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.6, 3.6), wall);
  center.position.y = 2.05;
  house.add(center);

  const wingL = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.7, 2.8), wall);
  wingL.position.set(-7.4, 1.55, -0.2);
  const wingR = wingL.clone();
  wingR.position.x = 7.4;
  house.add(wingL, wingR);

  const portico = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.18, 2.2), stone);
  portico.position.set(0, 3.55, 2.15);
  house.add(portico);

  for (let i = -2; i <= 2; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 3.55, 12), stone);
    col.position.set(i * 1.2, 2.05, 2.55);
    col.castShadow = true;
    house.add(col);
  }

  const ped = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.15, 3), stone);
  ped.rotation.y = Math.PI;
  ped.position.set(0, 4.25, 2.15);
  house.add(ped);

  const roofC = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.22, 3.8), roof);
  roofC.position.y = 3.95;
  house.add(roofC);

  const steps = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.45, 2.4), stone);
  steps.position.set(0, 0.22, 3.3);
  house.add(steps);

  const washL = new THREE.PointLight(0xff5aa8, 3.2, 30, 2);
  washL.position.set(-5.5, 3.4, 3.2);
  const washR = new THREE.PointLight(0x6a8cff, 3.0, 30, 2);
  washR.position.set(5.5, 3.4, 3.2);
  const washF = new THREE.PointLight(0xffd8c8, 1.6, 18, 2);
  washF.position.set(0, 3.2, 4.2);
  house.add(washF);
  house.add(washL, washR);

  addFlag(house, 0.15, 4.15, 0.2, 0.85);

  house.position.set(0, 0, -12.35);
  house.scale.setScalar(1.18);
  root.add(house);
  return house;
}

function addJumbotrons(root) {
  const leftTex = fighterCard("NEWSCUM", "THE LEFT  ·  KING", "#163a7a", "assets/portraits/newsom.jpg");
  const rightTex = fighterCard("TRUMP", "THE RIGHT  ·  KING", "#9e1b2f", "assets/portraits/trump.jpg");
  const left = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 5.7),
    new THREE.MeshBasicMaterial({ map: leftTex })
  );
  left.position.set(-11.4, 2.85, -10.1);
  left.rotation.y = 0.55;
  const right = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 5.7),
    new THREE.MeshBasicMaterial({ map: rightTex })
  );
  right.position.set(11.4, 2.85, -10.1);
  right.rotation.y = -0.55;
  const frameM = std(0x111116, { metalness: 0.4, roughness: 0.4 });
  function frame(mesh) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(4.85, 5.95, 0.12), frameM);
    f.position.copy(mesh.position);
    f.position.z -= 0.08;
    f.rotation.copy(mesh.rotation);
    root.add(f);
  }
  frame(left);
  frame(right);
  root.add(left, right);
}

function addCrowd(root, dress) {
  const n = 480;
  const bodyGeo = new THREE.BoxGeometry(0.2, 0.62, 0.18);
  const headGeo = new THREE.BoxGeometry(0.13, 0.13, 0.13);
  const phoneGeo = new THREE.BoxGeometry(0.05, 0.09, 0.02);
  const bodyMat = new THREE.MeshStandardMaterial({
    roughness: 0.86,
    metalness: 0.04,
    vertexColors: false,
  });
  const bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, n);
  const heads = new THREE.InstancedMesh(headGeo, std(0xc4a882, { roughness: 0.7 }), n);
  bodies.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  const dummy = new THREE.Object3D();
  const pal = [
    [0.08, 0.08, 0.12],
    [0.12, 0.14, 0.22],
    [0.18, 0.1, 0.1],
    [0.72, 0.72, 0.78],
    [0.12, 0.18, 0.38],
    [0.4, 0.08, 0.1],
  ];
  const phoneDummy = new THREE.Object3D();
  const phonePos = [];
  for (let i = 0; i < n; i++) {
    const row = i % 6;
    const slot = Math.floor(i / 6);
    const a = (slot / (n / 6)) * Math.PI * 1.68 + 0.58;
    const rad = 8.45 + row * 0.5;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    const h = 0.58 + (i % 5) * 0.07;
    dummy.position.set(x, h * 0.5, z);
    dummy.scale.set(1, h / 0.62, 1);
    dummy.lookAt(0, h * 0.5, 0);
    dummy.updateMatrix();
    bodies.setMatrixAt(i, dummy.matrix);
    const c = pal[i % pal.length];
    bodies.instanceColor.setXYZ(i, c[0], c[1], c[2]);
    dummy.position.y = h + 0.08;
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    heads.setMatrixAt(i, dummy.matrix);
    if (i % 3 === 0) {
      phonePos.push({ x, y: h + 0.28, z, a });
    }
  }
  bodies.instanceColor.needsUpdate = true;
  bodies.computeBoundingSphere();
  heads.computeBoundingSphere();
  root.add(bodies, heads);

  const phones = new THREE.InstancedMesh(
    phoneGeo,
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    phonePos.length
  );
  phones.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(phonePos.length * 3), 3);
  phonePos.forEach((q, i) => {
    phoneDummy.position.set(q.x, q.y, q.z);
    phoneDummy.rotation.y = q.a;
    phoneDummy.updateMatrix();
    phones.setMatrixAt(i, phoneDummy.matrix);
    phones.instanceColor.setXYZ(i, 0.7, 0.85, 1);
  });
  phones.instanceColor.needsUpdate = true;
  phones.computeBoundingSphere();
  root.add(phones);
  dress.phones = phones;
}

function addArch(root, dress) {
  const bulbGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const n = 44;
  const bulbs = new THREE.InstancedMesh(
    bulbGeo,
    new THREE.MeshBasicMaterial({ color: 0xfff6d8 }),
    n
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = Math.PI * t;
    dummy.position.set(Math.cos(a) * 9.4, 0.7 + Math.sin(a) * 5.4, -3.2);
    dummy.updateMatrix();
    bulbs.setMatrixAt(i, dummy.matrix);
  }
  bulbs.computeBoundingSphere();
  root.add(bulbs);
  dress.arch = bulbs;

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const spot = new THREE.SpotLight(0xfff1dc, 1.55, 24, 0.32, 0.45, 1);
    spot.position.set(Math.cos(a) * 7.5, 9.2, Math.sin(a) * 4.5);
    spot.target.position.set(0, 0.4, 0);
    root.add(spot, spot.target);
    dress.spots.push(spot);
  }
}

function addTrees(root) {
  const leaf = std(0x0c2014, { roughness: 0.9 });
  const bark = std(0x2a1c12, { roughness: 0.8 });
  function tree(x, z, s) {
    const g = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 6), bark);
    t.position.y = 0.6;
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.95, 8, 6), leaf);
    c.position.y = 1.55;
    c.scale.set(1.1, 1.25, 1.1);
    g.add(t, c);
    g.position.set(x, 0, z);
    g.scale.setScalar(s);
    root.add(g);
  }
  tree(-14.8, -11.8, 1.15);
  tree(-16.2, -9.6, 0.95);
  tree(15.0, -11.6, 1.1);
  tree(16.4, -9.4, 0.9);
}

function addFireworks(root, dress) {
  const n = 90;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
  );
  root.add(pts);
  dress.fwPts = pts;
  dress.fwPos = pos;
  dress.fwCol = col;
  dress.fwN = n;
  dress.fwAge = 0;
}

function addStars(root) {
  const n = 180;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const y = 10 + Math.random() * 18;
    const r = 16 + Math.random() * 20;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * r - 6;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  root.add(
    new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xe8e0ff, size: 0.08, transparent: true, opacity: 0.8 })
    )
  );
}

export function dressArena(stage) {
  const { scene, floor, dais, goldRing, hemi, key, fill, rim, renderer, backdropRoot } = stage;
  scene.background = new THREE.Color(0x0b0618);
  scene.fog = new THREE.Fog(0x140820, 18, 46);
  renderer.toneMappingExposure = 1.08;
  hemi.color.set(0xc8b4ff);
  hemi.groundColor.set(0x1a0a18);
  hemi.intensity = 0.42;
  key.color.set(0xffe6c8);
  key.intensity = 1.28;
  key.position.set(5, 13, 9);
  fill.color.set(0x6688ff);
  fill.intensity = 0.7;
  fill.position.set(-8, 7, -4);
  rim.color.set(0xff88cc);
  rim.intensity = 0.85;
  rim.position.set(0, 5.5, -2);

  floor.material.color.set(0xffffff);
  floor.material.map = grassTex();
  floor.material.roughness = 0.92;
  floor.material.metalness = 0.02;
  floor.material.needsUpdate = true;
  floor.scale.set(1.35, 1, 1.35);
  dais.visible = false;
  goldRing.visible = false;

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(48, 24, 16),
    new THREE.MeshBasicMaterial({
      map: skyTex(),
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    })
  );
  sky.renderOrder = -10;
  backdropRoot.add(sky);

  stage.dress = { t: 0, spots: [], phones: null, arch: null };
  addOctagon(backdropRoot);
  addWhiteHouse(backdropRoot);
  addJumbotrons(backdropRoot);
  addCrowd(backdropRoot, stage.dress);
  addArch(backdropRoot, stage.dress);
  addTrees(backdropRoot);
  addFireworks(backdropRoot, stage.dress);
  addStars(backdropRoot);

  const moon = new THREE.PointLight(0xa8c4ff, 0.55, 40, 2);
  moon.position.set(-10, 16, -8);
  backdropRoot.add(moon);
}

export function tickArena(dt, stage) {
  const d = stage.dress;
  if (!d) return;
  d.t += dt;
  const t = d.t;
  d.spots.forEach((s, i) => {
    const a = t * 0.12 + i * 1.57;
    s.position.x = Math.cos(a) * 8.2;
    s.position.z = Math.sin(a) * 5.2 - 1;
  });
  if (d.phones && Math.floor(t * 12) !== Math.floor((t - dt) * 12)) {
    const n = d.phones.count;
    for (let k = 0; k < 10; k++) {
      const i = (Math.random() * n) | 0;
      const on = Math.random() > 0.35;
      d.phones.instanceColor.setXYZ(i, on ? 0.85 : 0.15, on ? 0.95 : 0.2, on ? 1 : 0.4);
    }
    d.phones.instanceColor.needsUpdate = true;
  }
  if (d.fwPos && d.fwN && d.fwCol && d.fwPts) {
    d.burstClock = (d.burstClock || 0) + dt;
    const u = (d.burstClock % 2.8) / 2.8;
    const idx = Math.floor(d.burstClock / 2.8) % 3;
    const ox = idx === 1 ? -5.5 : idx === 2 ? 5.2 : 0;
    const oy = idx === 1 ? 10.5 : idx === 2 ? 11 : 11.5;
    const oz = idx === 1 ? -8 : idx === 2 ? -9 : -10;
    const hr = idx === 1 ? 0.45 : 1;
    const hg = idx === 1 ? 0.6 : idx === 2 ? 0.85 : 0.35;
    const hb = idx === 1 ? 1 : idx === 2 ? 0.35 : 0.55;
    for (let i = 0; i < d.fwN; i++) {
      const a = (i / d.fwN) * Math.PI * 2;
      const b = (i % 7) * 0.4;
      const rad = u * (2.4 + (i % 5) * 0.25);
      d.fwPos[i * 3] = ox + Math.cos(a) * rad;
      d.fwPos[i * 3 + 1] = oy + Math.sin(b) * rad * 0.55 - u * 0.8;
      d.fwPos[i * 3 + 2] = oz + Math.sin(a) * rad;
      const fade = 1 - u;
      d.fwCol[i * 3] = hr * fade;
      d.fwCol[i * 3 + 1] = hg * fade;
      d.fwCol[i * 3 + 2] = hb * fade;
    }
    d.fwPts.geometry.attributes.position.needsUpdate = true;
    d.fwPts.geometry.attributes.color.needsUpdate = true;
    d.fwPts.material.opacity = 0.95 * (1 - u * u);
  }
}
