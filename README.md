# Rotik

**An AI-directed motion graphics studio. Describe a visual idea, generate a scene, and render it.**

Rotik is being built around a simple workflow:

1. Describe the motion graphic you want.
2. An AI director turns the brief into a structured scene.
3. The Rotik renderer draws and animates that scene.
4. Export the result as a video.

## Current prototype

The first milestone is a browser-based procedural 2D renderer:
- React + TypeScript + Vite interface
- Canvas 2D animation renderer
- Animated grid, orbit paths, particles, glow and kinetic typography
- Prompt-driven local scene presets
- Real-time preview and WebM recording via MediaRecorder

> AI scene planning, a richer scene-description format, and MP4 export are planned milestones. The current prompt generation is a local prototype, not an AI API integration.

## Run locally

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Architecture direction

- **AI Director:** converts natural-language briefs into validated scene data.
- **Scene format:** declarative objects, typography, keyframes, effects and camera tracks.
- **Renderer:** deterministic frame rendering for preview and export.
- **Export pipeline:** browser capture for prototypes; server-side frame rendering and FFmpeg for production output.

## Roadmap

- [x] Initial studio interface
- [x] Procedural Canvas 2D renderer
- [x] Preview playback and WebM export
- [ ] Structured scene-description schema
- [ ] GPT-powered scene planning
- [ ] Timeline, layers and editable properties
- [ ] Deterministic frame renderer
- [ ] MP4 export pipeline
