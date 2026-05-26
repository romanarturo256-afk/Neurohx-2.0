import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  hemisphere: 'left' | 'right' | 'back' | 'stem';
  id: number;
  glow: number;
}

interface Spark {
  startNode: number;
  endNode: number;
  progress: number;
  speed: number;
  color: string;
}

interface NoiseParticle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
}

export default function NeuroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Real-time mouse coordinates and hover state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });
  const [isHovered, setIsHovered] = useState(false);
  
  // Track scroll progress for 3D state transition (chaos -> clarity)
  const { scrollYProgress } = useScroll();

  // Create a buttery smooth spring transition for scroll response
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 25,
    restDelta: 0.001
  });
  
  const [scrollProgress, setScrollProgress] = useState(0);

  // Sync motion scroll state with local canvas animation frame
  useEffect(() => {
    return smoothScroll.onChange((latest) => {
      // Map 0 to 0.45 scroll progress of the page to 0% to 100% of clarity transition with smooth dampening
      const mapped = Math.min(1, Math.max(0, latest / 0.45));
      setScrollProgress(mapped);
    });
  }, [smoothScroll]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use ResizeObserver for responsive canvas scaling without window gaps
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          width = canvas.width = canvas.offsetWidth;
          height = canvas.height = canvas.offsetHeight;
        }
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Mathematical constant parameters for realistic 3D projections
    const fov = 400; // Focal length
    const brainScale = Math.min(width, height) * 0.28; // Scale based on viewport
    
    // Rotation vectors
    let rotX = 0.2;
    let rotY = 0;
    let rotZ = 0;

    // 1. Generate 3D Brain Hologram Nodes
    // We model Cerebrum (Hemispheres with folds), Cerebellum, and Brain Stem
    const nodes: Point3D[] = [];
    const numNodes = 140;

    for (let i = 0; i < numNodes; i++) {
      let x = 0;
      let y = 0;
      let z = 0;
      let hemisphere: 'left' | 'right' | 'back' | 'stem' = 'left';

      const rand = Math.random();
      if (rand < 0.75) {
        // CEREBRUM (Hemispheres with anatomical lobes and sulci folds)
        const isLeft = Math.random() < 0.5;
        hemisphere = isLeft ? 'left' : 'right';

        // Polar distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        // Ellipsoidal shape of a brain hemisphere
        const rx = 1.1; 
        const ry = 0.8;
        const rz = 0.85;

        // Add periodic ripple function representing sulci (brain curves)
        const ripple = 1.0 + 0.12 * Math.sin(theta * 6) * Math.cos(phi * 6);
        
        x = rx * Math.sin(phi) * Math.cos(theta) * ripple;
        y = ry * Math.sin(phi) * Math.sin(theta) * ripple - 0.1; // offset upwards
        z = rz * Math.cos(phi) * ripple;

        // Split into Left and Right hemispheres with narrow sagittal fissure separation
        if (isLeft) {
          x = -Math.abs(x) - 0.05;
        } else {
          x = Math.abs(x) + 0.05;
        }
      } else if (rand < 0.9) {
        // CEREBELLUM (dense smaller structure at lower back)
        hemisphere = 'back';
        const theta = Math.random() * Math.PI * 2;
        const r = 0.45 * (0.8 + 0.2 * Math.random());
        x = r * Math.cos(theta) * 0.9;
        y = -0.55 + Math.random() * 0.25; // lower
        z = -0.4 - Math.abs(r * Math.sin(theta) * 0.7); // back
      } else {
        // BRAIN STEM (tube pointing down from center base)
        hemisphere = 'stem';
        y = -0.4 - Math.random() * 0.6; // extending downwards
        x = (Math.random() - 0.5) * 0.15;
        z = -0.1 + (Math.random() - 0.5) * 0.15;
      }

      // Convert from proportional sphere unit vector coordinates to absolute spatial pixels
      nodes.push({
        x: x * brainScale,
        y: -y * brainScale, // invert y for canvas coordinate standard
        z: z * brainScale,
        baseX: x * brainScale,
        baseY: -y * brainScale,
        baseZ: z * brainScale,
        hemisphere,
        id: i,
        glow: Math.random()
      });
    }

    // 2. Map structural synapses/connections between contiguous neighbors
    interface Connection {
      from: number;
      to: number;
      dist: number;
    }
    const connections: Connection[] = [];
    const maxConnectDist = brainScale * 0.42;

    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        
        // Prohibit connections spanning across physical hemispheres unless they are near outer bridges
        if (
          (n1.hemisphere === 'left' && n2.hemisphere === 'right') ||
          (n1.hemisphere === 'right' && n2.hemisphere === 'left')
        ) {
          // Corpus Callosum bridging nodes - only connect extremely close central elements
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y, n1.z - n2.z);
          if (dist < brainScale * 0.2) {
            connections.push({ from: i, to: j, dist });
          }
          continue;
        }

        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y, n1.z - n2.z);
        if (dist < maxConnectDist) {
          connections.push({ from: i, to: j, dist });
        }
      }
    }

    // 3. Action potentals (Flowing sparks traveling along the brain mapping)
    const sparks: Spark[] = [];
    const maxSparks = 36;
    for (let s = 0; s < maxSparks; s++) {
      // Pick random starting connection
      const connIndex = Math.floor(Math.random() * connections.length);
      const conn = connections[connIndex];
      sparks.push({
        startNode: conn.from,
        endNode: conn.to,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.008,
        color: Math.random() > 0.4 ? '#E5E0FF' : '#E6FFFD'
      });
    }

    // 4. Generate Background Noise Particles
    // These particles drift chaotically at scroll=0, and assemble into perfect sine/ordered waves as user scrolls to 1
    const noiseParticles: NoiseParticle[] = [];
    const numNoise = 160;
    for (let i = 0; i < numNoise; i++) {
      // Chaotic circular drift layout around the outer bounds of canvas
      const angle = Math.random() * Math.PI * 2;
      const radius = 250 + Math.random() * 400;
      const originX = Math.cos(angle) * radius;
      const originY = Math.sin(angle) * (radius * 0.8);
      const originZ = (Math.random() - 0.5) * 300;

      noiseParticles.push({
        x: originX,
        y: originY,
        z: originZ,
        baseX: originX,
        baseY: originY,
        baseZ: originZ,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.35,
        size: 1 + Math.random() * 3,
        alpha: 0.15 + Math.random() * 0.45,
      });
    }

    let time = 0;
    let animationFrameId: number;

    // Core Animation Frame Loop
    const draw = () => {
      time += 0.008;

      // Darken canvas with semi-translucent overlay to enable light-tail trails
      ctx.fillStyle = '#faf8fb'; // Luxury soft cream color
      ctx.fillRect(0, 0, width, height);

      // Interpolate mouse coordinates with inertia for micro-parallax
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Autonomic calm rotation combined with mouse tilt and scroll-responsive perspective shift
      const rotationSpeedFactor = 0.35;
      const scrollRotationY = scrollProgress * Math.PI * 0.4; // Elegant 72-degree rotation on scroll
      rotY = time * rotationSpeedFactor + mouse.x * 0.0012 + scrollRotationY;
      rotX = 0.22 + Math.sin(time * 0.4) * 0.06 + mouse.y * 0.001 - scrollProgress * 0.15;
      rotZ = Math.cos(time * 0.2) * 0.03;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      // Project and draw Background Noise vs. Ordered Particles
      noiseParticles.forEach((p, idx) => {
        // Chaos physics
        p.baseX += p.vx;
        p.baseY += p.vy;
        p.baseZ += p.vz;
        
        // Constrain bounding box for chaos drift
        if (Math.hypot(p.baseX, p.baseY) > width * 0.95) {
          p.baseX = -p.baseX * 0.9;
          p.baseY = -p.baseY * 0.9;
        }

        // Calculate targeted ORDERED coordinates (Sinusoidal alignment representing perfect neural clarity)
        // Ordered position is a series of horizontal flowing wave lines near the bottom/center
        const waveIndex = idx % 3;
        const spacingX = width / numNoise;
        const targetX = -width / 2 + (idx * spacingX) * 1.5;
        const tScale = (idx / numNoise) * Math.PI * 4;
        const targetY = (height * 0.25) + Math.sin(tScale + time * 3 + waveIndex * Math.PI * 0.6) * 45;
        const targetZ = Math.cos(tScale + time) * 80;

        // Linear interpolation of coordinate sets based on Scroll Position (from Chaotic -> Ordered)
        const alphaShift = scrollProgress; // 0 to 1
        const currentX = p.baseX * (1 - alphaShift) + targetX * alphaShift;
        const currentY = p.baseY * (1 - alphaShift) + targetY * alphaShift;
        const currentZ = p.baseZ * (1 - alphaShift) + targetZ * alphaShift;

        // Dynamic Mouse Clearance field (Repulsion "clearing mental noise")
        let finalX = currentX;
        let finalY = currentY;
        
        // Calculate coordinate relative to canvas center
        const screenCenterX = width / 2;
        const screenCenterY = height / 2;
        const particleAbsX = finalX + screenCenterX;
        const particleAbsY = finalY + screenCenterY;

        // Distance from mouse in screen pixels
        const mouseDist = Math.hypot(particleAbsX - mouse.targetX, particleAbsY - mouse.targetY);
        if (mouseDist < 160) {
          // Force repulsion vector away from cursor, scaled by proximity
          const force = (160 - mouseDist) * 0.38 * (1 - scrollProgress * 0.4);
          const angle = Math.atan2(particleAbsY - mouse.targetY, particleAbsX - mouse.targetX);
          finalX += Math.cos(angle) * force;
          finalY += Math.sin(angle) * force;
        }

        // Perspective 3D rotation projection for noise particles
        const rotY_x = finalX * cosY - currentZ * sinY;
        const rotY_z = finalX * sinY + currentZ * cosY;

        const rotX_y = finalY * cosX - rotY_z * sinX;
        const rotX_z = finalY * sinX + rotY_z * cosX;

        // Apply perspective sizing scale
        const scaleFactor = fov / Math.max(10, fov + rotX_z);
        const drawX = rotY_x * scaleFactor + screenCenterX;
        const drawY = rotX_y * scaleFactor + screenCenterY;

        if (drawX >= 0 && drawX <= width && drawY >= 0 && drawY <= height) {
          // Deepen pastel theme coloring: transition from chaotic lavender-grey to vivid lavender-violet
          ctx.beginPath();
          const opacity = p.alpha * scaleFactor * (1 + scrollProgress * 0.4);
          ctx.fillStyle = scrollProgress > 0.4 
            ? `rgba(163, 142, 235, ${opacity * 0.85})` 
            : `rgba(180, 175, 195, ${opacity * 0.6})`;
          
          ctx.arc(drawX, drawY, Math.max(0, p.size * scaleFactor * (1.0 + scrollProgress * 0.5)), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3D Matrix Projection for Brain nodes
      interface ProjectedNode {
        px: number;
        py: number;
        pz: number;
        scale: number;
        id: number;
        nodeRef: Point3D;
        proximityGlow: number;
      }
      const projectedNodes: ProjectedNode[] = [];

      nodes.forEach((n) => {
        // Apply 3D coordinate rotation on node
        // rotate Y
        let x1 = n.baseX * cosY - n.baseZ * sinY;
        let z1 = n.baseX * sinY + n.baseZ * cosY;
        
        // rotate X
        let y2 = n.baseY * cosX - z1 * sinX;
        let z2 = n.baseY * sinX + z1 * cosX;

        // rotate Z
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        // Apply mild mathematical breathing motion (slow pulsation model)
        const breathe = 1 + 0.04 * Math.sin(time + n.id * 0.1);
        x3 *= breathe;
        y3 *= breathe;
        z3: y2;

        const scale = fov / Math.max(10, fov + z2);
        // Project center coordinate with subtle visual parallax drift downwards inside the canvas frame
        const scrollParallaxY = scrollProgress * (height * 0.08);
        const px = x3 * scale + width / 2;
        const py = y3 * scale + height / 2 + scrollParallaxY;

        // Calculate user hover focus relevance
        let proximityGlow = 0;
        const distToMouse = Math.hypot(px - mouse.targetX, py - mouse.targetY);
        if (distToMouse < 200) {
          proximityGlow = (1 - distToMouse / 200) * 1.5;
        }

        projectedNodes.push({
          px,
          py,
          pz: z2,
          scale,
          id: n.id,
          nodeRef: n,
          proximityGlow
        });
      });

      // 5. Draw connections (Synapse lines matching scroll connection progress)
      // As user scrolls down, synapses structurally tighten and lighten up for support
      connections.forEach((c) => {
        const p1 = projectedNodes[c.from];
        const p2 = projectedNodes[c.to];

        const avgDepth = (p1.pz + p2.pz) / 2;
        const scale = fov / Math.max(10, fov + avgDepth);
        
        // Base synapse visibility: increases during scroll or during mouse hover proximity
        const baseVisibility = 0.06 + scrollProgress * 0.12;
        const hoverGlow = (p1.proximityGlow + p2.proximityGlow) * 0.28;
        const lineOpacity = Math.max(0.01, (baseVisibility + hoverGlow) * scale);

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);

        // Gradient connector mapping soft pastel lavender and neon violet tones
        const grad = ctx.createLinearGradient(p1.px, p1.py, p2.px, p2.py);
        const glowFactor = (p1.proximityGlow || p2.proximityGlow) > 0.5 ? 1 : 0;
        
        if (glowFactor > 0 || scrollProgress > 0.5) {
          // Active state (connected, mindful, vibrant lavender-purple)
          grad.addColorStop(0, `rgba(155, 126, 235, ${lineOpacity * 1.8})`);
          grad.addColorStop(1, `rgba(186, 154, 255, ${lineOpacity * 1.8})`);
        } else {
          // Standard holographic state (calm, thin, light cream/grey-violet)
          grad.addColorStop(0, `rgba(180, 168, 205, ${lineOpacity})`);
          grad.addColorStop(1, `rgba(202, 190, 222, ${lineOpacity})`);
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = (0.5 + scale * 0.5) * (1.0 + (p1.proximityGlow + p2.proximityGlow) * 0.6);
        ctx.stroke();
      });

      // 6. Draw action potential sparks flow along connectivity routes
      sparks.forEach((s) => {
        s.progress += s.speed;
        if (s.progress >= 1) {
          // Pick new connected pathway node once absolute distance is crossed
          s.progress = 0;
          const currentNodeId = s.endNode;
          const localNeighbors = connections.filter(c => c.from === currentNodeId || c.to === currentNodeId);
          if (localNeighbors.length > 0) {
            const chosen = localNeighbors[Math.floor(Math.random() * localNeighbors.length)];
            s.startNode = currentNodeId;
            s.endNode = chosen.from === currentNodeId ? chosen.to : chosen.from;
          } else {
            // Backup reset if isolated lobes
            s.startNode = Math.floor(Math.random() * numNodes);
            s.endNode = Math.floor(Math.random() * numNodes);
          }
        }

        const pStart = projectedNodes[s.startNode];
        const pEnd = projectedNodes[s.endNode];

        if (pStart && pEnd) {
          // Interpolate spatial canvas pixels
          const sparkX = pStart.px + (pEnd.px - pStart.px) * s.progress;
          const sparkY = pStart.py + (pEnd.py - pStart.py) * s.progress;
          const sparkScale = pStart.scale + (pEnd.scale - pStart.scale) * s.progress;

          ctx.beginPath();
          ctx.arc(sparkX, sparkY, Math.max(0, 2.5 * sparkScale * (1.0 + scrollProgress * 0.4)), 0, Math.PI * 2);
          
          // Outer neon glow styling
          ctx.shadowColor = '#D2D7F9';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#C0A3FF'; // Glow pastel purple spark
          ctx.fill();
          
          ctx.shadowBlur = 0; // standard draw reset
        }
      });

      // 7. Draw Hologram Synapse Nodes themselves
      projectedNodes.forEach((pn) => {
        const glowCoeff = pn.proximityGlow + scrollProgress * 0.5;
        const nodeSize = (1.5 + pn.scale * 1.5) * (1.0 + glowCoeff * 0.8);
        const nodeOpacity = Math.max(0.08, (0.28 + glowCoeff * 0.65) * pn.scale);

        ctx.beginPath();
        ctx.arc(pn.px, pn.py, Math.max(0, nodeSize), 0, Math.PI * 2);

        if (glowCoeff > 0.4) {
          // Glowing neurotransmitter emission
          ctx.shadowColor = '#9B7EEB';
          ctx.shadowBlur = 8;
          ctx.fillStyle = `rgba(139, 110, 240, ${nodeOpacity})`;
        } else {
          ctx.fillStyle = `rgba(176, 163, 209, ${nodeOpacity})`;
        }

        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // 8. Draw Mindfulness Calm Sinusoidal Wave lines
      // We render continuous parallel sinusoids reflecting neurochemical clarity states below the canvas frame
      ctx.beginPath();
      const waveYBase = height * 0.82;
      ctx.strokeStyle = `rgba(155, 126, 235, ${0.12 + scrollProgress * 0.3})`;
      ctx.lineWidth = 1.5;
      for (let xOffset = 0; xOffset < width; xOffset += 4) {
        const sineInput = (xOffset * 0.005) - (time * 1.5);
        // Decrease wave frequency and amplitude on scroll (representing calming heart / brain rhythm)
        const waveAmp = (35 - scrollProgress * 22);
        const waveFreqCoeff = (0.01 - scrollProgress * 0.005);
        
        const yOffsetVal = Math.sin(sineInput + xOffset * waveFreqCoeff) * waveAmp;
        
        if (xOffset === 0) {
          ctx.moveTo(xOffset, waveYBase + yOffsetVal);
        } else {
          ctx.lineTo(xOffset, waveYBase + yOffsetVal);
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Event Listener bindings for immersive interactivity
    const handleMouseMove = (e: MouseEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const relativeX = e.clientX - bounds.left;
      const relativeY = e.clientY - bounds.top;
      // Target position
      mouseRef.current.targetX = relativeX;
      mouseRef.current.targetY = relativeY;
    };

    const handleMouseEnter = () => {
      mouseRef.current.active = true;
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      // Gently return projection coordinates back to central drift
      mouseRef.current.targetX = width / 2;
      mouseRef.current.targetY = height / 2;
      setIsHovered(false);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Initial mouse center placement
    mouseRef.current.targetX = width / 2;
    mouseRef.current.targetY = height / 2;

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [scrollProgress]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block bg-transparent" 
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
