(function () {
  const canvas = document.getElementById("waterproofing-scene");

  if (!canvas || !window.THREE) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x071827, 9, 22);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(5.6, 4.6, 8.2);
  camera.lookAt(0, 0.15, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(new THREE.HemisphereLight(0xeafaff, 0x071827, 2.45));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.9);
  keyLight.position.set(4, 7, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const blueLight = new THREE.PointLight(0x00a6d6, 4.8, 15);
  blueLight.position.set(-4, 2.4, 3.2);
  scene.add(blueLight);

  const amberLight = new THREE.PointLight(0xf28c28, 2.6, 12);
  amberLight.position.set(3.8, 1.4, -2.2);
  scene.add(amberLight);

  const world = new THREE.Group();
  world.position.set(1.15, -0.45, 0);
  scene.add(world);

  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.45, 4.05, 34, 2, 22),
    new THREE.MeshStandardMaterial({
      color: 0xd7dde0,
      roughness: 0.82,
      metalness: 0.02
    })
  );

  slab.castShadow = true;
  slab.receiveShadow = true;
  world.add(slab);

  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(6.95, 0.09, 4.2),
    new THREE.MeshStandardMaterial({
      color: 0xf7fbfd,
      roughness: 0.7
    })
  );

  edge.position.y = -0.28;
  world.add(edge);

  const membrane = new THREE.Mesh(
    new THREE.BoxGeometry(6.25, 0.075, 3.55),
    new THREE.MeshPhysicalMaterial({
      color: 0x0799d3,
      transparent: true,
      opacity: 0.76,
      roughness: 0.18,
      metalness: 0.03,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18
    })
  );

  membrane.position.y = 0.28;
  membrane.scale.x = 0.05;
  membrane.castShadow = true;
  world.add(membrane);

  /*
    AFWATERPROOFING TEXT ON WATER
    This creates a transparent canvas texture and places it flat on the waterproofing layer.
  */
  const createWaterTextTexture = () => {
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 2048;
    textCanvas.height = 512;

    const ctx = textCanvas.getContext("2d");
    ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 180px Arial, Helvetica, sans-serif";

    // Soft glow behind the text
    ctx.shadowColor = "rgba(145, 239, 255, 0.95)";
    ctx.shadowBlur = 38;
    ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
    ctx.fillText("AFWATERPROOFING", textCanvas.width / 2, textCanvas.height / 2);

    // Blue stroke for waterproofing look
    ctx.shadowBlur = 0;
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(0, 166, 214, 0.95)";
    ctx.strokeText("AFWATERPROOFING", textCanvas.width / 2, textCanvas.height / 2);

    // Main white text again for clarity
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.fillText("AFWATERPROOFING", textCanvas.width / 2, textCanvas.height / 2);

    const texture = new THREE.CanvasTexture(textCanvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;

    return texture;
  };

  const waterTextTexture = createWaterTextTexture();

  const waterText = new THREE.Mesh(
    new THREE.PlaneGeometry(5.75, 1.05),
    new THREE.MeshBasicMaterial({
      map: waterTextTexture,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );

  waterText.rotation.x = -Math.PI / 2;
  waterText.position.set(0, 0.345, 0.05);
  waterText.renderOrder = 10;
  world.add(waterText);

  const crackPoints = [
    new THREE.Vector3(-2.95, 0.34, -1.08),
    new THREE.Vector3(-2.12, 0.36, -0.32),
    new THREE.Vector3(-1.2, 0.35, -0.62),
    new THREE.Vector3(-0.42, 0.36, 0.02),
    new THREE.Vector3(0.35, 0.35, -0.14),
    new THREE.Vector3(1.14, 0.36, 0.72),
    new THREE.Vector3(2.05, 0.35, 0.44),
    new THREE.Vector3(2.88, 0.36, 1.1)
  ];

  const crackGeometry = new THREE.BufferGeometry().setFromPoints(crackPoints);

  const crack = new THREE.Line(
    crackGeometry,
    new THREE.LineBasicMaterial({
      color: 0xf28c28,
      transparent: true,
      opacity: 0.9
    })
  );

  world.add(crack);

  const seal = new THREE.Line(
    crackGeometry.clone(),
    new THREE.LineBasicMaterial({
      color: 0x91efff,
      transparent: true,
      opacity: 0.72
    })
  );

  seal.position.y = 0.045;
  world.add(seal);

  const dropMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x79e6ff,
    transparent: true,
    opacity: 0.76,
    roughness: 0.06,
    metalness: 0,
    transmission: 0.3,
    thickness: 0.45
  });

  const drops = [];

  for (let i = 0; i < 34; i += 1) {
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 + Math.random() * 0.045, 16, 16),
      dropMaterial
    );

    drop.position.set(
      (Math.random() - 0.5) * 9.5,
      0.75 + Math.random() * 5.5,
      (Math.random() - 0.5) * 5.8
    );

    drop.userData.speed = 0.012 + Math.random() * 0.028;
    drop.userData.drift = Math.random() * Math.PI * 2;

    drops.push(drop);
    world.add(drop);
  }

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xb7f5ff,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide
  });

  const rings = [];

  for (let i = 0; i < 4; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.14, 0.17, 56),
      ringMaterial.clone()
    );

    ring.rotation.x = -Math.PI / 2;
    ring.position.set(-2.9 + i * 0.95, 0.38, -1.2 + Math.sin(i * 1.5) * 0.9);
    ring.userData.phase = i * 0.42;

    rings.push(ring);
    world.add(ring);
  }

  const grid = new THREE.GridHelper(10, 34, 0x176176, 0x0d2b3a);
  grid.position.y = -0.38;
  grid.material.transparent = true;
  grid.material.opacity = 0.24;
  world.add(grid);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();

    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;

    if (rect.width < 760) {
      camera.position.set(2.4, 5.2, 9.2);
      world.position.set(0, -0.9, 0);
      world.scale.setScalar(0.86);

      waterText.scale.setScalar(0.9);
    } else {
      camera.position.set(5.6, 4.6, 8.2);
      world.position.set(1.15, -0.45, 0);
      world.scale.setScalar(1);

      waterText.scale.setScalar(1);
    }

    camera.lookAt(0, 0.15, 0);
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", resize);
  resize();

  const clock = new THREE.Clock();
  let heroVisible = true;

  new IntersectionObserver((entries) => {
    heroVisible = entries.some((entry) => entry.isIntersecting);
  }, { rootMargin: "120px 0px" }).observe(canvas);

  const render = () => {
    if (!heroVisible) {
      requestAnimationFrame(render);
      return;
    }

    const elapsed = clock.getElapsedTime();

    const sweep = prefersReducedMotion
      ? 0.82
      : 0.08 + Math.abs(Math.sin(elapsed * 0.46)) * 0.92;

    world.rotation.y = (prefersReducedMotion ? 0.13 : Math.sin(elapsed * 0.28) * 0.2) - 0.08;
    world.rotation.x = -0.08 + (prefersReducedMotion ? 0 : Math.sin(elapsed * 0.22) * 0.025);

    membrane.scale.x = sweep;
    membrane.position.x = -3.04 + sweep * 3.04;

    // Keep the text slightly moving with the water scene
    waterText.position.y = 0.355 + Math.sin(elapsed * 1.4) * 0.006;
    waterText.material.opacity = prefersReducedMotion
      ? 0.9
      : 0.82 + Math.sin(elapsed * 1.8) * 0.08;

    crack.material.opacity = prefersReducedMotion
      ? 0.68
      : 0.48 + Math.sin(elapsed * 3.1) * 0.3;

    seal.material.opacity = prefersReducedMotion
      ? 0.5
      : 0.38 + Math.sin(elapsed * 2.3) * 0.3;

    blueLight.intensity = prefersReducedMotion
      ? 3.4
      : 3.4 + Math.sin(elapsed * 1.6) * 0.9;

    drops.forEach((drop, index) => {
      if (!prefersReducedMotion) {
        drop.position.y -= drop.userData.speed;
        drop.position.x += Math.sin(elapsed + drop.userData.drift) * 0.0018;
      }

      if (drop.position.y < 0.42) {
        drop.position.y = 3.1 + Math.random() * 3.4;
        drop.position.x = (Math.random() - 0.5) * 9.5;
        drop.position.z = (Math.random() - 0.5) * 5.8;
      }

      drop.scale.setScalar(1 + Math.sin(elapsed * 2 + index) * 0.12);
    });

    rings.forEach((ring) => {
      const pulse = prefersReducedMotion
        ? 0.35
        : ((elapsed + ring.userData.phase) % 2.2) / 2.2;

      ring.scale.setScalar(0.55 + pulse * 2.9);
      ring.material.opacity = 0.28 * (1 - pulse);
    });

    renderer.render(scene, camera);

    if (!prefersReducedMotion) {
      requestAnimationFrame(render);
    }
  };

  render();
}());