// Full-screen shader background drawn with plain WebGL (no Three.js): a
// single triangle covering the viewport and one fragment shader.

const vertexShader = /* glsl */ `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

// Flowing FBM-noise gradient. Dark base with sparse accent glow that drifts
// toward the cursor. Kept low-contrast so foreground text stays legible.
const fragmentShader = /* glsl */ `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uIntensity;

  const vec3 cBase   = vec3(0.027, 0.027, 0.039);
  const vec3 cDeep   = vec3(0.07, 0.06, 0.14);
  const vec3 cMid    = vec3(0.10, 0.16, 0.22);
  const vec3 cAccent = vec3(0.78, 1.0, 0.30);

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

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Returns null when WebGL is unavailable; the CSS background shows instead.
export function initBackground(canvas: HTMLCanvasElement): Background | null {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const gl = canvas.getContext("webgl", {
    antialias: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, vertexShader);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // One oversized triangle covers the whole clip space.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "uTime");
  const uResolution = gl.getUniformLocation(program, "uResolution");
  const uMouse = gl.getUniformLocation(program, "uMouse");
  gl.uniform1f(gl.getUniformLocation(program, "uIntensity"), reduceMotion ? 0.4 : 1.0);

  const dpr = Math.min(window.devicePixelRatio, 1.5);
  let time = 0;
  const mouse = { x: 0.5, y: 0.5 };
  const targetMouse = { x: 0.5, y: 0.5 };

  function render() {
    gl!.uniform1f(uTime, time);
    gl!.uniform2f(uMouse, mouse.x, mouse.y);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform2f(uResolution, w, h);
    if (reduceMotion) render();
  }
  resize();

  function onPointer(e: PointerEvent) {
    targetMouse.x = e.clientX / window.innerWidth;
    targetMouse.y = 1 - e.clientY / window.innerHeight;
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
    last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      // Ease mouse toward target
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;
      render();
      if (visible && !reduceMotion) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer);
  document.addEventListener("visibilitychange", onVisibility);

  if (!reduceMotion) loop();

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
