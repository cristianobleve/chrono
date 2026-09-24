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
      antialias: true,
      powerPreference: "high-performance",
    });

    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uColor;
      uniform float uSpeed;
      uniform float uScale;
      uniform float uNoise;
      uniform float uRotation;
      varying vec2 vUv;

      // Pseudo-random hash for fine silk grain
      float hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      vec2 rotate(vec2 uv, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c) * uv;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
        uv = rotate(uv, uRotation);

        float t = uTime * uSpeed * 0.4;

        // Smooth harmonic draped silk
        vec2 p = uv * uScale * 2.2;

        // Fluid flowing waves
        float d1 = sin(p.x * 1.2 + t * 0.7) * 0.35;
        float d2 = cos(p.x * 0.6 - t * 0.5) * 0.25;
        float py = p.y + d1 + d2 + uMouse.y * 0.2;

        float wave1 = sin(py * 2.4 + t * 0.5);
        float wave2 = sin(py * 1.4 - p.x * 0.4 - t * 0.35) * 0.4;
        float wave = (wave1 + wave2) * 0.5 + 0.5;
        wave = clamp(wave, 0.0, 1.0);

        // Gentle specular crest
        float ridge = smoothstep(0.4, 0.95, wave);

        // Monochromatic Obsidian to Charcoal to Soft Silver Sheen
        vec3 deepCanvas = vec3(0.035, 0.035, 0.04); // Deep obsidian canvas (#09090b)
        vec3 midTone = vec3(0.12, 0.12, 0.14);     // Deep charcoal zinc
        vec3 highTone = vec3(0.24, 0.24, 0.27);    // Muted silver/zinc sheen
        vec3 highlight = vec3(0.42, 0.42, 0.45);   // Soft crest light

        vec3 finalColor = mix(deepCanvas, midTone, smoothstep(0.05, 0.65, wave));
        finalColor = mix(finalColor, highTone, smoothstep(0.45, 0.85, wave));
        finalColor += highlight * pow(ridge, 2.5) * 0.28;

        // Subtle film grain
        float grain = (hash(gl_FragCoord.xy + fract(uTime * 3.0)) - 0.5) * uNoise * 0.5;
        finalColor += grain;

        // Soft smooth vignette
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
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
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
      console.error("Program link error:", gl.getProgramInfoLog(program));
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
    const uNoiseLocation = gl.getUniformLocation(program, "uNoise");
    const uRotationLocation = gl.getUniformLocation(program, "uRotation");

    const baseRgb = hexToRgb(color);

    let animationFrameId: number;
    let startTime = performance.now();

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.targetY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = (now: number) => {
      if (!containerRef.current) return;

      const elapsed = (now - startTime) * 0.001;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(uTimeLocation, elapsed);
      gl.uniform2f(uMouseLocation, mouseRef.current.x, mouseRef.current.y);
      gl.uniform3f(uColorLocation, baseRgb[0], baseRgb[1], baseRgb[2]);
      gl.uniform1f(uSpeedLocation, speed);
      gl.uniform1f(uScaleLocation, scale);
      gl.uniform1f(uNoiseLocation, noiseIntensity);
      gl.uniform1f(uRotationLocation, rotation);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (program) gl.deleteProgram(program);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
    };
  }, [color, speed, scale, noiseIntensity, rotation]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden flex items-center justify-center bg-[#06070a] select-none",
        className
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {children}
    </div>
  );
};
