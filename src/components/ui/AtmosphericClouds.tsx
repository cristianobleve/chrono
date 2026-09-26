"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface AtmosphericCloudsProps {
  className?: string;
  speed?: number;
  cloudCount?: number;
}

const VERT_SHADER = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SHADER = `
precision mediump float;

varying vec2 v_uv;

uniform vec2 u_res;
uniform float u_time;
uniform float u_count;
uniform vec2 u_mouse;

const mat2 R = mat2(0.80, 0.60, -0.60, 0.80);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(41.31, 289.17))) * 26737.367);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * vnoise(p);
    p = R * p * 2.03 + 19.19;
    amp *= 0.5;
  }
  return sum;
}

// Billow noise creates puffy, volumetric cauliflower ridges
float billow(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * (1.0 - abs(2.0 * vnoise(p) - 1.0));
    p = R * p * 2.11 + 13.37;
    amp *= 0.5;
  }
  return sum;
}

// Density calculation for an individual cloud mass
float cloudDensity(vec2 p, vec2 c, vec2 r, float seed, float t) {
  vec2 q = p - c;
  float ry = q.y > 0.0 ? r.y : r.y * 0.45;
  float env = 1.0 - length(vec2(q.x / r.x, q.y / ry));
  if (env < -0.30) return 0.0;

  vec2 dp = q * (2.2 / r.x) + seed;
  dp += 0.55 * vec2(
    fbm(dp * 1.3 + t * 0.035),
    fbm(dp * 1.3 + 7.7 - t * 0.025)
  );
  float detail = billow(dp * 1.5);
  return env + (detail - 0.60) * 0.60;
}

// Render a single cloud with self-shadowing and silver rim illumination
vec3 shadeCloud(vec3 color, vec3 sky, vec2 p, vec2 c, vec2 r, float seed, float t, float dist) {
  float d = cloudDensity(p, c, r, seed, t);
  if (d < 0.02) return color;

  // Upward density sample creates realistic top-down moonlight shadowing
  float dUp = cloudDensity(p + vec2(0.0, r.y * 0.50), c, r, seed, t);
  float occl = clamp((dUp - d) * 1.1 + d * 0.50, 0.0, 1.0);

  // Deep neutral monochrome tones: dark charcoal with silver highlights
  vec3 lit = vec3(0.32, 0.35, 0.40);
  vec3 shadow = vec3(0.08, 0.09, 0.12);
  vec3 cloudCol = mix(lit, shadow, occl * 0.85);

  float alpha = smoothstep(0.02, 0.35, d);

  // Subtle silver rim highlight along cloud edges
  float rim = smoothstep(0.02, 0.12, d) * (1.0 - smoothstep(0.12, 0.36, d));
  cloudCol += vec3(0.25, 0.28, 0.35) * rim * 0.45;

  // Atmospheric perspective blending
  cloudCol = mix(cloudCol, sky, dist * 0.30);
  alpha *= mix(1.0, 0.75, dist);

  return mix(color, cloudCol, alpha);
}

vec3 cloudPass(vec3 color, vec3 sky, vec2 p, float aspect, float t,
               float spd, float phase, float y, vec2 r, float seed, float dist) {
  float cx = mix(-r.x - 0.25, aspect + r.x + 0.25, fract(t * spd + phase));
  float cy = y + sin(t * 0.04 + phase * 6.2831) * 0.015;
  return shadeCloud(color, sky, p, vec2(cx, cy), r, seed, t, dist);
}

void main() {
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(v_uv.x * aspect, v_uv.y);
  float t = u_time;

  // Deep night sky gradient: pure obsidian to dark slate charcoal
  vec3 skyTop = vec3(0.025, 0.030, 0.038);
  vec3 skyBottom = vec3(0.055, 0.065, 0.080);
  vec3 sky = mix(skyBottom, skyTop, v_uv.y);
  vec3 color = sky;

  // Subtle high-altitude cirrus streaks
  float cirrusBand = smoothstep(0.50, 0.85, v_uv.y) * (1.0 - smoothstep(0.85, 1.0, v_uv.y));
  if (cirrusBand > 0.01) {
    float streak = fbm(vec2(p.x * 1.5 - t * 0.005, p.y * 10.0));
    float wisp = smoothstep(0.50, 0.76, streak) * cirrusBand;
    color = mix(color, vec3(0.20, 0.22, 0.26), wisp * 0.30);
  }

  // Soft cool moonlight bloom in top-center
  vec2 moonPos = vec2(aspect * 0.50, 0.95);
  float moonDist = length(p - moonPos);
  color += vec3(0.18, 0.22, 0.28) * exp(-moonDist * moonDist * 3.5) * 0.35;

  // Layer 1: High distance clouds
  if (u_count > 3.5) {
    color = cloudPass(color, sky, p, aspect, t, 0.006, 0.15, 0.78, vec2(0.24, 0.11), 43.7, 0.90);
    color = cloudPass(color, sky, p, aspect, t, 0.008, 0.65, 0.68, vec2(0.28, 0.13), 71.3, 0.75);
  }

  // Layer 2: Mid-altitude volumetric masses
  if (u_count > 2.5) {
    color = cloudPass(color, sky, p, aspect, t, 0.011, 0.35, 0.52, vec2(0.38, 0.17), 17.3, 0.50);
  }
  if (u_count > 1.5) {
    color = cloudPass(color, sky, p, aspect, t, 0.013, 0.82, 0.40, vec2(0.44, 0.19), 29.9, 0.35);
  }

  // Layer 3: Foreground rolling clouds
  color = cloudPass(color, sky, p, aspect, t, 0.016, 0.08, 0.28, vec2(0.54, 0.23), 91.1, 0.15);
  color = cloudPass(color, sky, p, aspect, t, 0.019, 0.50, 0.14, vec2(0.64, 0.27), 57.2, 0.0);

  // Radial darkening in the center to maintain pristine text legibility
  vec2 centerUv = v_uv - vec2(0.5, 0.5);
  float centerDist = length(centerUv);
  float centerFade = smoothstep(0.10, 0.65, centerDist);
  color = mix(color * 0.65, color, centerFade);

  gl_FragColor = vec4(color, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export const AtmosphericClouds: React.FC<AtmosphericCloudsProps> = ({
  className,
  speed = 0.8,
  cloudCount = 5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Use low-power context to protect CPU and GPU
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });

    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.bindAttribLocation(program, 0, "a_pos");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const loc = {
      res: gl.getUniformLocation(program, "u_res"),
      time: gl.getUniformLocation(program, "u_time"),
      count: gl.getUniformLocation(program, "u_count"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
    };

    let animationFrameId: number;
    let isVisible = true;
    let lastRenderTime = 0;
    const TARGET_FPS = 30; // 30 FPS ensures silky drift without GPU heat
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    // Internal downscaling: clouds are soft and diffuse, 0.45x downscaling
    // reduces shader fragment evaluations by ~80% while retaining full visual beauty
    const resize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      const scale = 0.45;
      const w = Math.max(120, Math.floor(width * scale));
      const h = Math.max(80, Math.floor(height * scale));

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(loc.res, w, h);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // IntersectionObserver halts animation when scrolled out of viewport
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const startTime = performance.now();
    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const elapsedSinceLast = currentTime - lastRenderTime;
      if (elapsedSinceLast < FRAME_INTERVAL) return;
      lastRenderTime = currentTime - (elapsedSinceLast % FRAME_INTERVAL);

      const elapsed = ((currentTime - startTime) / 1000) * speed;
      gl.uniform1f(loc.time, elapsed);
      gl.uniform1f(loc.count, cloudCount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [speed, cloudCount]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover filter blur-[1px]"
      />
      {/* Noise and Vignette overlay for photographic grain and depth */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090a0f]/40 to-[#08090c]/90 pointer-events-none"
      />
    </div>
  );
};
