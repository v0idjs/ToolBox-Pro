import { registerTools } from '@/lib/tool-registry'
import { PasswordGenerator } from '@/tools/security/PasswordGenerator'
import { HashGenerator } from '@/tools/security/HashGenerator'
import { HashChecker } from '@/tools/security/HashChecker'
import { Base64Tool } from '@/tools/security/Base64Tool'
import { JWTDecoder } from '@/tools/security/JWTDecoder'
import { PasswordStrengthAnalyzer } from '@/tools/security/PasswordStrengthAnalyzer'
import { SecretScanner } from '@/tools/security/SecretScanner'

export function registerSecurityTools() {
  registerTools([
    {
      id: 'password-generator',
      name: 'Password Generator',
      description: 'Generate secure random passwords with customizable options',
      icon: 'Key',
      category: 'security',
      keywords: ['password', 'generate', 'random', 'secure', 'credential'],
      render: () => <PasswordGenerator />
    },
    {
      id: 'password-strength',
      name: 'Password Strength Analyzer',
      description: 'Analyze password entropy, detect patterns, and estimate crack time',
      icon: 'Shield',
      category: 'security',
      keywords: ['password', 'strength', 'entropy', 'crack', 'analyze', 'pattern'],
      render: () => <PasswordStrengthAnalyzer />
    },
    {
      id: 'secret-scanner',
      name: 'Secret Scanner',
      description: 'Detect leaked API keys, tokens, and credentials in code',
      icon: 'ShieldAlert',
      category: 'security',
      keywords: ['secret', 'scan', 'api', 'key', 'token', 'credential', 'leak'],
      render: () => <SecretScanner />
    },
    {
      id: 'hash-generator',
      name: 'Hash Generator',
      description: 'Generate SHA-1, SHA-256, and SHA-512 hashes',
      icon: 'Lock',
      category: 'security',
      keywords: ['hash', 'sha', 'sha256', 'sha512', 'sha1', 'digest'],
      render: () => <HashGenerator />
    },
    {
      id: 'hash-checker',
      name: 'Hash Checker',
      description: 'Compare two hashes to verify integrity',
      icon: 'CheckCircle',
      category: 'security',
      keywords: ['hash', 'compare', 'verify', 'integrity', 'check'],
      render: () => <HashChecker />
    },
    {
      id: 'base64',
      name: 'Base64 Encoder/Decoder',
      description: 'Encode and decode Base64 strings',
      icon: 'Binary',
      category: 'security',
      keywords: ['base64', 'encode', 'decode', 'transform'],
      render: () => <Base64Tool />
    },
    {
      id: 'jwt-decoder',
      name: 'JWT Decoder',
      description: 'Decode and inspect JSON Web Tokens',
      icon: 'Key',
      category: 'security',
      keywords: ['jwt', 'token', 'decode', 'json', 'web'],
      render: () => <JWTDecoder />
    }
  ])
}
