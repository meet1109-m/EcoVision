import React, { useEffect, useRef, useState } from 'react';

export const GlobeVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 520;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    let animationFrameId: number;
    let rotation = 1.4; // Initial rotation angle (radians)

    // Try WebGL2 or WebGL with NPOT support
    const gl = (canvas.getContext('webgl2', { antialias: true, alpha: true }) ||
                canvas.getContext('webgl', { antialias: true, alpha: true })) as WebGLRenderingContext | null;

    if (gl) {
      // WebGL Vertex Shader
      const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
          v_uv = (a_position + 1.0) * 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      // WebGL Fragment Shader for 3D photorealistic Earth with realistic continents, oceans, sunlight, and cyan atmosphere
      const fsSource = `
        precision highp float;
        varying vec2 v_uv;
        uniform sampler2D u_texture;
        uniform float u_rotation;
        uniform float u_time;

        const float PI = 3.14159265359;
        const float TILT = 0.40909; // 23.44 degrees in radians

        void main() {
          // Centered coordinates [-1, 1] relative to sphere radius 0.74
          vec2 p = (v_uv - 0.5) * 2.0;
          float sphereRadius = 0.75;
          float r = length(p) / sphereRadius;

          // Outer Rayleigh Atmospheric Glow
          if (r > 1.0) {
            float halo = exp(- (r - 1.0) * 8.5) * 0.65;
            float pulse = 0.96 + 0.04 * sin(u_time * 2.2);
            vec3 atmosColor = vec3(0.04, 0.60, 0.98) * halo * pulse;
            gl_FragColor = vec4(atmosColor, halo * 0.85);
            return;
          }

          // 3D Sphere Surface Normal
          float z = sqrt(max(0.0, 1.0 - r * r));
          vec3 N = vec3(p.x / sphereRadius, p.y / sphereRadius, z);

          // Apply Axial Tilt (around X axis)
          float cosT = cos(TILT);
          float sinT = sin(TILT);
          vec3 tiltedN = vec3(
            N.x,
            N.y * cosT - N.z * sinT,
            N.y * sinT + N.z * cosT
          );

          // Apply Earth Rotation (around Y axis)
          float cosR = cos(u_rotation);
          float sinR = sin(u_rotation);
          vec3 rotN = vec3(
            tiltedN.x * cosR + tiltedN.z * sinR,
            tiltedN.y,
            -tiltedN.x * sinR + tiltedN.z * cosR
          );

          // Calculate Equirectangular UV mapping
          float lat = asin(clamp(rotN.y, -0.999, 0.999));
          float lon = atan(rotN.x, rotN.z);

          float u = fract((lon / (2.0 * PI)) + 0.5);
          float v = clamp(0.5 - (lat / PI), 0.002, 0.998);

          // Sample Photorealistic Earth Map
          vec4 texColor = texture2D(u_texture, vec2(u, v));

          // 3D Directional Sunlight from top-right front
          vec3 lightDir = normalize(vec3(0.70, 0.35, 0.65));
          float diff = max(dot(N, lightDir), 0.0);

          // Specular Reflection for Oceans
          bool isOcean = texColor.b > (texColor.r + texColor.g) * 0.60;
          float spec = 0.0;
          if (isOcean && diff > 0.0) {
            vec3 viewDir = vec3(0.0, 0.0, 1.0);
            vec3 halfDir = normalize(lightDir + viewDir);
            spec = pow(max(dot(N, halfDir), 0.0), 32.0) * 0.40;
          }

          // Rayleigh Atmospheric Rim/Fresnel Scattering
          float fresnel = pow(1.0 - N.z, 2.2) * 0.70;
          vec3 rimGlow = vec3(0.15, 0.68, 1.0) * fresnel;

          // Realistic Day-Night Terminator ambient & diffuse
          float ambient = 0.35;
          vec3 litEarth = texColor.rgb * (ambient + diff * 0.85) + vec3(spec) + rimGlow;

          gl_FragColor = vec4(litEarth, 1.0);
        }
      `;

      // Helper to compile shaders
      const createShader = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      // Fullscreen quad buffer
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
      ]), gl.STATIC_DRAW);

      const aPositionLoc = gl.getAttribLocation(program, 'a_position');
      const uTextureLoc = gl.getUniformLocation(program, 'u_texture');
      const uRotationLoc = gl.getUniformLocation(program, 'u_rotation');
      const uTimeLoc = gl.getUniformLocation(program, 'u_time');

      // Create & Load Texture
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Temporary initial oceanic placeholder
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([14, 116, 144, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const image = new Image();
      image.src = '/earth_texture.jpg';
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        setIsLoaded(true);
      };

      let startTime = performance.now();

      const render = () => {
        const currentTime = (performance.now() - startTime) * 0.001;
        // Continuous smooth Earth rotation: ~35s full revolution
        rotation -= 0.0032;

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.enableVertexAttribArray(aPositionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uTextureLoc, 0);
        gl.uniform1f(uRotationLoc, rotation);
        gl.uniform1f(uTimeLoc, currentTime);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
        gl.deleteProgram(program);
        gl.deleteTexture(texture);
      };
    }
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      {/* Planetary Outer Aura Glow */}
      <div className="absolute w-[440px] h-[440px] rounded-full bg-cyan-500/20 blur-3xl pointer-events-none -z-10 animate-pulse" />
      
      {/* 3D WebGL Earth Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: '480px', height: '480px' }}
        className="max-w-full drop-shadow-[0_20px_50px_rgba(2,132,199,0.35)] select-none rounded-full"
      />

      {/* Real-time Indicator Badge */}
      <div className="absolute bottom-2 text-center pointer-events-none">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-950/80 text-sky-200 backdrop-blur-md border border-sky-400/40 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Planet Earth Decarbonization Grid • Live 3D Stream</span>
        </span>
      </div>
    </div>
  );
};
