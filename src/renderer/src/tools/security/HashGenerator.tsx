import { useState, useCallback } from 'react'
import { Hash, Copy, Check, Zap } from 'lucide-react'
import { useThemeColors } from '@/lib/theme'

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-512', 'MD5'] as const
type Algorithm = typeof ALGORITHMS[number]

async function computeHash(algorithm: Algorithm, input: string): Promise<string> {
  if (algorithm === 'MD5') {
    return computeMD5(input)
  }
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const algoMap: Record<string, string> = {
    'SHA-1': 'SHA-1',
    'SHA-256': 'SHA-256',
    'SHA-512': 'SHA-512'
  }
  const hashBuffer = await crypto.subtle.digest(algoMap[algorithm], data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function computeMD5(input: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3]
    a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586)
    c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330)
    a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426)
    c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983)
    a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417)
    c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162)
    a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101)
    c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329)
    a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632)
    c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302)
    a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083)
    c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848)
    a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690)
    c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501)
    a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784)
    c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734)
    a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463)
    c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556)
    a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353)
    c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640)
    a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222)
    c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189)
    a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835)
    c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651)
    a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415)
    c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055)
    a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606)
    c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799)
    a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744)
    c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649)
    a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379)
    c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551)
    x[0] = add32(a, x[0]); x[1] = add32(b, x[1])
    x[2] = add32(c, x[2]); x[3] = add32(d, x[3])
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t))
    return add32((a << s) | (a >>> (32 - s)), b)
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | (~b & d), a, b, x, s, t) }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & ~d), a, b, x, s, t) }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t) }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | ~d), a, b, x, s, t) }
  function md51(s: string) {
    const n = s.length
    let state = [1732584193, -271733879, -1732584194, 271733878]
    let i: number
    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)))
    }
    s = s.substring(i - 64)
    const tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3)
    }
    tail[i >> 2] |= 0x80 << ((i % 4) << 3)
    if (i > 55) {
      md5cycle(state, tail)
      for (i = 0; i < 16; i++) tail[i] = 0
    }
    tail[14] = n * 8
    md5cycle(state, tail)
    return state
  }
  function md5blk(s: string) {
    const md5blks = []
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24)
    }
    return md5blks
  }
  const hex_chr = '0123456789abcdef'.split('')
  function rhex(n: number) {
    let s = ''
    for (let j = 0; j < 4; j++) {
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F]
    }
    return s
  }
  function hex(x: number[]) {
    return x.map(rhex).join('')
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xFFFFFFFF
  }
  return hex(md51(input))
}

export function HashGenerator() {
  const colors = useThemeColors()
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256')
  const [hash, setHash] = useState('')
  const [copied, setCopied] = useState(false)

  const generateHash = useCallback(async () => {
    if (!input) { setHash(''); return }
    try {
      const result = await computeHash(algorithm, input)
      setHash(result)
      setCopied(false)
    } catch {
      setHash('Error generating hash')
    }
  }, [input, algorithm])

  const copyHash = async () => {
    if (!hash) return
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Hash size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Hash Generator</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Compute cryptographic hashes from text using SHA-1, SHA-256, SHA-512, or MD5 algorithms.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, color: colors.textSecondary, marginBottom: 10 }}>Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          style={{
            width: '100%',
            minHeight: 160,
            padding: 16,
            background: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            color: colors.text,
            fontSize: 15,
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            lineHeight: 1.6
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {ALGORITHMS.map((algo) => (
          <button
            key={algo}
            onClick={() => setAlgorithm(algo)}
            style={{
              padding: '10px 20px',
              background: algorithm === algo ? colors.accent : 'transparent',
              color: algorithm === algo ? '#fff' : colors.text,
              border: `1px solid ${algorithm === algo ? colors.accent : colors.border}`,
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: algorithm === algo ? 600 : 400
            }}
          >
            {algo}
          </button>
        ))}
      </div>

      <button
        onClick={generateHash}
        style={{
          padding: '14px 28px',
          background: colors.accent,
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 32
        }}
      >
        <Zap size={18} />
        Generate Hash
      </button>

      {hash && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: colors.textSecondary }}>Result ({algorithm})</span>
            <button
              onClick={copyHash}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div
            style={{
              padding: 16,
              background: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              fontFamily: 'monospace',
              fontSize: 14,
              wordBreak: 'break-all',
              color: colors.text,
              lineHeight: 1.6
            }}
          >
            {hash}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: colors.textSecondary, display: 'flex', gap: 16 }}>
            <span>📊 Bits: {hash.length * 4}</span>
            <span style={{ color: colors.border }}>|</span>
            <span>📊 Chars: {hash.length}</span>
            <span style={{ color: colors.border }}>|</span>
            <span>📊 Algorithm: {algorithm}</span>
          </div>
        </div>
      )}
    </div>
  )
}
