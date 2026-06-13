import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Timer } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

const DEFAULTS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  longBreakInterval: 4,
};

type Phase = 'work' | 'shortBreak' | 'longBreak';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function PomodoroTimer() {
  const colors = useThemeColors();
  const [workDuration, setWorkDuration] = useState(DEFAULTS.work);
  const [shortBreakDuration, setShortBreakDuration] = useState(DEFAULTS.shortBreak);
  const [longBreakDuration, setLongBreakDuration] = useState(DEFAULTS.longBreak);

  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULTS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const totalTime = phase === 'work' ? workDuration : phase === 'shortBreak' ? shortBreakDuration : longBreakDuration;
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getNextPhase = useCallback(
    (currentPhase: Phase, completed: number): { nextPhase: Phase; nextTime: number } => {
      if (currentPhase === 'work') {
        if ((completed + 1) % DEFAULTS.longBreakInterval === 0) {
          return { nextPhase: 'longBreak', nextTime: longBreakDuration };
        }
        return { nextPhase: 'shortBreak', nextTime: shortBreakDuration };
      }
      return { nextPhase: 'work', nextTime: workDuration };
    },
    [workDuration, shortBreakDuration, longBreakDuration],
  );

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          setIsRunning(false);

          if (phase === 'work') {
            const newCompleted = completedPomodoros + 1;
            setCompletedPomodoros(newCompleted);
            const { nextPhase, nextTime } = getNextPhase(phase, newCompleted - 1);
            setPhase(nextPhase);
            return nextTime;
          } else {
            const { nextPhase, nextTime } = getNextPhase(phase, completedPomodoros);
            setPhase(nextPhase);
            return nextTime;
          }
        }
        return prev - 1;
      });
    }, 1000);

    intervalRef.current = id;
    return () => clearInterval(id);
  }, [isRunning, phase, completedPomodoros, getNextPhase]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(workDuration);
    setCompletedPomodoros(0);
  };

  const circumference = 2 * Math.PI * 126;

  const styles = {
    container: {
      minHeight: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: colors.text,
    } as React.CSSProperties,
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    } as React.CSSProperties,
    title: {
      fontSize: '24px',
      fontWeight: 700,
      color: colors.text,
      margin: 0,
    } as React.CSSProperties,
    card: {
      backgroundColor: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px',
    } as React.CSSProperties,
    cardTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: colors.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: '16px',
    } as React.CSSProperties,
    timerWrapper: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '24px',
      padding: '24px 0',
    } as React.CSSProperties,
    circularTimer: (phase: Phase, progress: number) => {
      const size = 260;
      const strokeWidth = 8;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference * (1 - progress);
      const phaseColors: Record<Phase, string> = {
        work: '#EF4444',
        shortBreak: '#22C55E',
        longBreak: '#A855F7',
      };
      const color = phaseColors[phase];
      return {
        position: 'relative' as const,
        width: `${size}px`,
        height: `${size}px`,
      };
    },
    svgCircle: {
      transform: 'rotate(-90deg)',
      transformOrigin: '50% 50%',
    } as React.CSSProperties,
    timerInner: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties,
    timeDisplay: {
      fontSize: '56px',
      fontWeight: 700,
      color: colors.text,
      fontFamily: '"SF Mono", "Fira Code", Menlo, Consolas, monospace',
      lineHeight: 1,
      letterSpacing: '2px',
    } as React.CSSProperties,
    phaseLabel: (phase: Phase) => {
      const phaseColorMap: Record<Phase, string> = {
        work: '#EF4444',
        shortBreak: '#22C55E',
        longBreak: '#A855F7',
      };
      return {
        fontSize: '14px',
        fontWeight: 600,
        color: phaseColorMap[phase],
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        marginTop: '8px',
      };
    },
    progressBar: {
      width: '100%',
      maxWidth: '300px',
      height: '6px',
      backgroundColor: colors.border,
      borderRadius: '3px',
      overflow: 'hidden' as const,
    } as React.CSSProperties,
    progressFill: (phase: Phase, progress: number) => {
      const phaseColorMap: Record<Phase, string> = {
        work: '#EF4444',
        shortBreak: '#22C55E',
        longBreak: '#A855F7',
      };
      return {
        width: `${progress * 100}%`,
        height: '100%',
        backgroundColor: phaseColorMap[phase],
        borderRadius: '3px',
        transition: 'width 0.3s linear',
      };
    },
    controls: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
    } as React.CSSProperties,
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    } as React.CSSProperties,
    primaryButton: {
      backgroundColor: colors.accent,
      color: colors.text,
    } as React.CSSProperties,
    secondaryButton: {
      backgroundColor: colors.border,
      color: colors.text,
      border: '1px solid #334155',
    } as React.CSSProperties,
    sessionInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      marginTop: '8px',
    } as React.CSSProperties,
    sessionStat: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '4px',
    } as React.CSSProperties,
    sessionStatValue: {
      fontSize: '24px',
      fontWeight: 700,
      color: colors.text,
    } as React.CSSProperties,
    sessionStatLabel: {
      fontSize: '12px',
      color: colors.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    } as React.CSSProperties,
    dotsRow: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      marginTop: '12px',
    } as React.CSSProperties,
    dot: (filled: boolean): React.CSSProperties => ({
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: filled ? colors.accent : colors.border,
      border: filled ? '1px solid #3B82F6' : '1px solid #334155',
      transition: 'all 0.2s ease',
    }),
    configRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
    } as React.CSSProperties,
    configLabel: {
      fontSize: '14px',
      color: colors.textSecondary,
      minWidth: '120px',
    } as React.CSSProperties,
    configInput: {
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      padding: '8px 12px',
      color: colors.text,
      fontSize: '14px',
      width: '80px',
      textAlign: 'center' as const,
      fontFamily: 'inherit',
    } as React.CSSProperties,
    configUnit: {
      fontSize: '13px',
      color: colors.textSecondary,
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Timer size={24} color={colors.accent} />
        <h1 style={styles.title}>Pomodoro Timer</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.timerWrapper}>
          <div style={styles.circularTimer(phase, progress)}>
            <svg width="260" height="260" style={styles.svgCircle}>
              <circle
                cx="130"
                cy="130"
                r="126"
                fill="none"
                stroke={colors.border}
                strokeWidth="8"
              />
              <circle
                cx="130"
                cy="130"
                r="126"
                fill="none"
                stroke={phase === 'work' ? '#EF4444' : phase === 'shortBreak' ? '#22C55E' : '#A855F7'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.3s linear' }}
              />
            </svg>
            <div style={styles.timerInner}>
              <div style={styles.timeDisplay}>{formatTime(timeLeft)}</div>
              <div style={styles.phaseLabel(phase)}>
                {phase === 'work' ? 'Focus' : phase === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </div>
            </div>
          </div>

          <div style={styles.progressBar}>
            <div style={styles.progressFill(phase, progress)} />
          </div>

          <div style={styles.controls}>
            {!isRunning ? (
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onClick={handleStart}
              >
                <Play size={18} />
                Start
              </button>
            ) : (
              <button
                style={{ ...styles.button, ...styles.primaryButton, backgroundColor: '#DC2626' }}
                onClick={handlePause}
              >
                <Pause size={18} />
                Pause
              </button>
            )}
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={handleReset}
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Session</div>
        <div style={styles.sessionInfo}>
          <div style={styles.sessionStat}>
            <span style={styles.sessionStatValue}>{completedPomodoros}</span>
            <span style={styles.sessionStatLabel}>Pomodoros</span>
          </div>
          <div style={styles.sessionStat}>
            <span style={styles.sessionStatValue}>
              {Math.floor(completedPomodoros * workDuration / 3600)}h{' '}
              {Math.floor((completedPomodoros * workDuration % 3600) / 60)}m
            </span>
            <span style={styles.sessionStatLabel}>Focus Time</span>
          </div>
          <div style={styles.sessionStat}>
            <span style={{ ...styles.sessionStatValue, color: colors.accent }}>
              {Math.ceil(completedPomodoros / DEFAULTS.longBreakInterval)}
            </span>
            <span style={styles.sessionStatLabel}>Cycles</span>
          </div>
        </div>
        <div style={styles.dotsRow}>
          {Array.from({ length: DEFAULTS.longBreakInterval }).map((_, i) => (
            <div key={i} style={styles.dot(i < completedPomodoros % DEFAULTS.longBreakInterval)} />
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Settings</div>
        <div style={styles.configRow}>
          <span style={styles.configLabel}>Work</span>
          <input
            type="number"
            min={1}
            max={120}
            value={Math.round(workDuration / 60)}
            onChange={(e) => {
              const v = Math.max(1, parseInt(e.target.value) || 1);
              setWorkDuration(v * 60);
              if (phase === 'work' && !isRunning) setTimeLeft(v * 60);
            }}
            style={styles.configInput}
          />
          <span style={styles.configUnit}>min</span>
        </div>
        <div style={styles.configRow}>
          <span style={styles.configLabel}>Short Break</span>
          <input
            type="number"
            min={1}
            max={30}
            value={Math.round(shortBreakDuration / 60)}
            onChange={(e) => {
              const v = Math.max(1, parseInt(e.target.value) || 1);
              setShortBreakDuration(v * 60);
              if (phase === 'shortBreak' && !isRunning) setTimeLeft(v * 60);
            }}
            style={styles.configInput}
          />
          <span style={styles.configUnit}>min</span>
        </div>
        <div style={styles.configRow}>
          <span style={styles.configLabel}>Long Break</span>
          <input
            type="number"
            min={1}
            max={60}
            value={Math.round(longBreakDuration / 60)}
            onChange={(e) => {
              const v = Math.max(1, parseInt(e.target.value) || 1);
              setLongBreakDuration(v * 60);
              if (phase === 'longBreak' && !isRunning) setTimeLeft(v * 60);
            }}
            style={styles.configInput}
          />
          <span style={styles.configUnit}>min</span>
        </div>
      </div>
    </div>
  );
}
