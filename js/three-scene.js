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
      camera.position.set(3.2, 6.2, 15.2);
      world.position.set(0, -0.45, 0);
      world.scale.setScalar(0.56);

      waterText.scale.setScalar(0.72);
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

(function () {
  const canvas = document.getElementById("leak-path-scene");

  if (!canvas || !window.THREE) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x071827, 11, 28);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(5.2, 3.0, 8.6);
  camera.lookAt(0.1, 0.2, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(new THREE.HemisphereLight(0xdff8ff, 0x06131f, 2.1));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
  keyLight.position.set(3.8, 6.4, 5.8);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const workLight = new THREE.PointLight(0x00a6d6, 5.2, 14);
  workLight.position.set(-2.7, 2.2, 3.8);
  scene.add(workLight);

  const warmLight = new THREE.PointLight(0xf28c28, 2.2, 11);
  warmLight.position.set(2.6, -1.6, 3.6);
  scene.add(warmLight);

  const world = new THREE.Group();
  world.position.set(2.1, -0.25, 0);
  scene.add(world);

  const makeMat = (color, options = {}) => new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.74,
    metalness: options.metalness ?? 0.02,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1
  });

  const blueMat = makeMat(0x0799d3, { roughness: 0.22, transparent: true, opacity: 0.72 });
  const orangeMat = makeMat(0xf28c28, { roughness: 0.48 });
  const darkMat = makeMat(0x263645, { roughness: 0.66 });
  const skinMat = makeMat(0xd8a37b, { roughness: 0.56 });
  const toolMat = makeMat(0xe9f3f7, { roughness: 0.35, metalness: 0.12 });
  const shirtMat = makeMat(0x0877b9, { roughness: 0.52 });

  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(5.7, 4.6, 0.34, 28, 24, 2),
    makeMat(0xc8d0d3, { roughness: 0.9 })
  );
  wall.castShadow = true;
  wall.receiveShadow = true;
  world.add(wall);

  const wallTextCanvas = document.createElement("canvas");
  wallTextCanvas.width = 2048;
  wallTextCanvas.height = 384;

  const wallTextCtx = wallTextCanvas.getContext("2d");
  wallTextCtx.clearRect(0, 0, wallTextCanvas.width, wallTextCanvas.height);
  wallTextCtx.textAlign = "center";
  wallTextCtx.textBaseline = "middle";
  wallTextCtx.font = "900 190px Arial, Helvetica, sans-serif";
  wallTextCtx.shadowColor = "rgba(255, 255, 255, 0.75)";
  wallTextCtx.shadowBlur = 16;
  wallTextCtx.fillStyle = "rgba(8, 119, 185, 0.95)";
  wallTextCtx.fillText("AFWATERPROOFING", wallTextCanvas.width / 2, wallTextCanvas.height / 2);
  wallTextCtx.shadowBlur = 0;
  wallTextCtx.lineWidth = 8;
  wallTextCtx.strokeStyle = "rgba(145, 239, 255, 0.72)";
  wallTextCtx.strokeText("AFWATERPROOFING", wallTextCanvas.width / 2, wallTextCanvas.height / 2);

  const wallTextTexture = new THREE.CanvasTexture(wallTextCanvas);
  wallTextTexture.needsUpdate = true;

  const wallText = new THREE.Mesh(
    new THREE.PlaneGeometry(2.68, 0.52),
    new THREE.MeshBasicMaterial({
      map: wallTextTexture,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    })
  );
  wallText.position.set(0.9, 1.78, 0.235);
  wallText.renderOrder = 18;
  world.add(wallText);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 0.18, 3.8),
    makeMat(0x8b969c, { roughness: 0.86 })
  );
  floor.position.set(0, -2.4, 1.45);
  floor.receiveShadow = true;
  world.add(floor);

  const sideEdge = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 4.72, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0xecf3f6,
      roughness: 0.72
    })
  );
  sideEdge.position.x = -2.98;
  world.add(sideEdge);

  const crackCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.55, 2.0, 0.2),
    new THREE.Vector3(-1.12, 1.18, 0.23),
    new THREE.Vector3(-1.48, 0.42, 0.24),
    new THREE.Vector3(-0.86, -0.18, 0.24),
    new THREE.Vector3(-1.05, -0.92, 0.23),
    new THREE.Vector3(-0.48, -1.84, 0.22)
  ]);

  const crackTube = new THREE.Mesh(
    new THREE.TubeGeometry(crackCurve, 72, 0.028, 10, false),
    new THREE.MeshBasicMaterial({
      color: 0xf28c28,
      transparent: true,
      opacity: 0.86
    })
  );
  world.add(crackTube);

  const sealTube = new THREE.Mesh(
    new THREE.TubeGeometry(crackCurve, 72, 0.045, 12, false),
    new THREE.MeshBasicMaterial({
      color: 0x91efff,
      transparent: true,
      opacity: 0.28
    })
  );
  sealTube.position.z = 0.035;
  world.add(sealTube);

  const leakStain = new THREE.Mesh(
    new THREE.CircleGeometry(0.9, 48),
    new THREE.MeshBasicMaterial({
      color: 0x66dfff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  leakStain.position.set(-0.95, 0.12, 0.205);
  leakStain.scale.set(0.86, 1.42, 1);
  world.add(leakStain);

  const patch = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 1.95, 0.05),
    new THREE.MeshPhysicalMaterial({
      color: 0x0799d3,
      transparent: true,
      opacity: 0.68,
      roughness: 0.16,
      metalness: 0.02,
      clearcoat: 0.82,
      clearcoatRoughness: 0.16
    })
  );
  patch.position.set(-0.98, -0.92, 0.28);
  patch.scale.y = 0.08;
  world.add(patch);

  const createLimb = (start, end, radius, material) => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 16), material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    return mesh;
  };

  const worker = new THREE.Group();
  worker.position.set(-2.05, -1.18, 0.72);
  worker.rotation.y = -0.18;
  world.add(worker);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.02, 0.34), shirtMat);
  body.position.y = 0.88;
  body.castShadow = true;
  worker.add(body);

  const shirtCanvas = document.createElement("canvas");
  shirtCanvas.width = 1024;
  shirtCanvas.height = 256;

  const shirtCtx = shirtCanvas.getContext("2d");
  shirtCtx.clearRect(0, 0, shirtCanvas.width, shirtCanvas.height);
  shirtCtx.textAlign = "center";
  shirtCtx.textBaseline = "middle";
  shirtCtx.font = "900 124px Arial, Helvetica, sans-serif";
  shirtCtx.shadowColor = "rgba(0, 166, 214, 0.9)";
  shirtCtx.shadowBlur = 18;
  shirtCtx.fillStyle = "rgba(255, 255, 255, 0.98)";
  shirtCtx.fillText("AFWATERPROOFING", shirtCanvas.width / 2, shirtCanvas.height / 2);

  const shirtTexture = new THREE.CanvasTexture(shirtCanvas);
  shirtTexture.needsUpdate = true;

  const shirtLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.68, 0.24),
    new THREE.MeshBasicMaterial({
      map: shirtTexture,
      transparent: true,
      depthWrite: false
    })
  );
  shirtLabel.position.set(0, 0.94, 0.176);
  shirtLabel.renderOrder = 12;
  worker.add(shirtLabel);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 18), skinMat);
  head.position.y = 1.62;
  head.castShadow = true;
  worker.add(head);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), orangeMat);
  helmet.position.y = 1.75;
  helmet.castShadow = true;
  worker.add(helmet);

  const helmetBrim = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.045, 0.2), orangeMat);
  helmetBrim.position.set(0, 1.63, 0.18);
  helmetBrim.castShadow = true;
  worker.add(helmetBrim);

  worker.add(createLimb(new THREE.Vector3(-0.2, 0.36, 0), new THREE.Vector3(-0.34, -0.46, 0.04), 0.09, darkMat));
  worker.add(createLimb(new THREE.Vector3(0.2, 0.36, 0), new THREE.Vector3(0.36, -0.46, 0.02), 0.09, darkMat));
  worker.add(createLimb(new THREE.Vector3(-0.32, 0.98, 0), new THREE.Vector3(-0.72, 0.38, 0.08), 0.07, skinMat));

  const workingArm = new THREE.Group();
  workingArm.position.set(0.32, 1.18, 0.02);
  worker.add(workingArm);

  const upperArm = createLimb(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.52, 0.08, -0.22), 0.07, skinMat);
  const forearm = createLimb(new THREE.Vector3(0.48, 0.08, -0.22), new THREE.Vector3(0.98, -0.12, -0.4), 0.06, skinMat);
  workingArm.add(upperArm);
  workingArm.add(forearm);

  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), skinMat);
  hand.position.set(1.04, -0.14, -0.42);
  workingArm.add(hand);

  const injectionNeedle = new THREE.Group();
  injectionNeedle.position.set(1.17, -0.16, -0.46);
  injectionNeedle.rotation.z = -0.42;
  workingArm.add(injectionNeedle);

  const syringeBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.44, 18),
    toolMat
  );
  syringeBody.rotation.z = Math.PI / 2;
  syringeBody.castShadow = true;
  injectionNeedle.add(syringeBody);

  const syringeFluid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.034, 0.32, 16),
    blueMat
  );
  syringeFluid.rotation.z = Math.PI / 2;
  syringeFluid.position.x = 0.02;
  injectionNeedle.add(syringeFluid);

  const plunger = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.18), darkMat);
  plunger.position.x = -0.27;
  plunger.castShadow = true;
  injectionNeedle.add(plunger);

  const needle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.46, 12),
    toolMat
  );
  needle.rotation.z = Math.PI / 2;
  needle.position.x = 0.42;
  needle.castShadow = true;
  injectionNeedle.add(needle);

  const needleTip = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.08, 12), toolMat);
  needleTip.rotation.z = -Math.PI / 2;
  needleTip.position.x = 0.68;
  needleTip.castShadow = true;
  injectionNeedle.add(needleTip);

  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.2, 0.42, 28),
    blueMat
  );
  bucket.position.set(-1.08, -0.95, 0.42);
  bucket.castShadow = true;
  worker.add(bucket);

  const dripMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7fe8ff,
    transparent: true,
    opacity: 0.82,
    roughness: 0.04,
    transmission: 0.35,
    thickness: 0.35
  });

  const drips = [];
  for (let i = 0; i < 20; i += 1) {
    const drip = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 + Math.random() * 0.035, 14, 14),
      dripMaterial
    );
    drip.userData.offset = Math.random();
    drip.userData.speed = 0.055 + Math.random() * 0.05;
    drip.userData.side = (Math.random() - 0.5) * 0.18;
    drips.push(drip);
    world.add(drip);
  }

  const rain = [];
  for (let i = 0; i < 42; i += 1) {
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(0.018 + Math.random() * 0.025, 10, 10),
      dripMaterial
    );
    drop.position.set(-1.25 + Math.random() * 0.7, -1.9 + Math.random() * 3.6, 0.34);
    drop.userData.speed = 0.018 + Math.random() * 0.03;
    rain.push(drop);
    world.add(drop);
  }

  const grid = new THREE.GridHelper(8, 24, 0x176176, 0x0d2b3a);
  grid.position.set(0, -2.49, 1.46);
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  world.add(grid);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;

    if (rect.width < 760) {
      camera.position.set(2.0, 2.9, 9.5);
      world.position.set(0.72, -0.38, 0);
      world.scale.setScalar(0.82);
    } else {
      camera.position.set(5.2, 3.0, 8.6);
      world.position.set(2.1, -0.25, 0);
      world.scale.setScalar(1);
    }

    camera.lookAt(0.35, 0.15, 0);
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", resize);
  resize();

  const clock = new THREE.Clock();
  let sectionVisible = true;

  new IntersectionObserver((entries) => {
    sectionVisible = entries.some((entry) => entry.isIntersecting);
  }, { rootMargin: "120px 0px" }).observe(canvas);

  const render = () => {
    if (!sectionVisible) {
      requestAnimationFrame(render);
      return;
    }

    const elapsed = clock.getElapsedTime();
    const sweep = prefersReducedMotion
      ? 0.92
      : 0.08 + Math.abs(Math.sin(elapsed * 0.38)) * 0.92;

    world.rotation.y = prefersReducedMotion ? -0.16 : -0.16 + Math.sin(elapsed * 0.22) * 0.13;
    world.rotation.x = prefersReducedMotion ? 0.02 : Math.sin(elapsed * 0.18) * 0.035;

    patch.scale.y = sweep;
    patch.position.y = -0.92 + sweep * 0.86;
    patch.material.opacity = prefersReducedMotion ? 0.68 : 0.46 + sweep * 0.28;
    leakStain.material.opacity = prefersReducedMotion ? 0.12 : 0.22 * (1 - sweep);
    workingArm.rotation.z = prefersReducedMotion ? -0.12 : -0.2 + Math.sin(elapsed * 3.0) * 0.18;
    workingArm.rotation.y = prefersReducedMotion ? -0.16 : -0.16 + Math.sin(elapsed * 2.1) * 0.1;

    crackTube.material.opacity = prefersReducedMotion
      ? 0.52
      : 0.42 + Math.sin(elapsed * 2.5) * 0.22;
    sealTube.material.opacity = prefersReducedMotion
      ? 0.38
      : 0.24 + sweep * 0.36;

    drips.forEach((drip, index) => {
      const t = prefersReducedMotion
        ? drip.userData.offset
        : (drip.userData.offset + elapsed * drip.userData.speed) % 1;
      const point = crackCurve.getPointAt(t);
      drip.position.set(
        point.x + drip.userData.side,
        point.y - t * 0.18,
        point.z + 0.1
      );
      drip.scale.setScalar(1 + Math.sin(elapsed * 2.2 + index) * 0.18);
      drip.material.opacity = t < sweep ? 0.12 : 0.76;
    });

    rain.forEach((drop) => {
      if (!prefersReducedMotion) {
        drop.position.y -= drop.userData.speed;
        drop.position.x += Math.sin(elapsed + drop.position.z) * 0.001;
      }

      if (drop.position.y < -2.45) {
        drop.position.y = 1.7 + Math.random() * 1.4;
        drop.position.x = -1.25 + Math.random() * 0.7;
      }
    });

    workLight.intensity = prefersReducedMotion
      ? 3.5
      : 3.5 + Math.sin(elapsed * 1.6) * 0.8;

    renderer.render(scene, camera);

    if (!prefersReducedMotion) {
      requestAnimationFrame(render);
    }
  };

  render();
}());
