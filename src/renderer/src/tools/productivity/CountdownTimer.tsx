import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock, Timer } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

const PRESETS = [1, 5, 10, 15, 25, 30, 60];
const RING_RADIUS = 120;
const RING_STROKE = 8;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function CountdownTimer() {
  const colors = useThemeColors();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const freqs = [880, 1100, 880];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.2);
      });
    } catch {}
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    clearTimer();

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  useEffect(() => {
    if (isComplete) {
      playBeep();
      const t = setTimeout(() => setIsComplete(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isComplete, playBeep]);

  const handleStart = () => {
    if (remaining > 0) {
      setIsRunning(true);
      return;
    }
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total <= 0) return;
    setTotalSeconds(total);
    setRemaining(total);
    setIsRunning(true);
    setIsComplete(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    clearTimer();
    setIsRunning(false);
    setRemaining(0);
    setTotalSeconds(0);
    setIsComplete(false);
  };

  const handlePreset = (mins: number) => {
    clearTimer();
    setIsRunning(false);
    setIsComplete(false);
    setHours(0);
    setMinutes(mins);
    setSeconds(0);
    setRemaining(0);
    setTotalSeconds(0);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const elapsed = totalSeconds > 0 ? totalSeconds - remaining : 0;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const inputStyle: React.CSSProperties = {
    width: 64,
    height: 48,
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    color: colors.text,
    fontSize: 20,
    textAlign: 'center',
    outline: 'none',
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: colors.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <Timer size={28} color={colors.accent} />
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Countdown Timer</h1>
      </div>

      <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 32, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Ring Display */}
        <div style={{ position: 'relative', width: 280, height: 280, marginBottom: 28 }}>
          <svg width={280} height={280} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={140} cy={140} r={RING_RADIUS} fill="none" stroke={colors.border} strokeWidth={RING_STROKE} />
            <circle cx={140} cy={140} r={RING_RADIUS} fill="none" stroke={colors.accent} strokeWidth={RING_STROKE}
              strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={dashOffset}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            animation: isComplete ? 'pulse 0.6s ease-in-out 5' : 'none',
          }}>
            <Clock size={20} color={colors.textSecondary} style={{ marginBottom: 4 }} />
            <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
              {remaining > 0 ? formatTime(remaining) : formatTime(hours * 3600 + minutes * 60 + seconds)}
            </span>
            <span style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              {isComplete ? 'Time\'s up!' : isRunning ? 'Running...' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Pulse keyframes */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.7; }
          }
        `}</style>

        {/* Input Fields */}
        {!isRunning && remaining === 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <input type="number" min={0} max={23} value={hours} onChange={(e) => setHours(Math.max(0, Math.min(23, +e.target.value)))} style={inputStyle} />
              <span style={{ fontSize: 11, color: colors.textSecondary }}>Hours</span>
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, paddingBottom: 18 }}>:</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Math.max(0, Math.min(59, +e.target.value)))} style={inputStyle} />
              <span style={{ fontSize: 11, color: colors.textSecondary }}>Min</span>
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, paddingBottom: 18 }}>:</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <input type="number" min={0} max={59} value={seconds} onChange={(e) => setSeconds(Math.max(0, Math.min(59, +e.target.value)))} style={inputStyle} />
              <span style={{ fontSize: 11, color: colors.textSecondary }}>Sec</span>
            </div>
          </div>
        )}

        {/* Preset Buttons */}
        {!isRunning && remaining === 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            {PRESETS.map((m) => (
              <button key={m} onClick={() => handlePreset(m)}
                style={{ ...btnBase, background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, padding: '6px 14px', fontSize: 13 }}>
                {m}m
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12 }}>
          {!isRunning ? (
            <button onClick={handleStart}
              style={{ ...btnBase, background: colors.accent, color: colors.text }}>
              <Play size={18} /> Start
            </button>
          ) : (
            <button onClick={handlePause}
              style={{ ...btnBase, background: colors.accent, color: colors.text }}>
              <Pause size={18} /> Pause
            </button>
          )}
          <button onClick={handleReset}
            style={{ ...btnBase, background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
