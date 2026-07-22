const canvas = document.getElementById("film-canvas");
const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;
const track = document.getElementById("track");
const loader = document.getElementById("loader");
const loadbar = document.getElementById("loadbar");
const portal = document.getElementById("portal-transition");
const portalCopy = portal?.querySelector(".portal-copy");
const scrollCue = document.getElementById("scroll-cue");
const captions = [...document.querySelectorAll(".caption")];

const state = {
  frameCount: 192,
  pattern: "frames/frame_%04d.webp",
  bitmaps: [],
  loadedCount: 0,
  ready: false,
  target: 0,
  smooth: 0,
  lastScroll: -1,
  lastFrameIndex: -1,
  maxScroll: 1,
  // Cached cover dimensions
  cw: 0,
  ch: 0,
  nx: 0,
  ny: 0,
  nw: 0,
  nh: 0
};

const FILM_END = 0.85;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

function getFrameUrl(index) {
  const num = String(index + 1).padStart(4, "0");
  return state.pattern.replace("%04d", num);
}

function updateMetrics() {
  if (track) {
    state.maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
  }
}

function progress() {
  return clamp(window.scrollY / state.maxScroll);
}

function frameProgress(value) {
  if (value >= FILM_END) return 1.0;
  const normScroll = value / FILM_END;
  const stops = [
    [0.00, 0.00],
    [0.14, 0.16],
    [0.35, 0.36],
    [0.60, 0.68],
    [0.82, 0.88],
    [1.00, 1.00]
  ];
  for (let i = 1; i < stops.length; i += 1) {
    const [nextScroll, nextFrame] = stops[i];
    const [prevScroll, prevFrame] = stops[i - 1];
    if (normScroll <= nextScroll) {
      const t = clamp((normScroll - prevScroll) / (nextScroll - prevScroll));
      return prevFrame + (nextFrame - prevFrame) * t;
    }
  }
  return 1.0;
}

function updateCoverMetrics(iw, ih) {
  if (!canvas || !iw || !ih) return;
  const cw = canvas.width;
  const ch = canvas.height;
  const scale = Math.max(cw / iw, ch / ih);
  state.cw = cw;
  state.ch = ch;
  state.nw = iw * scale;
  state.nh = ih * scale;
  state.nx = (cw - state.nw) / 2;
  state.ny = (ch - state.nh) / 2;
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  
  updateMetrics();
  
  const sample = state.bitmaps.find((b) => b);
  if (sample) {
    updateCoverMetrics(sample.width, sample.height);
  }
  
  state.lastFrameIndex = -1; // Force re-render
}

function drawCover(bitmap) {
  if (!ctx || !bitmap) return;
  if (!state.nw || !state.nh) {
    updateCoverMetrics(bitmap.width, bitmap.height);
  }
  ctx.drawImage(bitmap, state.nx, state.ny, state.nw, state.nh);
}

function renderFrame(frameIdx) {
  if (frameIdx === state.lastFrameIndex) return;
  
  let bitmap = state.bitmaps[frameIdx];
  if (!bitmap) {
    for (let offset = 1; offset < state.frameCount; offset += 1) {
      const prev = frameIdx - offset;
      const next = frameIdx + offset;
      if (prev >= 0 && state.bitmaps[prev]) {
        bitmap = state.bitmaps[prev];
        break;
      }
      if (next < state.frameCount && state.bitmaps[next]) {
        bitmap = state.bitmaps[next];
        break;
      }
    }
  }
  
  if (bitmap) {
    drawCover(bitmap);
    state.lastFrameIndex = frameIdx;
  }
}

function transformBase(element) {
  if (element.classList.contains("cap-center")) return "translate(-50%, -50%)";
  return "translateY(-50%)";
}

function updateCaptions(value) {
  captions.forEach((element) => {
    const tIn = Number(element.dataset.in);
    const tHold = Number(element.dataset.hold);
    const tOut = Number(element.dataset.out);
    const rise = Math.max((tHold - tIn) * 0.42, 0.008);
    const fall = Math.max((tOut - tHold) * 0.58, 0.008);
    let opacity = 0;
    if (value >= tIn && value <= tOut) {
      opacity = Math.min((value - tIn) / rise, 1) * Math.min((tOut - value) / fall, 1);
    }
    element.style.opacity = opacity.toFixed(3);
    element.style.transform = `${transformBase(element)} translateY(${((value - tHold) * -40).toFixed(1)}px)`;
  });
  if (scrollCue) scrollCue.style.opacity = value < 0.015 ? "1" : "0";
}

function updatePortal(value) {
  if (!portal) return;
  const t = clamp((value - FILM_END) / (1 - FILM_END));
  const eased = smoothstep(t);
  const radius = eased * 125;
  const copyT = clamp((t - 0.35) / 0.45);
  portal.style.clipPath = `ellipse(${radius.toFixed(2)}% ${Math.min(100, radius * 0.86).toFixed(2)}% at 50% 56%)`;
  portal.style.setProperty("--portal", eased.toFixed(3));
  if (canvas) {
    canvas.style.transform = `scale(${(1 + eased * 0.12).toFixed(4)})`;
    canvas.style.filter = `brightness(${(1 - eased * 0.18).toFixed(3)}) saturate(${(1 + eased * 0.12).toFixed(3)})`;
  }
  if (portalCopy) {
    portalCopy.style.opacity = copyT.toFixed(3);
    portalCopy.style.transform = `translateY(${((1 - copyT) * 24).toFixed(1)}px)`;
  }
}

function updateFilm(now) {
  if (!state.ready) return;
  const dt = Math.min((now - (updateFilm.last || now)) / 1000, 0.5) || 0.016;
  updateFilm.last = now;
  
  const value = progress();
  state.target = frameProgress(value);
  
  const diff = state.target - state.smooth;
  if (Math.abs(diff) > 0.0001) {
    state.smooth += diff * (1 - Math.exp(-dt * 18));
  } else {
    state.smooth = state.target;
  }
  
  const frameIdx = Math.min(state.frameCount - 1, Math.max(0, Math.round(state.smooth * (state.frameCount - 1))));
  renderFrame(frameIdx);
  
  if (Math.abs(state.lastScroll - value) > 0.0001) {
    state.lastScroll = value;
    updateCaptions(value);
    updatePortal(value);
  }
}

function tick(now) {
  updateFilm(now);
  requestAnimationFrame(tick);
}

function revealSections() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in")),
    { threshold: 0.14 }
  );
  document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
}

// Asynchronous off-thread decode with createImageBitmap directly into GPU texture memory
async function loadSingleBitmap(index) {
  try {
    const res = await fetch(getFrameUrl(index));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    state.bitmaps[index] = bitmap;
    state.loadedCount += 1;
    
    if (loadbar) {
      const pct = Math.min(100, Math.round((state.loadedCount / state.frameCount) * 100));
      loadbar.style.width = `${pct}%`;
    }
    return bitmap;
  } catch (e) {
    state.loadedCount += 1;
    return null;
  }
}

async function preloadFrames() {
  try {
    const res = await fetch("frames/frames.json");
    if (res.ok) {
      const manifest = await res.json();
      if (manifest.count) state.frameCount = manifest.count;
      if (manifest.pattern) state.pattern = manifest.pattern;
    }
  } catch (e) {
    console.warn("Using default frame manifest parameters.");
  }

  resizeCanvas();

  // Queue ALL 192 frames for parallel fetch and off-thread GPU decoding during loading screen
  const queue = Array.from({ length: state.frameCount }, (_, i) => i);
  const concurrency = 8;

  async function worker() {
    while (queue.length > 0) {
      const idx = queue.shift();
      if (idx !== undefined) {
        await loadSingleBitmap(idx);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  // 100% of frames pre-decoded in GPU memory
  state.ready = true;
  renderFrame(0);

  if (loadbar) loadbar.style.width = "100%";
  
  if (loader) {
    setTimeout(() => {
      loader.classList.add("done");
    }, 150);
  }
}

function init() {
  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isReduced) {
    if (loader) loader.classList.add("done");
    revealSections();
    return;
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    const frameIdx = Math.min(state.frameCount - 1, Math.max(0, Math.round(state.smooth * (state.frameCount - 1))));
    renderFrame(frameIdx);
  }, { passive: true });

  window.addEventListener("scroll", () => {
    updateMetrics();
  }, { passive: true });

  document.querySelectorAll(".feature-video").forEach((clip) => {
    clip.play().catch(() => {});
  });

  revealSections();
  preloadFrames();
  requestAnimationFrame(tick);
}

init();
