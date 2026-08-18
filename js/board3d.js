import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const Chess = window.Chess;
const S = 1.16;
const FILES = "abcdefgh";

export function squareCenter(file, rank) {
  return {
    x: (file - 3.5) * S,
    z: (3.5 - rank) * S,
  };
}

function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function makeMarbleTexture(light, dark, veining) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = veining;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 256, Math.random() * 256);
    ctx.bezierCurveTo(
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = dark;
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 18, 10);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function stauntonMesh(type, color) {
  const isRight = color === "w";
  const body = isRight ? 0xc9a66b : 0x1b3a6b;
  const trim = isRight ? 0x8b1e2d : 0xd8e6ff;
  const mat = new THREE.MeshStandardMaterial({
    color: body,
    roughness: 0.38,
    metalness: 0.18,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: trim,
    roughness: 0.32,
    metalness: 0.4,
  });
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.08, 24), mat);
  base.position.y = 0.04;
  g.add(base);
  const stemH = type === "p" ? 0.22 : type === "r" ? 0.28 : 0.32;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.14, stemH, 20),
    mat
  );
  stem.position.y = 0.08 + stemH / 2;
  g.add(stem);
  let topY = 0.08 + stemH;
  if (type === "p") {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), mat);
    head.position.y = topY + 0.12;
    g.add(head);
  } else if (type === "r") {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.2, 16), mat);
    tower.position.y = topY + 0.1;
    g.add(tower);
    for (let i = 0; i < 4; i++) {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.07), accent);
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      merlon.position.set(Math.cos(a) * 0.12, topY + 0.24, Math.sin(a) * 0.12);
      g.add(merlon);
    }
  } else if (type === "n") {
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.22), mat);
    neck.position.set(0, topY + 0.16, 0.02);
    neck.rotation.x = -0.35;
    g.add(neck);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.16), accent);
    snout.position.set(0, topY + 0.26, 0.14);
    g.add(snout);
  } else if (type === "b") {
    const mitre = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 20), mat);
    mitre.position.y = topY + 0.18;
    g.add(mitre);
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.02), accent);
    slit.position.y = topY + 0.22;
    g.add(slit);
  } else if (type === "q") {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.12, 8), accent);
    crown.position.y = topY + 0.08;
    g.add(crown);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), mat);
    orb.position.y = topY + 0.2;
    g.add(orb);
  } else {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.14, 16), mat);
    crown.position.y = topY + 0.08;
    g.add(crown);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.05), accent);
    crossV.position.y = topY + 0.26;
    g.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.05), accent);
    crossH.position.y = topY + 0.3;
    g.add(crossH);
  }
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return fitToHeight(g, window.Roster.heightFor(type), false);
}

function fitToHeight(root, targetH, faceNegZ) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const h = size.y > 0.0001 ? size.y : 1;
  const span = Math.max(size.x, size.z, 0.0001);
  const s = Math.min(targetH / h, (S * 0.9) / span);
  root.scale.multiplyScalar(s);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  const c2 = new THREE.Vector3();
  box2.getCenter(c2);
  root.position.x -= c2.x;
  root.position.z -= c2.z;
  root.position.y -= box2.min.y;
  if (faceNegZ) root.rotation.y += Math.PI;
  root.updateMatrixWorld(true);
  const wrap = new THREE.Group();
  wrap.add(root);
  wrap.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return wrap;
}

function normalizeModel(root, targetH, faceNegZ) {
  return fitToHeight(root, targetH, faceNegZ);
}

export function createBoard3D(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070910);
  scene.fog = new THREE.Fog(0x070910, 14, 32);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0, 8.4, 10.6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.2, 0);
  controls.minDistance = 6;
  controls.maxDistance = 18;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.minPolarAngle = 0.35;
  controls.enablePan = false;

  const hemi = new THREE.HemisphereLight(0xffe6c8, 0x0b1a3a, 0.55);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd7a0, 1.35);
  key.position.set(6, 12, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 2;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 10;
  key.shadow.camera.bottom = -10;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x7ea6ff, 0.55);
  fill.position.set(-7, 6, -6);
  scene.add(fill);
  const rim = new THREE.PointLight(0xd4af37, 1.1, 18, 2);
  rim.position.set(0, 4.2, 0);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(16, 64),
    new THREE.MeshStandardMaterial({
      color: 0x0c1018,
      roughness: 0.92,
      metalness: 0.05,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.08;
  floor.receiveShadow = true;
  scene.add(floor);

  const dais = new THREE.Mesh(
    new THREE.CylinderGeometry(7.1, 7.4, 0.22, 64),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1e,
      roughness: 0.45,
      metalness: 0.35,
    })
  );
  dais.position.y = 0.02;
  dais.receiveShadow = true;
  scene.add(dais);

  const goldRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.85, 0.035, 12, 80),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
    })
  );
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.y = 0.14;
  scene.add(goldRing);

  const lightTex = makeMarbleTexture("#efe4cf", "#c9b896", "#8a7a5a");
  const darkTex = makeMarbleTexture("#2a211c", "#14100e", "#5a4636");

  const tiles = [];
  const tileGroup = new THREE.Group();
  scene.add(tileGroup);
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const light = (f + r) % 2 === 1;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(S * 0.98, 0.08, S * 0.98),
        new THREE.MeshStandardMaterial({
          map: light ? lightTex : darkTex,
          roughness: 0.42,
          metalness: 0.08,
        })
      );
      const c = squareCenter(f, r);
      mesh.position.set(c.x, 0.17, c.z);
      mesh.receiveShadow = true;
      mesh.userData = { kind: "tile", file: f, rank: r };
      tileGroup.add(mesh);
      tiles.push(mesh);
    }
  }

  const felt = (z, color) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(S * 8.2, 0.04, 0.55),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.05,
      })
    );
    m.position.set(0, 0.15, z);
    m.receiveShadow = true;
    scene.add(m);
  };
  felt(4.85, 0x8b1e2d);
  felt(-4.85, 0x163a7a);

  const fileLabels = new THREE.Group();
  scene.add(fileLabels);

  const overlay = new THREE.Group();
  scene.add(overlay);
  const selectMat = new THREE.MeshBasicMaterial({
    color: 0xf0c75e,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const moveMat = new THREE.MeshBasicMaterial({
    color: 0x6ee7b7,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const lastMat = new THREE.MeshBasicMaterial({
    color: 0xffb020,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  const captureMat = new THREE.MeshBasicMaterial({
    color: 0xff5a5a,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });

  const pieceRoot = new THREE.Group();
  scene.add(pieceRoot);

  const templates = {};
  const loader = new GLTFLoader();
  const loaders = [];
  ["w", "b"].forEach((color) => {
    ["k", "q", "r", "b", "n", "p"].forEach((type) => {
      const entry = window.Roster.entry(color, type);
      const key = color + type;
      loaders.push(
        new Promise((resolve) => {
          loader.load(
            entry.model,
            (gltf) => {
              const fitted = normalizeModel(
                gltf.scene,
                window.Roster.heightFor(type),
                false
              );
              templates[key] = { kind: "glb", object: fitted };
              resolve();
            },
            undefined,
            () => {
              templates[key] = { kind: "fallback" };
              resolve();
            }
          );
        })
      );
    });
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pickHandler = null;
  let anims = [];
  let ready = false;

  function spawnPiece(color, type) {
    const key = color + type;
    const t = templates[key];
    if (t && t.kind === "glb") return t.object.clone(true);
    return stauntonMesh(type, color);
  }

  function rebuildPieces(game) {
    while (pieceRoot.children.length) pieceRoot.remove(pieceRoot.children[0]);
    for (let i = 0; i < 64; i++) {
      const p = game.board[i];
      if (!p) continue;
      const f = Chess.fileOf(i);
      const r = Chess.rankOf(i);
      const mesh = spawnPiece(p.c, p.t);
      const c = squareCenter(f, r);
      mesh.position.set(c.x, 0.21, c.z);
      mesh.rotation.y = p.c === "w" ? Math.PI : 0;
      mesh.userData = { kind: "piece", square: i, color: p.c, type: p.t };
      pieceRoot.add(mesh);
    }
  }

  function clearOverlay() {
    while (overlay.children.length) overlay.remove(overlay.children[0]);
  }

  function addMarker(file, rank, mat, scale) {
    const m = new THREE.Mesh(new THREE.CircleGeometry((S * 0.42) * (scale || 1), 28), mat);
    m.rotation.x = -Math.PI / 2;
    const c = squareCenter(file, rank);
    m.position.set(c.x, 0.225, c.z);
    overlay.add(m);
  }

  function setHighlights(selected, legal, last) {
    clearOverlay();
    if (last) {
      addMarker(Chess.fileOf(last.from), Chess.rankOf(last.from), lastMat, 1);
      addMarker(Chess.fileOf(last.to), Chess.rankOf(last.to), lastMat, 1);
    }
    if (selected != null) {
      addMarker(Chess.fileOf(selected), Chess.rankOf(selected), selectMat, 1.05);
    }
    (legal || []).forEach((mv) => {
      const mat = mv.capturedHint ? captureMat : moveMat;
      addMarker(Chess.fileOf(mv.to), Chess.rankOf(mv.to), mat, mv.capturedHint ? 1 : 0.55);
    });
  }

  function animateMove(from, to, onDone) {
    const fromMesh = pieceRoot.children.find((c) => c.userData.square === from);
    if (!fromMesh) {
      if (onDone) onDone();
      return;
    }
    const dest = squareCenter(Chess.fileOf(to), Chess.rankOf(to));
    const start = fromMesh.position.clone();
    const hop = fromMesh.userData.type === "n";
    const dur = hop ? 0.38 : 0.28;
    anims.push({
      mesh: fromMesh,
      start,
      dest: new THREE.Vector3(dest.x, 0.21, dest.z),
      t: 0,
      dur,
      hop,
      onDone,
    });
    fromMesh.userData.square = to;
  }

  function onPointer(ev) {
    if (!pickHandler || anims.length) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(tileGroup.children, false);
    if (!hits.length) return;
    const ud = hits[0].object.userData;
    pickHandler(ud.file, ud.rank);
  }
  renderer.domElement.addEventListener("pointerdown", onPointer);

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  function tick(dt) {
    const left = [];
    anims.forEach((a) => {
      a.t += dt;
      const u = Math.min(1, a.t / a.dur);
      const e = ease(u);
      a.mesh.position.x = a.start.x + (a.dest.x - a.start.x) * e;
      a.mesh.position.z = a.start.z + (a.dest.z - a.start.z) * e;
      const hop = a.hop ? Math.sin(u * Math.PI) * 0.55 : 0;
      a.mesh.position.y = 0.21 + hop;
      if (u < 1) left.push(a);
      else if (a.onDone) a.onDone();
    });
    anims = left;
    controls.update();
    renderer.render(scene, camera);
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tick(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const readyPromise = Promise.all(loaders).then(() => {
    ready = true;
  });

  return {
    readyPromise,
    isReady: () => ready,
    rebuildPieces,
    setHighlights,
    animateMove,
    onPick: (fn) => {
      pickHandler = fn;
    },
    resize,
    busy: () => anims.length > 0,
    flipView: () => {
      const p = camera.position;
      camera.position.set(-p.x, p.y, -p.z);
      controls.update();
    },
  };
}
