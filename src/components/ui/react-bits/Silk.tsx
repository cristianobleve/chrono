"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SilkProps {
  className?: string;
  color?: string;
  speed?: number;
  scale?: number;
  noiseIntensity?: number;
  rotation?: number;
  children?: React.ReactNode;
}

const STATIC_NOISE_DATA_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E";

export const Silk: React.FC<SilkProps> = ({
  className,
  color = "#71717a",
  speed = 0.65,
  scale = 1.0,
  noiseIntensity = 0.16,
  rotation = 0.48,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const hexToRgb = (hex: string): [number, number, number] => {
    let cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    const num = parseInt(cleanHex, 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255,
    ];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });

    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uColor;
      uniform float uSpeed;
      uniform float uScale;
      uniform float uRotation;

      vec2 rotate(vec2 uv, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c) * uv;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
        uv = rotate(uv, uRotation);

        float t = uTime * uSpeed * 0.4;
        vec2 p = uv * uScale * 2.2;

        float d1 = sin(p.x * 1.2 + t * 0.7) * 0.35;
        float d2 = cos(p.x * 0.6 - t * 0.5) * 0.25;
        float py = p.y + d1 + d2 + uMouse.y * 0.2;

        float wave1 = sin(py * 2.4 + t * 0.5);
        float wave2 = sin(py * 1.4 - p.x * 0.4 - t * 0.35) * 0.4;
        float wave = clamp((wave1 + wave2) * 0.5 + 0.5, 0.0, 1.0);

        float ridge = smoothstep(0.4, 0.95, wave);

        vec3 deepCanvas = vec3(0.035, 0.035, 0.04);
        vec3 midTone = vec3(0.12, 0.12, 0.14);
        vec3 highTone = vec3(0.24, 0.24, 0.27);
        vec3 highlight = vec3(0.42, 0.42, 0.45);

        vec3 finalColor = mix(deepCanvas, midTone, smoothstep(0.05, 0.65, wave));
        finalColor = mix(finalColor, highTone, smoothstep(0.45, 0.85, wave));
        finalColor += highlight * (ridge * ridge) * 0.28;

        vec2 screenUv = gl_FragCoord.xy / uResolution.xy;
        float vignette = 1.0 - length((screenUv - 0.5) * 1.1) * 0.3;
        finalColor *= clamp(vignette, 0.0, 1.0);

        gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uResolutionLocation = gl.getUniformLocation(program, "uResolution");
    const uTimeLocation = gl.getUniformLocation(program, "uTime");
    const uMouseLocation = gl.getUniformLocation(program, "uMouse");
    const uColorLocation = gl.getUniformLocation(program, "uColor");
    const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
    const uScaleLocation = gl.getUniformLocation(program, "uScale");
    const uRotationLocation = gl.getUniformLocation(program, "uRotation");

    const baseRgb = hexToRgb(color);

    let animationFrameId = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startTime = performance.now();
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 24; // Cap at 24 FPS

    // Internal render scale 0.38x: smooth waves upscale cleanly via GPU bilinear filter, cutting pixel count by ~96%
    const RENDER_SCALE = 0.38;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (width === 0 || height === 0) {
        isVisible = false;
        return;
      }

      isVisible = true;
      canvas.width = Math.max(1, Math.floor(width * RENDER_SCALE));
      canvas.height = Math.max(1, Math.floor(height * RENDER_SCALE));

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    let lastMouseTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMouseTime < 48 || !containerRef.current || !isVisible) return;
      lastMouseTime = now;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      mouseRef.current.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.targetY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const drawFrame = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(uTimeLocation, elapsed);
      gl.uniform2f(uMouseLocation, mouseRef.current.x, mouseRef.current.y);
      gl.uniform3f(uColorLocation, baseRgb[0], baseRgb[1], baseRgb[2]);
      gl.uniform1f(uSpeedLocation, speed);
      gl.uniform1f(uScaleLocation, scale);
      gl.uniform1f(uRotationLocation, rotation);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const render = (now: number) => {
      if (!isPageVisible || !isVisible) {
        animationFrameId = 0;
        return;
      }

      if (now - lastFrameTime >= FRAME_INTERVAL) {
        lastFrameTime = now;
        drawFrame(now);
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible && isVisible && !prefersReducedMotion && !animationFrameId) {
        lastFrameTime = 0;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Draw first frame immediately
    drawFrame(performance.now());
    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (program) gl.deleteProgram(program);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
    };
  }, [color, speed, scale, rotation]);

  const grainOpacity = Math.min(Math.max(noiseIntensity * 0.28, 0.02), 0.09);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden flex items-center justify-center bg-[#06070a] select-none",
        className
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("${STATIC_NOISE_DATA_URI}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          opacity: grainOpacity,
        }}
      />
      {children}
    </div>
  );
};
