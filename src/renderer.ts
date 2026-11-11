export type MotionScene = {
  title: string;
  subtitle: string;
  accent: string;
  duration: number;
};

const TAU = Math.PI * 2;

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function drawMotionFrame(
  canvas: HTMLCanvasElement,
  scene: MotionScene,
  elapsed: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const t = elapsed;
  const progress = Math.min(1, t / scene.duration);
  const ease = 1 - Math.pow(1 - Math.min(1, t / 1.3), 3);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#080a11";
  ctx.fillRect(0, 0, width, height);

  // Atmospheric radial light.
  const glow = ctx.createRadialGradient(width * 0.72, height * 0.36, 0, width * 0.72, height * 0.36, width * 0.62);
  glow.addColorStop(0, scene.accent + "30");
  glow.addColorStop(0.55, scene.accent + "0b");
  glow.addColorStop(1, "#080a1100");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Fine technical grid.
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = "#9aa6c8";
  ctx.lineWidth = 1;
  const grid = 48;
  const offset = (t * 8) % grid;
  for (let x = -grid + offset; x < width; x += grid) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += grid) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  ctx.restore();

  // Orbiting luminous paths.
  for (let i = 0; i < 5; i++) {
    const radius = 130 + i * 54;
    ctx.save();
    ctx.translate(width * 0.72, height * 0.48);
    ctx.rotate(-0.34 + t * (0.035 + i * 0.006) * (i % 2 ? 1 : -1));
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.42, radius * 0.48, 0, 0.2, Math.PI * 1.82);
    ctx.strokeStyle = scene.accent;
    ctx.globalAlpha = 0.14 + 0.08 * Math.sin(t * 1.4 + i);
    ctx.lineWidth = i === 0 ? 2 : 1;
    ctx.shadowColor = scene.accent;
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.restore();
  }

  // Floating particles.
  for (let i = 0; i < 72; i++) {
    const seed = i * 127.1;
    const x = ((Math.sin(seed) * 0.5 + 0.5) * width + t * (7 + i % 9)) % width;
    const y = ((Math.cos(seed * 0.7) * 0.5 + 0.5) * height + Math.sin(t * 0.35 + i) * 13) % height;
    const radius = 0.8 + (i % 4) * 0.48;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fillStyle = scene.accent;
    ctx.globalAlpha = 0.18 + 0.34 * (0.5 + 0.5 * Math.sin(t * 1.7 + i));
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Main title lockup.
  const reveal = Math.max(0, Math.min(1, ease));
  ctx.save();
  ctx.translate(112, 0);
  ctx.globalAlpha = reveal;
  ctx.translate(0, (1 - reveal) * 34);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  ctx.fillStyle = scene.accent;
  ctx.font = "500 18px 'DM Mono', monospace";
  ctx.letterSpacing = "5px";
  ctx.fillText("MOTION STUDY  /  001", 0, height * 0.36);

  ctx.fillStyle = "#f4f5fb";
  ctx.font = "800  clamp(70px, 9vw, 132px) Manrope, sans-serif";
  ctx.letterSpacing = "-7px";
  ctx.shadowColor = scene.accent + "55";
  ctx.shadowBlur = 24;
  ctx.fillText(scene.title.toUpperCase(), 0, height * 0.49, width * 0.58);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#a7aec2";
  ctx.font = "500 22px Manrope, sans-serif";
  ctx.letterSpacing = "0px";
  ctx.fillText(scene.subtitle, 4, height * 0.58, width * 0.48);

  // Animated accent bar.
  const barWidth = 94 + 92 * (0.5 + 0.5 * Math.sin(t * 1.7));
  roundedRect(ctx, 0, height * 0.65, barWidth, 3, 2);
  ctx.fillStyle = scene.accent;
  ctx.fill();
  ctx.restore();

  // Minimal HUD.
  ctx.fillStyle = "#788198";
  ctx.font = "13px 'DM Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("ROTiK  /  GENERATIVE DESIGN", 54, height - 48);
  ctx.textAlign = "right";
  ctx.fillText("00:" + Math.floor(t).toString().padStart(2, "0") + "  /  " + Math.round(progress * 100) + "%", width - 54, height - 48);

  // Soft vignette.
  const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, width * 0.72);
  vignette.addColorStop(0, "#00000000");
  vignette.addColorStop(1, "#02030a99");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export function sceneFromPrompt(prompt: string): MotionScene {
  const clean = prompt.trim();
  const titleMatch = clean.match(/[«"]([^»"]{2,28})[»"]/);
  const title = titleMatch?.[1] ?? (clean.length > 0
    ? clean.split(/[.!?\n]/)[0].replace(/^(создай|сделай|анимируй)\s+/i, "").slice(0, 22)
    : "ROTIK");
  return {
    title: title || "ROTIK",
    subtitle: "Ideas in motion. Made with code.",
    accent: /зелен|green|nature|лес/i.test(clean) ? "#8ce6bb"
      : /розов|pink|magenta/i.test(clean) ? "#f28acb"
      : /золот|gold|lux/i.test(clean) ? "#e9c27a"
      : /красн|red/i.test(clean) ? "#ff6d78"
      : "#8b8cff",
    duration: 12
  };
}