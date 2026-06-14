import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flag, Timer } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

interface Lap {
  id: number;
  lapTime: number;
  totalTime: number;
}

function formatTime(ms: number): string {
  const totalMs = Math.floor(ms);
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centiseconds = Math.floor((totalMs % 1000) / 10);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

function formatLapTime(ms: number): string {
  const totalMs = Math.floor(ms);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centiseconds = Math.floor((totalMs % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  }
  return `${seconds}.${String(centiseconds).padStart(2, '0')}`;
}

export function Stopwatch() {
  const colors = useThemeColors();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const lapIdCounterRef = useRef(0);

  const tick = useCallback(() => {
    setTime(performance.now() - startTimeRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = performance.now() - pausedAtRef.current;
    rafRef.current = requestAnimationFrame(tick);
    setIsRunning(true);
  }, [tick]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    pausedAtRef.current = performance.now() - startTimeRef.current;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setTime(0);
    setIsRunning(false);
    pausedAtRef.current = 0;
    startTimeRef.current = 0;
    setLaps([]);
    lapIdCounterRef.current = 0;
  }, []);

  const lap = useCallback(() => {
    if (!isRunning) return;
    const currentElapsed = performance.now() - startTimeRef.current;

    setLaps((prev) => {
      const lastLapTotal = prev.length > 0 ? prev[prev.length - 1].totalTime : 0;
      const lapTime = currentElapsed - lastLapTotal;
      lapIdCounterRef.current += 1;
      return [
        ...prev,
        { id: lapIdCounterRef.current, lapTime, totalTime: currentElapsed },
      ];
    });
  }, [isRunning]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fastestLap = laps.length > 1 ? laps.reduce((min, l) => (l.lapTime < min.lapTime ? l : min), laps[0]) : null;
  const slowestLap = laps.length > 1 ? laps.reduce((max, l) => (l.lapTime > max.lapTime ? l : max), laps[0]) : null;

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    card: {
      backgroundColor: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '32px',
      width: '100%',
      maxWidth: '480px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
    },
    timeDisplay: {
      fontSize: '72px',
      fontWeight: 700,
      color: colors.text,
      fontFamily: 'monospace',
      letterSpacing: '2px',
      lineHeight: 1,
    },
    buttonRow: {
      display: 'flex',
      gap: '12px',
      width: '100%',
      justifyContent: 'center',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'opacity 0.15s',
      minWidth: '100px',
    },
    primaryButton: {
      backgroundColor: colors.accent,
      color: colors.text,
    },
    secondaryButton: {
      backgroundColor: colors.border,
      color: colors.textSecondary,
    },
    lapButton: {
      backgroundColor: colors.accent,
      color: colors.text,
    },
    lapHeader: {
      fontSize: '14px',
      fontWeight: 600,
      color: colors.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      width: '100%',
      borderBottom: `1px solid ${colors.border}`,
      paddingBottom: '8px',
    },
    lapList: {
      width: '100%',
      maxHeight: '300px',
      overflowY: 'auto' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
    },
    lapItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: '8px',
      backgroundColor: colors.input,
    },
    lapItemFastest: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderLeft: '3px solid #22C55E',
    },
    lapItemSlowest: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderLeft: '3px solid #EF4444',
    },
    lapNumber: {
      color: colors.textSecondary,
      fontSize: '14px',
      fontWeight: 500,
      minWidth: '50px',
    },
    lapTimeValue: {
      color: colors.text,
      fontSize: '16px',
      fontWeight: 600,
      fontFamily: 'monospace',
      flex: 1,
      textAlign: 'center' as const,
    },
    lapTotal: {
      color: colors.textSecondary,
      fontSize: '14px',
      fontFamily: 'monospace',
      minWidth: '80px',
      textAlign: 'right' as const,
    },
    emptyState: {
      color: colors.textSecondary,
      fontSize: '14px',
      textAlign: 'center' as const,
      padding: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, alignSelf: 'flex-start' }}>
        <Timer size={24} color={colors.accent} />
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: colors.text }}>Stopwatch</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.timeDisplay}>{formatTime(time)}</div>

        <div style={styles.buttonRow}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={isRunning ? stop : start}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? 'Stop' : 'Start'}
          </button>

          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={reset}
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            style={{ ...styles.button, ...styles.lapButton, opacity: isRunning ? 1 : 0.5 }}
            onClick={lap}
            disabled={!isRunning}
          >
            <Flag size={18} />
            Lap
          </button>
        </div>

        {laps.length > 0 && (
          <>
            <div style={styles.lapHeader}>Laps</div>
            <div style={styles.lapList}>
              {[...laps].reverse().map((lapEntry, index) => {
                const realIndex = laps.length - index;
                const isFastest = fastestLap && lapEntry.id === fastestLap.id;
                const isSlowest = slowestLap && lapEntry.id === slowestLap.id;

                return (
                  <div
                    key={lapEntry.id}
                    style={{
                      ...styles.lapItem,
                      ...(isFastest ? styles.lapItemFastest : {}),
                      ...(isSlowest && !isFastest ? styles.lapItemSlowest : {}),
                    }}
                  >
                    <span style={styles.lapNumber}>#{realIndex}</span>
                    <span style={styles.lapTimeValue}>{formatLapTime(lapEntry.lapTime)}</span>
                    <span style={styles.lapTotal}>{formatLapTime(lapEntry.totalTime)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {laps.length === 0 && (
          <div style={styles.emptyState}>Press Start, then Lap to record laps</div>
        )}
      </div>
    </div>
  );
}
