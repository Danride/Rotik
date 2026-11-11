import { useCallback, useEffect, useRef, useState } from "react";
import { Aperture, ArrowUpRight, Check, CircleHelp, Clapperboard, Download, Layers3, Pause, Play, Plus, Sparkles, WandSparkles } from "lucide-react";
import { drawMotionFrame, sceneFromPrompt, type MotionScene } from "./renderer";

const STARTER_PROMPT = "Создай футуристичную заставку с мягким свечением, частицами и кинетической типографикой. Название: ROTIK";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prompt, setPrompt] = useState(STARTER_PROMPT);
  const [scene, setScene] = useState<MotionScene>(() => sceneFromPrompt(STARTER_PROMPT));
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState("Preview ready");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    let previous = performance.now();
    let current = elapsed;

    const render = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (playing) current += delta;
      drawMotionFrame(canvas, scene, current);
      if (playing) setElapsed(current);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [scene, playing]);

  const generate = useCallback(() => {
    if (!prompt.trim()) return;
    setScene(sceneFromPrompt(prompt));
    setElapsed(0);
    setPlaying(true);
    setNotice("Scene generated");
  }, [prompt]);

  const exportVideo = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!("MediaRecorder" in window) || !canvas.captureStream) {
      setNotice("Video export is not supported in this browser");
      return;
    }

    setExporting(true);
    setNotice("Rendering video…");
    const stream = canvas.captureStream(30);
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
      .find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "rotik-motion-study.webm";
      link.click();
      URL.revokeObjectURL(url);
      stream.getTracks().forEach((track) => track.stop());
      setExporting(false);
      setNotice("Video exported");
    };

    const wasPlaying = playing;
    setPlaying(true);
    recorder.start();
    const started = performance.now();
    const durationMs = scene.duration * 1000;
    const finish = () => {
      if (performance.now() - started >= durationMs) {
        recorder.stop();
        setPlaying(wasPlaying);
        return;
      }
      requestAnimationFrame(finish);
    };
    requestAnimationFrame(finish);
  }, [playing, scene.duration]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Rotik home"><span className="brand-mark"><Aperture size={19} /></span><span>rotik<span className="brand-dot">.</span></span></a>
        <div className="topbar-center"><span className="status-dot" /> PRIVATE BETA <span className="topbar-divider">/</span> MOTION ENGINE 0.1</div>
        <button className="help-button" title="About Rotik"><CircleHelp size={18} /></button>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="section-kicker">CREATE</div>
          <div className="sidebar-title"><WandSparkles size={18} /> New composition</div>
          <label className="field-label" htmlFor="prompt">DESCRIBE YOUR MOTION</label>
          <textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe the animation you imagine…" />
          <button className="generate-button" onClick={generate}><Sparkles size={16} /> Generate motion <ArrowUpRight size={16} /></button>
          <div className="prompt-hint">Tip: mention a mood, color, title or movement.</div>

          <div className="sidebar-separator" />
          <div className="section-kicker">QUICK STARTS</div>
          <button className="preset" onClick={() => setPrompt("Minimal luxury brand reveal. Warm gold typography, elegant light sweep, deep black background. Title: AUREL.")}><span className="preset-swatch gold" /> Luxury brand reveal <ArrowUpRight size={14} /></button>
          <button className="preset" onClick={() => setPrompt("Electric cyberpunk title sequence. Neon pink and violet lines, fast particles, dark city mood. Title: AFTER HOURS.")}><span className="preset-swatch pink" /> Neon title sequence <ArrowUpRight size={14} /></button>
          <button className="preset" onClick={() => setPrompt("Calm organic motion. Soft green glow, drifting dust, gentle flowing lines. Title: NATURE.")}><span className="preset-swatch green" /> Organic flow <ArrowUpRight size={14} /></button>

          <div className="sidebar-bottom"><div className="avatar">R</div><div><strong>Rotik Studio</strong><span>Local workspace</span></div><span className="local-pill">LOCAL</span></div>
        </aside>

        <section className="stage">
          <div className="stage-heading"><div><div className="section-kicker">CANVAS / 01</div><h1>Your idea, in motion.</h1></div><div className="stage-actions"><span className="resolution-pill">1920 × 1080</span><span className="fps-pill">30 FPS</span></div></div>
          <div className="preview-frame">
            <div className="preview-topline"><span><span className="live-dot" /> LIVE PREVIEW</span><span>16:9 <i /> HD</span></div>
            <div className="canvas-wrap"><canvas ref={canvasRef} width={1920} height={1080} aria-label="Animated motion graphics preview" /></div>
            <div className="preview-controls">
              <button className="icon-button" onClick={() => setPlaying((value) => !value)} title={playing ? "Pause" : "Play"}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
              <div className="timeline"><div className="timeline-track"><div className="timeline-progress" style={{ width: Math.min(100, (elapsed / scene.duration) * 100) + "%" }} /></div><div className="time-labels"><span>00:{Math.floor(elapsed).toString().padStart(2, "0")}</span><span>00:{scene.duration.toString().padStart(2, "0")}</span></div></div>
              <button className="export-button" onClick={exportVideo} disabled={exporting}>{exporting ? <span className="spinner" /> : <Download size={15} />}{exporting ? "Rendering…" : "Export video"}</button>
            </div>
          </div>
          <div className="under-stage"><div className="notice"><span className="notice-check"><Check size={12} /></span>{notice}</div><div className="engine-note"><Layers3 size={14} /> Procedural 2D renderer <span>·</span> Canvas</div></div>
          <div className="bottom-note"><Clapperboard size={15} /> This is the first playable prototype. AI scene generation and MP4 rendering are the next milestones.</div>
        </section>
      </section>
    </main>
  );
}