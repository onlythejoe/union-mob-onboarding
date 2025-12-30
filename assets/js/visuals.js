(function (global) {
  function createVisualManager({
    body,
    eaSplash,
    eaLogo,
    unionLabBackground,
    unionLabCanvas,
    appOnboarding,
    onSplashFinish
  }) {
    let unionLabInitialized = false;
    let visualTimer = null;
    let splashFallbackTimer = null;

    const showUnionLabBackground = () => {
      unionLabBackground?.classList.add("active");
      unionLabBackground?.classList.remove("hidden");
    };

    const showOnboarding = () => {
      appOnboarding?.classList.remove("hidden");
      body?.classList.remove("splash-active");
    };

    const finishEASplash = () => {
      if (!eaSplash) return;

      eaSplash.classList.add("hidden");
      eaSplash.classList.remove("active");
      if (visualTimer) {
        clearTimeout(visualTimer);
        visualTimer = null;
      }
      if (splashFallbackTimer) {
        clearTimeout(splashFallbackTimer);
        splashFallbackTimer = null;
      }
      eaLogo?.classList.remove("animate-in", "animate-out");
      showUnionLabBackground();
      showOnboarding();
      if (typeof onSplashFinish === "function") {
        onSplashFinish();
      }
    };

    const startSplashSequence = () => {
      if (!eaSplash) return;

      if (visualTimer) {
        clearTimeout(visualTimer);
      }
      if (splashFallbackTimer) {
        clearTimeout(splashFallbackTimer);
      }

      eaSplash.classList.add("active");
      eaSplash.classList.remove("hidden");
      body?.classList.add("splash-active");

      requestAnimationFrame(() => {
        eaLogo?.classList.add("animate-in");
      });

      const firstDelay = 900;
      const secondDelay = 1800;

      window.setTimeout(() => {
        eaLogo?.classList.remove("animate-in");
        eaLogo?.classList.add("animate-out");
      }, firstDelay);

      visualTimer = window.setTimeout(() => {
        finishEASplash();
      }, secondDelay);

      splashFallbackTimer = window.setTimeout(() => {
        finishEASplash();
      }, 5200);
    };

    async function initUnionLabAnimation() {
      if (!unionLabCanvas || unionLabInitialized) return;

      try {
        const THREE = await import("https://unpkg.com/three@0.164.1/build/three.module.js");
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const frustumSize = 3.2;
        const getAspect = () => {
          const rect = unionLabCanvas.getBoundingClientRect();
          return Math.max(rect.width, 1) / Math.max(rect.height, 1);
        };

        const aspect = getAspect();
        const camera = new THREE.OrthographicCamera(
          -frustumSize * aspect / 2,
          frustumSize * aspect / 2,
           frustumSize / 2,
          -frustumSize / 2,
           0.1,
           100
        );
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        const setRendererSize = () => {
          const rect = unionLabCanvas.getBoundingClientRect();
          const width = Math.max(rect.width, 1);
          const height = Math.max(rect.height, 1);
          const newAspect = width / height;
          camera.left = -frustumSize * newAspect / 2;
          camera.right = frustumSize * newAspect / 2;
          camera.top = frustumSize / 2;
          camera.bottom = -frustumSize / 2;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        setRendererSize();
        unionLabCanvas.appendChild(renderer.domElement);

        const createArrowMesh = (size = 0.02) => {
          const shape = new THREE.Shape();
          shape.moveTo(0, size * 1.4);
          shape.lineTo(-size * 0.45, 0);
          shape.lineTo(size * 0.45, 0);
          shape.closePath();

          const geo = new THREE.ShapeGeometry(shape);
          const mat = new THREE.MeshBasicMaterial({ color: 0x7c3aed });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.z = 0.006;
          return mesh;
        };

        const createCompassTexture = (size = 512) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = size;
          const ctx = canvas.getContext("2d");

          const r = size * 0.38;
          const cx = size / 2;
          const cy = size / 2;
          ctx.translate(cx, cy);

          const stroke = "rgba(255,255,255,0.9)";
          const muted = "rgba(255,255,255,0.35)";
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.lineWidth = r * 0.04;
          ctx.strokeStyle = stroke;
          ctx.stroke();

          for (let deg = 0; deg < 360; deg += 15) {
            const major = deg % 90 === 0;
            const a = deg * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(
              Math.sin(a) * (r - (major ? r * 0.35 : r * 0.15)),
              -Math.cos(a) * (r - (major ? r * 0.35 : r * 0.15))
            );
            ctx.lineTo(
              Math.sin(a) * r,
              -Math.cos(a) * r
            );
            ctx.lineWidth = major ? r * 0.06 : r * 0.03;
            ctx.strokeStyle = major ? stroke : muted;
            ctx.stroke();
          }

          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          return texture;
        };

        const compassTexture = createCompassTexture(512);
        const compassMaterial = new THREE.MeshBasicMaterial({
          map: compassTexture,
          transparent: true
        });

        const compassPlanes = [];
        const R = 1.25;
        const latSteps = 9;
        const lonSteps = 18;
        const POLE_CUTOFF = 0.18;
        const R_INNER = 0.96;

        for (let i = 0; i < latSteps; i += 1) {
          if (i === 0 || i === latSteps - 1) {
            const plane = new THREE.Mesh(
              new THREE.PlaneGeometry(0.34, 0.34),
              compassMaterial
            );
            plane.position.set(0, (i === 0 ? 1 : -1) * R * R_INNER, 0);
            plane.lookAt(0, 0, 0);
            plane.rotateY(Math.PI);
            const arrow = createArrowMesh();
            plane.add(arrow);
            plane.userData.arrow = arrow;
            scene.add(plane);
            compassPlanes.push(plane);
            continue;
          }

          const phi = Math.PI * i / (latSteps - 1);
          const t = Math.abs(Math.cos(phi));
          if (t > 1 - POLE_CUTOFF) continue;

          for (let j = 0; j < lonSteps; j += 1) {
            const theta = 2 * Math.PI * j / lonSteps;
            const x = R * R_INNER * Math.sin(phi) * Math.cos(theta);
            const y = R * R_INNER * Math.cos(phi);
            const z = R * R_INNER * Math.sin(phi) * Math.sin(theta);

            const plane = new THREE.Mesh(
              new THREE.PlaneGeometry(0.34, 0.34),
              compassMaterial
            );
            plane.position.set(x, y, z);
            plane.lookAt(0, 0, 0);
            plane.rotateY(Math.PI);

            const arrow = createArrowMesh();
            plane.add(arrow);
            plane.userData.arrow = arrow;
            scene.add(plane);
            compassPlanes.push(plane);
          }
        }

        const renderOnce = () => renderer.render(scene, camera);
        renderOnce();

        const handleMouseMove = (event) => {
          const rect = renderer.domElement.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          compassPlanes.forEach((plane) => {
            const pos = plane.position.clone();
            pos.project(camera);
            const cx = (pos.x * 0.5 + 0.5) * rect.width;
            const cy = (-pos.y * 0.5 + 0.5) * rect.height;
            const dx = mouseX - cx;
            const dy = mouseY - cy;
            plane.userData.arrow.rotation.z = Math.atan2(dx, -dy);
          });
          renderOnce();
        };

        const onResize = () => {
          setRendererSize();
          renderOnce();
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", onResize);

        unionLabInitialized = true;
      } catch (error) {
        console.error("Union Lab animation failed to initialize:", error);
      }
    }

    return {
      initUnionLabAnimation,
      startSplashSequence
    };
  }

  global.setupVisualManager = createVisualManager;
})(typeof window !== "undefined" ? window : this);
