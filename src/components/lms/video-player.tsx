"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Gauge,
  Keyboard,
  Lock,
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const IDLE_TIMEOUT = 2800;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  onProgress?: (seconds: number) => void;
  onComplete?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  /** Optional initial playback position (seconds). */
  initialTime?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function VideoPlayer({
  src,
  poster,
  title,
  onProgress,
  onComplete,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  initialTime,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekingRef = useRef(false);
  const lastProgressEmitRef = useRef(0);
  const completedFiredRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [ready, setReady] = useState(false);
  // Track previous src via state so we can reset media state on src change
  // using the during-render adjustment pattern (no setState-in-effect).
  const [prevSrc, setPrevSrc] = useState<string | undefined>(src);

  const hasSrc = Boolean(src);

  // -------------------------------------------------------------------------
  // Idle management
  // -------------------------------------------------------------------------
  const wake = useCallback(() => {
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, IDLE_TIMEOUT);
  }, []);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Video element events
  // -------------------------------------------------------------------------
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => {
      setPlaying(true);
      wake();
    };
    const onPause = () => {
      setPlaying(false);
      setShowControls(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
    const onLoaded = () => {
      setDuration(v.duration || 0);
      setReady(true);
      if (initialTime && v && Number.isFinite(initialTime)) {
        try {
          v.currentTime = initialTime;
        } catch {
          /* noop */
        }
      }
    };
    const onTime = () => {
      if (seekingRef.current) return;
      setCurrent(v.currentTime);
      // Throttled progress callback (~ every 4s)
      if (onProgress && v.currentTime - lastProgressEmitRef.current >= 4) {
        lastProgressEmitRef.current = v.currentTime;
        onProgress(v.currentTime);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setShowControls(true);
      if (onProgress) onProgress(v.duration || v.currentTime);
      if (!completedFiredRef.current && onComplete) {
        completedFiredRef.current = true;
        onComplete();
      }
    };
    const onVolume = () => {
      setVolume(v.volume);
      setMuted(v.muted);
    };
    const onProgressEvent = () => {
      try {
        if (v.buffered && v.buffered.length && v.duration) {
          setBuffered(v.buffered.end(v.buffered.length - 1));
        }
      } catch {
        /* noop */
      }
    };
    const onWaiting = () => setWaiting(true);
    const onPlaying = () => setWaiting(false);
    const onRateChange = () => setSpeed(v.playbackRate);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("durationchange", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    v.addEventListener("volumechange", onVolume);
    v.addEventListener("progress", onProgressEvent);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("ratechange", onRateChange);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("durationchange", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("volumechange", onVolume);
      v.removeEventListener("progress", onProgressEvent);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("ratechange", onRateChange);
    };
  }, [onProgress, onComplete, wake, initialTime]);

  // Reset media state when src changes (during-render adjustment — avoids
  // setState-in-effect cascading renders).
  if (prevSrc !== src) {
    setPrevSrc(src);
    setReady(false);
    setCurrent(0);
    setDuration(0);
    setBuffered(0);
  }

  // Ref-only reset on src change is allowed inside an effect (no setState).
  useEffect(() => {
    completedFiredRef.current = false;
    lastProgressEmitRef.current = 0;
  }, [src]);

  // -------------------------------------------------------------------------
  // Fullscreen handling
  // -------------------------------------------------------------------------
  useEffect(() => {
    const onFsChange = () =>
      setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // -------------------------------------------------------------------------
  // Playback controls
  // -------------------------------------------------------------------------
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !hasSrc) return;
    if (v.paused) {
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [hasSrc]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) {
      v.volume = 0.5;
    }
  }, []);

  const changeVolume = useCallback((value: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = value;
    v.muted = value === 0;
  }, []);

  const changeSpeed = useCallback((value: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = value;
  }, []);

  const seekTo = useCallback((time: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(time)) return;
    v.currentTime = Math.max(0, Math.min(v.duration || time, time));
    setCurrent(v.currentTime);
  }, []);

  const seekBy = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v) return;
      seekTo((v.currentTime || 0) + delta);
    },
    [seekTo]
  );

  const changeVolumeBy = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v) return;
      const next = Math.max(0, Math.min(1, (v.volume || 0) + delta));
      changeVolume(next);
    },
    [changeVolume]
  );

  // -------------------------------------------------------------------------
  // Progress bar interaction
  // -------------------------------------------------------------------------
  const barRef = useRef<HTMLDivElement>(null);

  const positionFromEvent = useCallback((clientX: number) => {
    const bar = barRef.current;
    const v = videoRef.current;
    if (!bar || !v || !v.duration) return null;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );
    return ratio * v.duration;
  }, []);

  const onBarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!hasSrc) return;
      const t = positionFromEvent(e.clientX);
      if (t == null) return;
      seekingRef.current = true;
      setCurrent(t);
      const move = (ev: MouseEvent) => {
        const nt = positionFromEvent(ev.clientX);
        if (nt != null) setCurrent(nt);
      };
      const up = (ev: MouseEvent) => {
        const nt = positionFromEvent(ev.clientX);
        if (nt != null) {
          seekTo(nt);
        }
        seekingRef.current = false;
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [hasSrc, positionFromEvent, seekTo]
  );

  // Touch seek
  const onBarTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!hasSrc) return;
      const t = positionFromEvent(e.touches[0].clientX);
      if (t == null) return;
      seekingRef.current = true;
      setCurrent(t);
      const move = (ev: TouchEvent) => {
        const nt = positionFromEvent(ev.touches[0].clientX);
        if (nt != null) setCurrent(nt);
      };
      const end = (ev: TouchEvent) => {
        const nt = positionFromEvent(ev.changedTouches[0].clientX);
        if (nt != null) seekTo(nt);
        seekingRef.current = false;
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", end);
      };
      window.addEventListener("touchmove", move);
      window.addEventListener("touchend", end);
    },
    [hasSrc, positionFromEvent, seekTo]
  );

  // -------------------------------------------------------------------------
  // Keyboard shortcuts
  // -------------------------------------------------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing into form fields elsewhere
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      // Only act when player is the active element OR mouse is over it
      const active = document.activeElement;
      const isOurs = active === el || el.contains(active) || active === document.body;

      switch (e.key) {
        case " ":
        case "k":
          if (isOurs) {
            e.preventDefault();
            togglePlay();
          }
          break;
        case "ArrowLeft":
          if (isOurs) {
            e.preventDefault();
            seekBy(-5);
          }
          break;
        case "ArrowRight":
          if (isOurs) {
            e.preventDefault();
            seekBy(5);
          }
          break;
        case "ArrowUp":
          if (isOurs) {
            e.preventDefault();
            changeVolumeBy(0.1);
          }
          break;
        case "ArrowDown":
          if (isOurs) {
            e.preventDefault();
            changeVolumeBy(-0.1);
          }
          break;
        case "f":
          if (isOurs) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case "m":
          if (isOurs) {
            e.preventDefault();
            toggleMute();
          }
          break;
      }
    };

    el.addEventListener("keydown", onKey);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("keydown", onKey);
      window.removeEventListener("keydown", onKey);
    };
  }, [togglePlay, seekBy, changeVolumeBy, toggleFullscreen, toggleMute]);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const progressPct = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  // -------------------------------------------------------------------------
  // Locked / no-src state
  // -------------------------------------------------------------------------
  if (!hasSrc) {
    return (
      <div
        className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-premium"
        role="img"
        aria-label={title ? `Video unavailable: ${title}` : "Video unavailable"}
      >
        {poster && (
          <img
            src={poster}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-30 blur-sm"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
            <Lock className="size-7 text-white/90" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Video unavailable</p>
            <p className="mt-1 max-w-xs text-sm text-white/70">
              {title
                ? `“${title}” is not playable right now.`
                : "This lesson doesn't have a playable video."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseMove={wake}
      onMouseLeave={() => {
        if (videoRef.current && !videoRef.current.paused) {
          setShowControls(false);
        }
      }}
      className={cn(
        "group relative aspect-video w-full select-none overflow-hidden rounded-xl bg-black shadow-premium outline-none",
        fullscreen && "rounded-none"
      )}
      aria-label={title ? `Video player: ${title}` : "Video player"}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        className="absolute inset-0 size-full bg-black object-contain"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Center play / waiting indicator */}
      <AnimatePresence>
        {!playing && ready && (
          <motion.button
            key="center-play"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            onClick={togglePlay}
            className="absolute inset-0 z-10 flex items-center justify-center"
            aria-label="Play video"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105 sm:size-20">
              <Play className="size-8 translate-x-0.5 fill-current sm:size-10" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {waiting && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="size-12 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {/* Top gradient + title */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            key="top-grad"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-black/70 to-transparent"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && title && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute left-4 right-4 top-4 z-30"
          >
            <p className="line-clamp-1 text-sm font-medium text-white/90 drop-shadow sm:text-base">
              {title}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 z-30"
          >
            <div className="bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 pb-2 pt-8 sm:px-4 sm:pb-3 sm:pt-12">
              {/* Progress bar */}
              <div
                ref={barRef}
                onMouseDown={onBarMouseDown}
                onTouchStart={onBarTouchStart}
                role="slider"
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={Math.floor(duration)}
                aria-valuenow={Math.floor(current)}
                tabIndex={-1}
                className="group/seek relative flex h-4 cursor-pointer items-center"
              >
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-all group-hover/seek:h-1.5">
                  {/* Buffered */}
                  <div
                    className="absolute inset-y-0 left-0 bg-white/35"
                    style={{ width: `${bufferedPct}%` }}
                  />
                  {/* Played */}
                  <div
                    className="absolute inset-y-0 left-0 bg-primary"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {/* Thumb */}
                <div
                  className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow transition-opacity group-hover/seek:opacity-100"
                  style={{ left: `${progressPct}%` }}
                />
              </div>

              {/* Buttons row */}
              <div className="mt-1 flex items-center gap-1.5 text-white sm:gap-2">
                {/* Prev */}
                <ControlButton
                  label="Previous lesson"
                  onClick={onPrev}
                  disabled={!hasPrev}
                >
                  <ChevronLeft className="size-5" />
                </ControlButton>

                {/* Play/Pause */}
                <ControlButton
                  label={playing ? "Pause (space)" : "Play (space)"}
                  onClick={togglePlay}
                  primary
                >
                  {playing ? (
                    <Pause className="size-5 fill-current" />
                  ) : (
                    <Play className="size-5 translate-x-0.5 fill-current" />
                  )}
                </ControlButton>

                {/* Next */}
                <ControlButton
                  label="Next lesson"
                  onClick={onNext}
                  disabled={!hasNext}
                >
                  <ChevronRight className="size-5" />
                </ControlButton>

                {/* Volume */}
                <div className="group/vol flex items-center">
                  <ControlButton
                    label={muted ? "Unmute (m)" : "Mute (m)"}
                    onClick={toggleMute}
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="size-5" />
                    ) : (
                      <Volume2 className="size-5" />
                    )}
                  </ControlButton>
                  <div className="w-0 overflow-hidden transition-all duration-200 group-hover/vol:w-20 sm:group-hover/vol:w-24">
                    <div className="w-20 px-2 sm:w-24">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={muted ? 0 : volume}
                        onChange={(e) =>
                          changeVolume(parseFloat(e.target.value))
                        }
                        aria-label="Volume"
                        style={{
                          background: `linear-gradient(to right, oklch(0.72 0.16 162) 0%, oklch(0.72 0.16 162) ${
                            (muted ? 0 : volume) * 100
                          }%, rgba(255,255,255,0.3) ${
                            (muted ? 0 : volume) * 100
                          }%, rgba(255,255,255,0.3) 100%)`,
                        }}
                        className="h-1 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="ml-1 select-none font-mono text-xs tabular-nums text-white/90 sm:text-sm">
                  <span>{fmtTime(current)}</span>
                  <span className="text-white/50"> / {fmtTime(duration)}</span>
                </div>

                <div className="flex-1" />

                {/* Speed */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-white/90 transition-colors hover:bg-white/15 sm:text-sm"
                      aria-label="Playback speed"
                    >
                      <Gauge className="size-4" />
                      <span className="tabular-nums">{speed}×</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-32"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuLabel>Playback speed</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {SPEEDS.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={cn(
                          "justify-between",
                          s === speed && "font-semibold text-primary"
                        )}
                      >
                        {s}×
                        {s === speed && <span className="text-xs">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Shortcuts help */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setShowShortcuts((v) => !v)}
                      className="flex h-9 items-center justify-center rounded-md px-2 text-white/90 transition-colors hover:bg-white/15"
                      aria-label="Keyboard shortcuts"
                    >
                      <Keyboard className="size-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Shortcuts (?)</TooltipContent>
                </Tooltip>

                {/* Fullscreen */}
                <ControlButton
                  label={fullscreen ? "Exit fullscreen (f)" : "Fullscreen (f)"}
                  onClick={toggleFullscreen}
                >
                  {fullscreen ? (
                    <Minimize className="size-5" />
                  ) : (
                    <Maximize className="size-5" />
                  )}
                </ControlButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts dialog */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            key="shortcuts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md rounded-xl border border-white/15 bg-zinc-900/95 p-5 text-white shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Keyboard className="size-4 text-primary" />
                  Keyboard shortcuts
                </h3>
                <button
                  type="button"
                  onClick={() => setShowShortcuts(false)}
                  className="rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close shortcuts"
                >
                  ✕
                </button>
              </div>
              <ul className="space-y-2 text-sm">
                <ShortcutRow keys={["Space", "K"]} label="Play / pause" />
                <ShortcutRow keys={["←"]} label="Rewind 5s" />
                <ShortcutRow keys={["→"]} label="Forward 5s" />
                <ShortcutRow keys={["↑"]} label="Volume up" />
                <ShortcutRow keys={["↓"]} label="Volume down" />
                <ShortcutRow keys={["M"]} label="Mute / unmute" />
                <ShortcutRow keys={["F"]} label="Toggle fullscreen" />
              </ul>
              <p className="mt-4 text-xs text-white/50">
                Click the video to play/pause. Double-click to toggle fullscreen.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ControlButton({
  children,
  label,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(
            "flex size-9 items-center justify-center rounded-md text-white transition-colors",
            primary
              ? "bg-white/15 hover:bg-white/25"
              : "hover:bg-white/15",
            disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-white/80">{label}</span>
      <span className="flex items-center gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="min-w-7 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-center font-mono text-xs text-white/90"
          >
            {k}
          </kbd>
        ))}
      </span>
    </li>
  );
}

export { VideoPlayer as default };
