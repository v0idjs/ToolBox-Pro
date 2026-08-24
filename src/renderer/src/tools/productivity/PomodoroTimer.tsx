import { useState, useEffect, useRef, useCallback } from 'react'
import { Pause, RotateCcw, Timer, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

const DEFAULTS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  longBreakInterval: 4
}

type Phase = 'work' | 'shortBreak' | 'longBreak'

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  } catch {}
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function PomodoroTimer() {
  const colors = useThemeColors()
  const [workDuration, setWorkDuration] = useState(DEFAULTS.work)
  const [shortBreakDuration, setShortBreakDuration] = useState(DEFAULTS.shortBreak)
  const [longBreakDuration, setLongBreakDuration] = useState(DEFAULTS.longBreak)

  const [phase, setPhase] = useState<Phase>('work')
  const [timeLeft, setTimeLeft] = useState(DEFAULTS.work)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  const totalTime = phase === 'work' ? workDuration : phase === 'shortBreak' ? shortBreakDuration : longBreakDuration
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getNextPhase = useCallback(
    (currentPhase: Phase, completed: number): { nextPhase: Phase; nextTime: number } => {
      if (currentPhase === 'work') {
        if ((completed + 1) % DEFAULTS.longBreakInterval === 0) {
          return { nextPhase: 'longBreak', nextTime: longBreakDuration }
        }
        return { nextPhase: 'shortBreak', nextTime: shortBreakDuration }
      }
      return { nextPhase: 'work', nextTime: workDuration }
    },
    [workDuration, shortBreakDuration, longBreakDuration]
  )

  useEffect(() => {
    if (!isRunning) return

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBeep()
          setIsRunning(false)

          if (phase === 'work') {
            const newCompleted = completedPomodoros + 1
            setCompletedPomodoros(newCompleted)
            const { nextPhase, nextTime } = getNextPhase(phase, newCompleted - 1)
            setPhase(nextPhase)
            return nextTime
          } else {
            const { nextPhase, nextTime } = getNextPhase(phase, completedPomodoros)
            setPhase(nextPhase)
            return nextTime
          }
        }
        return prev - 1
      })
    }, 1000)

    intervalRef.current = id
    return () => clearInterval(id)
  }, [isRunning, phase, completedPomodoros, getNextPhase])

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setPhase('work')
    setTimeLeft(workDuration)
    setCompletedPomodoros(0)
  }

  const circumference = 2 * Math.PI * 126

  const phaseColors: Record<Phase, string> = {
    work: colors.error,
    shortBreak: colors.success,
    longBreak: colors.warning
  }

  const digits = {
    fontFamily: 'var(--tb-font-display)',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em'
  } as React.CSSProperties

  const statLabel = {
    fontFamily: 'var(--tb-font-mono)',
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.textFaint
  } as React.CSSProperties

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: colors.text }}>
      <ToolHeader
        name="Pomodoro Timer"
        description="Focus timer with work/break cycles"
        category="productivity"
        icon={Timer}
        serial="pomodoro-timer"
      />

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '8px 0' }}>
          <div style={{ position: 'relative', width: 260, height: 260 }}>
            <svg width="260" height="260" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}>
              <circle cx="130" cy="130" r="126" fill="none" stroke={colors.bgDeep} strokeWidth="8" />
              <circle
                cx="130"
                cy="130"
                r="126"
                fill="none"
                stroke={phaseColors[phase]}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.3s linear' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ ...digits, fontSize: 64, lineHeight: 1 }}>{formatTime(timeLeft)}</div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: 'var(--tb-font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: phaseColors[phase]
                }}
              >
                {phase === 'work' ? 'Focus' : phase === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </div>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              maxWidth: 300,
              height: 6,
              backgroundColor: colors.bgDeep,
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                backgroundColor: phaseColors[phase],
                borderRadius: 3,
                transition: 'width 0.3s linear'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isRunning ? (
              <Button variant="primary" icon={Zap} onClick={handleStart}>
                Start
              </Button>
            ) : (
              <Button
                variant="ghost"
                icon={Pause}
                onClick={handlePause}
                style={{ color: colors.error, border: `1px solid ${colors.error}` }}
              >
                Pause
              </Button>
            )}
            <Button variant="ghost" icon={RotateCcw} onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionLabel hint={`${completedPomodoros} done`}>Session</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ ...digits, fontSize: 26, lineHeight: 1.1 }}>{completedPomodoros}</span>
            <span style={statLabel}>Pomodoros</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ ...digits, fontSize: 26, lineHeight: 1.1 }}>
              {Math.floor((completedPomodoros * workDuration) / 3600)}h{' '}
              {Math.floor(((completedPomodoros * workDuration) % 3600) / 60)}m
            </span>
            <span style={statLabel}>Focus Time</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ ...digits, fontSize: 26, lineHeight: 1.1, color: colors.accent }}>
              {Math.ceil(completedPomodoros / DEFAULTS.longBreakInterval)}
            </span>
            <span style={statLabel}>Cycles</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
          {Array.from({ length: DEFAULTS.longBreakInterval }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: i < completedPomodoros % DEFAULTS.longBreakInterval ? colors.accent : colors.border
              }}
            />
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>Settings</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13.5, color: colors.textSecondary, minWidth: 120 }}>Work</span>
            <Input
              type="number"
              min={1}
              max={120}
              value={Math.round(workDuration / 60)}
              onChange={(e) => {
                const v = Math.max(1, parseInt(e.target.value) || 1)
                setWorkDuration(v * 60)
                if (phase === 'work' && !isRunning) setTimeLeft(v * 60)
              }}
              style={{ width: 84, textAlign: 'center' }}
            />
            <span style={{ fontFamily: 'var(--tb-font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textFaint }}>
              min
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13.5, color: colors.textSecondary, minWidth: 120 }}>Short Break</span>
            <Input
              type="number"
              min={1}
              max={30}
              value={Math.round(shortBreakDuration / 60)}
              onChange={(e) => {
                const v = Math.max(1, parseInt(e.target.value) || 1)
                setShortBreakDuration(v * 60)
                if (phase === 'shortBreak' && !isRunning) setTimeLeft(v * 60)
              }}
              style={{ width: 84, textAlign: 'center' }}
            />
            <span style={{ fontFamily: 'var(--tb-font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textFaint }}>
              min
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13.5, color: colors.textSecondary, minWidth: 120 }}>Long Break</span>
            <Input
              type="number"
              min={1}
              max={60}
              value={Math.round(longBreakDuration / 60)}
              onChange={(e) => {
                const v = Math.max(1, parseInt(e.target.value) || 1)
                setLongBreakDuration(v * 60)
                if (phase === 'longBreak' && !isRunning) setTimeLeft(v * 60)
              }}
              style={{ width: 84, textAlign: 'center' }}
            />
            <span style={{ fontFamily: 'var(--tb-font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textFaint }}>
              min
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
