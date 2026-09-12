import React, { useEffect, useRef } from 'react';

export const GlobeVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotationAngle = 0;

    // High resolution canvas setup
    const size = 480;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 175;

    // Industrial Decarbonization Coordinate points on globe (lat, lon, label, risk)
    const industrialHubs = [
      { lat: 28.6, lon: 77.2, label: 'Delhi NCR Hub', risk: 'high' },
      { lat: 21.7, lon: 72.9, label: 'Dahej Petrochem', risk: 'critical' },
      { lat: 19.0, lon: 72.8, label: 'Mumbai Industrial', risk: 'medium' },
      { lat: 51.5, lon: -0.1, label: 'Rotterdam Cluster', risk: 'low' },
      { lat: 29.7, lon: -95.3, label: 'Houston Ship Channel', risk: 'medium' },
      { lat: 31.2, lon: 121.4, label: 'Shanghai Basin', risk: 'high' },
      { lat: 1.35, lon: 103.8, label: 'Jurong Island', risk: 'medium' },
      { lat: 25.2, lon: 55.2, label: 'Jebel Ali Zone', risk: 'low' }
    ];

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // 1. Atmosphere Outer Glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.85, centerX, centerY, radius * 1.35);
      glowGrad.addColorStop(0, 'rgba(2, 132, 199, 0.25)');
      glowGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.12)');
      glowGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.04)');
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Earth Sphere (Deep oceanic navy to daylight cyan-azure)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      const sphereGrad = ctx.createRadialGradient(
        centerX - radius * 0.35,
        centerY - radius * 0.35,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      sphereGrad.addColorStop(0, '#38BDF8');
      sphereGrad.addColorStop(0.3, '#0284C7');
      sphereGrad.addColorStop(0.7, '#0369A1');
      sphereGrad.addColorStop(1, '#0C4A6E');

      ctx.fillStyle = sphereGrad;
      ctx.fillRect(0, 0, size, size);

      // 3. Render Latitude & Longitude Grids (Revolving with rotationAngle)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';

      // Latitudes
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = centerY - Math.sin((lat * Math.PI) / 180) * radius * 0.95;
        const rLat = Math.cos((lat * Math.PI) / 180) * radius;
        ctx.beginPath();
        ctx.ellipse(centerX, y, rLat, rLat * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitudes revolving continuously (25-45s rotation period)
      for (let lon = 0; lon < 360; lon += 30) {
        const currentLon = (lon + rotationAngle) % 360;
        const rad = (currentLon * Math.PI) / 180;
        const xOffset = Math.sin(rad) * radius;
        const isVisible = Math.cos(rad) > 0;

        if (isVisible) {
          ctx.beginPath();
          ctx.ellipse(centerX + xOffset * 0.45, centerY, Math.abs(Math.sin(rad)) * radius * 0.55, radius, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.stroke();
        }
      }

      // 4. Stylized Continents / Landmass Silhouettes (Vector math projection)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
      const landClusters = [
        { lat: 40, lon: 20, rx: 55, ry: 35 },   // Eurasia
        { lat: 25, lon: 80, rx: 45, ry: 40 },   // Asia/India
        { lat: 0, lon: 25, rx: 40, ry: 50 },    // Africa
        { lat: 45, lon: 260, rx: 50, ry: 40 },  // North America
        { lat: -15, lon: 300, rx: 35, ry: 45 }, // South America
        { lat: -25, lon: 135, rx: 35, ry: 30 }, // Australia
      ];

      landClusters.forEach(land => {
        const currentLon = (land.lon + rotationAngle) % 360;
        const rad = (currentLon * Math.PI) / 180;
        const cosLon = Math.cos(rad);

        if (cosLon > -0.2) {
          const x = centerX + Math.sin(rad) * radius * 0.85;
          const y = centerY - Math.sin((land.lat * Math.PI) / 180) * radius * 0.75;
          const alpha = Math.max(0, cosLon);

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.28})`;
          ctx.beginPath();
          ctx.ellipse(x, y, land.rx * 0.55 * alpha, land.ry * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Render Industrial Emission Telemetry Pins
      industrialHubs.forEach(hub => {
        const currentLon = (hub.lon + rotationAngle) % 360;
        const rad = (currentLon * Math.PI) / 180;
        const cosLon = Math.cos(rad);

        if (cosLon > 0.15) {
          const x = centerX + Math.sin(rad) * radius * 0.85;
          const y = centerY - Math.sin((hub.lat * Math.PI) / 180) * radius * 0.75;
          const alpha = Math.max(0.2, cosLon);

          // Outer pulse ring
          const color = hub.risk === 'critical' ? 'rgba(239, 68, 68,' :
                        hub.risk === 'high' ? 'rgba(245, 158, 11,' :
                        hub.risk === 'medium' ? 'rgba(14, 165, 233,' : 'rgba(16, 185, 129,';

          ctx.strokeStyle = `${color} ${alpha * 0.85})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, 6 + Math.sin(rotationAngle * 0.1) * 2, 0, Math.PI * 2);
          ctx.stroke();

          // Pin Core Dot
          ctx.fillStyle = `${color} ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 6. Day-Night Atmospheric Shadow Gradient Overlay
      const shadowGrad = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
      shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(0.85, 'rgba(15, 23, 42, 0.45)');
      shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0.75)');

      ctx.fillStyle = shadowGrad;
      ctx.fillRect(0, 0, size, size);

      ctx.restore();

      // 7. Subtle Orbit Ring (Decarbonization Sensor Grid)
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.22, radius * 0.45, -Math.PI / 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotate globe continuously: approx 35 seconds per complete 360 rotation
      // (60fps * 35s = 2100 frames => 360 / 2100 ≈ 0.171 deg per frame)
      rotationAngle = (rotationAngle + 0.18) % 360;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{ width: '480px', height: '480px' }}
        className="max-w-full drop-shadow-xl select-none"
      />
      <div className="absolute bottom-2 text-center pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-950/60 text-sky-200 backdrop-blur-md border border-sky-400/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Live Planetary Decarbonization Grid • Simulation Mode
        </span>
      </div>
    </div>
  );
};
