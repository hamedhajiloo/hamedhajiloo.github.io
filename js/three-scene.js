/**
 * Three.js Interactive 3D Background Engine
 * Generates an ethereal 3D particle constellation & geometric grid
 * with responsive mouse parallax and scroll momentum.
 */

(function () {
  'use strict';

  // Ensure THREE is loaded
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. Skipping 3D background initialization.');
    return;
  }

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 80;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. 3D Particles Constellation
  const particleCount = window.innerWidth < 768 ? 200 : 450;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  const colorPrimary = new THREE.Color('#6366f1'); // Indigo
  const colorSecondary = new THREE.Color('#06b6d4'); // Cyan
  const colorAccent = new THREE.Color('#818cf8'); // Glow

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Spread in 3D volume
    positions[i3] = (Math.random() - 0.5) * 160;
    positions[i3 + 1] = (Math.random() - 0.5) * 160;
    positions[i3 + 2] = (Math.random() - 0.5) * 120;

    // Mixed gradient colors
    const mixedColor = Math.random() > 0.5 ? colorPrimary : colorSecondary;
    if (Math.random() > 0.8) mixedColor.lerp(colorAccent, 0.5);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    scales[i] = Math.random() * 2 + 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  // Particle Material
  const particleMaterial = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });

  const particleSystem = new THREE.Points(geometry, particleMaterial);
  scene.add(particleSystem);

  // 3. Floating 3D Geometric Nodes (.NET architecture motif)
  const groupNodes = new THREE.Group();
  scene.add(groupNodes);

  // Central Icosahedron wireframe
  const icoGeo = new THREE.IcosahedronGeometry(22, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const icosahedron = new THREE.Mesh(icoGeo, icoMat);
  icosahedron.position.set(25, 0, -20);
  groupNodes.add(icosahedron);

  // Inner floating core
  const coreGeo = new THREE.OctahedronGeometry(10, 0);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.set(25, 0, -20);
  groupNodes.add(coreMesh);

  // 4. Interactive Mouse & Scroll Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function onPointerMove(e) {
    mouseX = (e.clientX - windowHalfX) * 0.0008;
    mouseY = (e.clientY - windowHalfY) * 0.0008;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Scroll offset effect
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // 5. Resize Handler
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', onWindowResize);

  // 6. Animation Loop (Clock & Delta)
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Lerp mouse interaction
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Rotate particles slowly
    particleSystem.rotation.y = elapsedTime * 0.04 + targetX * 1.5;
    particleSystem.rotation.x = elapsedTime * 0.02 + targetY * 1.5;

    // Geometric nodes animation
    icosahedron.rotation.x += delta * 0.15;
    icosahedron.rotation.y += delta * 0.2;
    coreMesh.rotation.x -= delta * 0.25;
    coreMesh.rotation.y -= delta * 0.3;

    // Dynamic wave float
    icosahedron.position.y = Math.sin(elapsedTime * 0.8) * 3;
    coreMesh.position.y = Math.sin(elapsedTime * 0.8) * 3;

    // Scroll parallax translation
    camera.position.y = -scrollY * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
})();
