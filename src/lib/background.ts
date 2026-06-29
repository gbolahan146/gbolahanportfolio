import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Flowing FBM-noise gradient. Dark base with sparse accent glow that drifts
// toward the cursor. Kept low-contrast so foreground text stays legible.
const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uIntensity;

  vec3 cBase   = vec3(0.027, 0.027, 0.039);
  vec3 cDeep   = vec3(0.07, 0.06, 0.14);
  vec3 cMid    = vec3(0.10, 0.16, 0.22);
  vec3 cAccent = vec3(0.78, 1.0, 0.30);

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    float t = uTime * 0.04;
    vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 4.3));
    float n = fbm(p * 1.8 + q * 1.4 + t * 0.6);

    vec3 col = mix(cBase, cDeep, smoothstep(-0.2, 0.5, n));
    col = mix(col, cMid, smoothstep(0.2, 0.9, n) * 0.5);

    // Accent glow drifting toward cursor
    vec2 m = vec2(uMouse.x * aspect, uMouse.y);
    float d = distance(p, m);
    float glow = smoothstep(0.7, 0.0, d) * (0.25 + 0.35 * n);
    col += cAccent * glow * 0.18 * uIntensity;

    // Faint top accent band
    float band = smoothstep(0.85, 1.0, uv.y) * 0.06 * uIntensity;
    col += cAccent * band * (0.5 + 0.5 * n);

    // Subtle vignette darkening at edges
    float vig = smoothstep(1.2, 0.2, distance(uv, vec2(0.5)));
    col *= 0.6 + 0.4 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface Background {
  destroy: () => void;
}

export function initBackground(canvas: HTMLCanvasElement): Background {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: "high-performance",
  });
  const dpr = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(dpr);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uIntensity: { value: reduceMotion ? 0.4 : 1.0 },
  };

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const targetMouse = new Vector2(0.5, 0.5);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }
  resize();

  function onPointer(e: PointerEvent) {
    targetMouse.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  }

  let visible = true;
  function onVisibility() {
    visible = document.visibilityState === "visible";
    if (visible && !reduceMotion) loop();
  }

  let rafId = 0;
  let last = performance.now();
  function loop() {
    cancelAnimationFrame(rafId);
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      uniforms.uTime.value += dt;
      // Ease mouse toward target
      uniforms.uMouse.value.lerp(targetMouse, 0.05);
      renderer.render(scene, camera);
      if (visible && !reduceMotion) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer);
  document.addEventListener("visibilitychange", onVisibility);

  if (reduceMotion) {
    // Render a single static frame.
    renderer.render(scene, camera);
  } else {
    loop();
  }

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
    },
  };
}
