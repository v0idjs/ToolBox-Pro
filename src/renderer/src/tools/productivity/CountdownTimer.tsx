import { useState, useRef, useEffect, useCallback } from 'react'
import { Pause, RotateCcw, Clock, Timer, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel, Input } from '@/components/ui'

const PRESETS = [1, 5, 10, 15, 25, 30, 60]
const RING_RADIUS = 120
const RING_STROKE = 8
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function CountdownTimer() {
  const colors = useThemeColors()
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = ctx
      const freqs = [880, 1100, 880]
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2)
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.2)
        osc.stop(ctx.currentTime + i * 0.2 + 0.2)
      })
    } catch {}
  }, [])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isRunning || remaining <= 0) return

    clearTimer()

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          setIsComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [isRunning, clearTimer])

  useEffect(() => {
    if (isComplete) {
      playBeep()
      const t = setTimeout(() => setIsComplete(false), 3000)
      return () => clearTimeout(t)
    }
  }, [isComplete, playBeep])

  const handleStart = () => {
    if (remaining > 0) {
      setIsRunning(true)
      return
    }
    const total = hours * 3600 + minutes * 60 + seconds
    if (total <= 0) return
    setTotalSeconds(total)
    setRemaining(total)
    setIsRunning(true)
    setIsComplete(false)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    clearTimer()
    setIsRunning(false)
    setRemaining(0)
    setTotalSeconds(0)
    setIsComplete(false)
  }

  const handlePreset = (mins: number) => {
    clearTimer()
    setIsRunning(false)
    setIsComplete(false)
    setHours(0)
    setMinutes(mins)
    setSeconds(0)
    setRemaining(0)
    setTotalSeconds(0)
  }

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const elapsed = totalSeconds > 0 ? totalSeconds - remaining : 0
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)

  const digits = {
    fontFamily: 'var(--tb-font-display)',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em'
  } as React.CSSProperties

  const fieldLabel = {
    fontFamily: 'var(--tb-font-mono)',
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.textFaint
  } as React.CSSProperties

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: colors.text }}>
      <ToolHeader
        name="Countdown Timer"
        description="Countdown timer with presets and alerts"
        category="productivity"
        icon={Timer}
        serial="countdown-timer"
      />

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '8px 0' }}>
          <div style={{ position: 'relative', width: 280, height: 280 }}>
            <svg width={280} height={280} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={140} cy={140} r={RING_RADIUS} fill="none" stroke={colors.bgDeep} strokeWidth={RING_STROKE} />
              <circle
                cx={140}
                cy={140}
                r={RING_RADIUS}
                fill="none"
                stroke={colors.accent}
                strokeWidth={RING_STROKE}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                animation: isComplete ? 'pulse 0.6s ease-in-out 5' : 'none'
              }}
            >
              <Clock size={22} color={colors.textSecondary} style={{ marginBottom: 8 }} />
              <span style={{ ...digits, fontSize: 56, lineHeight: 1 }}>
                {remaining > 0 ? formatTime(remaining) : formatTime(hours * 3600 + minutes * 60 + seconds)}
              </span>
              <span
                style={{
                  marginTop: 8,
                  fontFamily: 'var(--tb-font-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: isComplete ? colors.warning : isRunning ? colors.textSecondary : colors.textFaint
                }}
              >
                {isComplete ? "Time's up!" : isRunning ? 'Running...' : 'Ready'}
              </span>
            </div>
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.08); opacity: 0.7; }
            }
          `}</style>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
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

      {!isRunning && remaining === 0 && (
        <Card>
          <SectionLabel>Duration</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => setHours(Math.max(0, Math.min(23, +e.target.value)))}
                style={{ width: 72, height: 56, textAlign: 'center', fontSize: 24 }}
              />
              <span style={fieldLabel}>Hours</span>
            </div>
            <span
              style={{
                ...digits,
                fontSize: 22,
                color: colors.textFaint,
                height: 56,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              :
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, +e.target.value)))}
                style={{ width: 72, height: 56, textAlign: 'center', fontSize: 24 }}
              />
              <span style={fieldLabel}>Min</span>
            </div>
            <span
              style={{
                ...digits,
                fontSize: 22,
                color: colors.textFaint,
                height: 56,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              :
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, +e.target.value)))}
                style={{ width: 72, height: 56, textAlign: 'center', fontSize: 24 }}
              />
              <span style={fieldLabel}>Sec</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 16 }}>
            {PRESETS.map((m) => (
              <Button key={m} variant="secondary" size="sm" onClick={() => handlePreset(m)}>
                {m}m
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
