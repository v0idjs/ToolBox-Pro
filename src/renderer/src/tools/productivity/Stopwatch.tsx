import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, RotateCcw, Flag, Zap, Clock } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'
import { ToolHeader, Button, Card, SectionLabel } from '@/components/ui'

interface Lap {
  id: number
  lapTime: number
  totalTime: number
}

function formatTime(ms: number): string {
  const totalMs = Math.floor(ms)
  const hours = Math.floor(totalMs / 3600000)
  const minutes = Math.floor((totalMs % 3600000) / 60000)
  const seconds = Math.floor((totalMs % 60000) / 1000)
  const centiseconds = Math.floor((totalMs % 1000) / 10)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
}

function formatLapTime(ms: number): string {
  const totalMs = Math.floor(ms)
  const minutes = Math.floor(totalMs / 60000)
  const seconds = Math.floor((totalMs % 60000) / 1000)
  const centiseconds = Math.floor((totalMs % 1000) / 10)

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
  }
  return `${seconds}.${String(centiseconds).padStart(2, '0')}`
}

export function Stopwatch() {
  const colors = useThemeColors()
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)
  const lapIdCounterRef = useRef(0)

  const tick = useCallback(() => {
    setTime(performance.now() - startTimeRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    startTimeRef.current = performance.now() - pausedAtRef.current
    rafRef.current = requestAnimationFrame(tick)
    setIsRunning(true)
  }, [tick])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    pausedAtRef.current = performance.now() - startTimeRef.current
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setTime(0)
    setIsRunning(false)
    pausedAtRef.current = 0
    startTimeRef.current = 0
    setLaps([])
    lapIdCounterRef.current = 0
  }, [])

  const lap = useCallback(() => {
    if (!isRunning) return
    const currentElapsed = performance.now() - startTimeRef.current

    setLaps((prev) => {
      const lastLapTotal = prev.length > 0 ? prev[prev.length - 1].totalTime : 0
      const lapTime = currentElapsed - lastLapTotal
      lapIdCounterRef.current += 1
      return [
        ...prev,
        { id: lapIdCounterRef.current, lapTime, totalTime: currentElapsed }
      ]
    })
  }, [isRunning])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const fastestLap = laps.length > 1 ? laps.reduce((min, l) => (l.lapTime < min.lapTime ? l : min), laps[0]) : null
  const slowestLap = laps.length > 1 ? laps.reduce((max, l) => (l.lapTime > max.lapTime ? l : max), laps[0]) : null

  const digits = {
    fontFamily: 'var(--tb-font-display)',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em'
  } as React.CSSProperties

  const badge = (color: string): React.CSSProperties => ({
    padding: '2px 6px',
    borderRadius: 3,
    border: `1px solid ${color}`,
    color,
    fontFamily: 'var(--tb-font-mono)',
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: colors.text }}>
      <ToolHeader
        name="Stopwatch"
        description="Precision stopwatch with lap tracking"
        category="productivity"
        icon={Clock}
        serial="stopwatch"
      />

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '8px 0' }}>
          <div style={{ ...digits, fontSize: 64, lineHeight: 1 }}>{formatTime(time)}</div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isRunning ? (
              <Button variant="primary" icon={Zap} onClick={start}>
                Start
              </Button>
            ) : (
              <Button
                variant="ghost"
                icon={Pause}
                onClick={stop}
                style={{ color: colors.error, border: `1px solid ${colors.error}` }}
              >
                Stop
              </Button>
            )}
            <Button variant="ghost" icon={RotateCcw} onClick={reset}>
              Reset
            </Button>
            <Button variant="secondary" icon={Flag} onClick={lap} disabled={!isRunning}>
              Lap
            </Button>
          </div>

          {laps.length === 0 && (
            <span
              style={{
                fontFamily: 'var(--tb-font-mono)',
                fontSize: 11,
                letterSpacing: '0.04em',
                color: colors.textFaint
              }}
            >
              Press Start, then Lap to record laps
            </span>
          )}
        </div>
      </Card>

      {laps.length > 0 && (
        <Card>
          <SectionLabel hint={`${laps.length} recorded`}>Laps</SectionLabel>
          <div style={{ maxHeight: 350, overflowY: 'auto' }}>
            {[...laps].reverse().map((lapEntry, index) => {
              const realIndex = laps.length - index
              const isFastest = fastestLap && lapEntry.id === fastestLap.id
              const isSlowest = slowestLap && lapEntry.id === slowestLap.id

              return (
                <div
                  key={lapEntry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 4px',
                    ...(index > 0 ? { borderTop: `1px solid ${colors.border}` } : {})
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 12,
                      color: colors.textSecondary,
                      minWidth: 40
                    }}
                  >
                    #{realIndex}
                  </span>
                  {isFastest ? (
                    <span style={badge(colors.success)}>Fastest</span>
                  ) : isSlowest ? (
                    <span style={badge(colors.error)}>Slowest</span>
                  ) : null}
                  <span
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontVariantNumeric: 'tabular-nums',
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.text
                    }}
                  >
                    {formatLapTime(lapEntry.lapTime)}
                  </span>
                  <span
                    style={{
                      minWidth: 96,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontFamily: 'var(--tb-font-mono)',
                      fontSize: 12.5,
                      color: colors.textSecondary
                    }}
                  >
                    {formatLapTime(lapEntry.totalTime)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
