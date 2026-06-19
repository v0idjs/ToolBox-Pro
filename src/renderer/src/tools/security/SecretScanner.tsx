import { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, Check, Copy } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

interface SecretPattern {
  id: string;
  name: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  regex: string;
  flags: string;
  description: string;
}

interface Finding {
  line: number;
  column: number;
  match: string;
  context: string;
  pattern: SecretPattern;
}

const SECRET_PATTERNS: SecretPattern[] = [
  // ============================================================
  // HIGH — Direct account access (API keys, tokens, secrets)
  // ============================================================

  // Cloud Providers
  {
    id: 'aws-access-key',
    name: 'AWS Access Key ID',
    severity: 'high',
    category: 'Cloud',
    regex: '\\b(AKIA[0-9A-Z]{16})\\b',
    flags: 'g',
    description: 'AWS IAM access key — grants direct access to AWS services',
  },
  {
    id: 'aws-secret-key',
    name: 'AWS Secret Access Key',
    severity: 'high',
    category: 'Cloud',
    regex: '\\b(?:aws_secret_access_key|aws_secret_key|AWS_SECRET_ACCESS_KEY)\\s*[:=]\\s*[\'"]?([A-Za-z0-9/+=]{40})[\'"]?',
    flags: 'gi',
    description: 'AWS secret access key — pairs with access key ID for authentication',
  },
  {
    id: 'aws-session-token',
    name: 'AWS Session Token',
    severity: 'high',
    category: 'Cloud',
    regex: '\\b(?:aws_session_token|AWS_SESSION_TOKEN)\\s*[:=]\\s*[\'"]?([A-Za-z0-9/+=]{100,})[\'"]?',
    flags: 'gi',
    description: 'AWS temporary session token',
  },
  {
    id: 'gcp-service-account',
    name: 'GCP Service Account Key',
    severity: 'high',
    category: 'Cloud',
    regex: '"type"\\s*:\\s*"service_account"',
    flags: 'g',
    description: 'Google Cloud service account key — full access to GCP resources',
  },
  {
    id: 'gcp-api-key',
    name: 'Google API Key',
    severity: 'high',
    category: 'Cloud',
    regex: '\\b(AIza[0-9A-Za-z\\-_]{35})\\b',
    flags: 'g',
    description: 'Google Cloud API key — restrict by service in console',
  },
  {
    id: 'gcp-oauth-secret',
    name: 'Google OAuth Client Secret',
    severity: 'high',
    category: 'Cloud',
    regex: '\\b(?:client_secret|oauth_secret|GOOGLE_CLIENT_SECRET)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{24,50})[\'"]?',
    flags: 'gi',
    description: 'Google OAuth2 client secret — enables token refresh',
  },
  {
    id: 'azure-connection',
    name: 'Azure Connection String',
    severity: 'high',
    category: 'Cloud',
    regex: '\\b(DefaultEndpointsProtocol=https?;AccountName=[^;]+;AccountKey=[A-Za-z0-9/+=]{44,};AccountType=\\w+)',
    flags: 'gi',
    description: 'Azure Storage connection string — full access to storage account',
  },
  {
    id: 'azure-sas-token',
    name: 'Azure SAS Token',
    severity: 'high',
    category: 'Cloud',
    regex: '\\b(Sig=[A-Za-z0-9%]{32,})\\b',
    flags: 'g',
    description: 'Azure shared access signature token',
  },

  // Source Control
  {
    id: 'github-token',
    name: 'GitHub Personal Access Token',
    severity: 'high',
    category: 'Source Control',
    regex: '\\b(ghp_[A-Za-z0-9]{36})\\b',
    flags: 'g',
    description: 'GitHub classic PAT — full repo and user access',
  },
  {
    id: 'github-fine-grained',
    name: 'GitHub Fine-Grained Token',
    severity: 'high',
    category: 'Source Control',
    regex: '\\b(github_pat_[A-Za-z0-9_]{82})\\b',
    flags: 'g',
    description: 'GitHub fine-grained personal access token',
  },
  {
    id: 'github-oauth',
    name: 'GitHub OAuth Token',
    severity: 'high',
    category: 'Source Control',
    regex: '\\b(gho_[A-Za-z0-9]{36}|ghu_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36}|ghr_[A-Za-z0-9]{36})\\b',
    flags: 'g',
    description: 'GitHub OAuth/app token (user-to-server, server-to-server)',
  },
  {
    id: 'github-app-pem',
    name: 'GitHub App Private Key',
    severity: 'high',
    category: 'Source Control',
    regex: '-----BEGIN RSA PRIVATE KEY-----[\\s\\S]*?-----END RSA PRIVATE KEY-----',
    flags: 'g',
    description: 'GitHub App private key (PEM) — impersonates the app installation',
  },
  {
    id: 'gitlab-token',
    name: 'GitLab Personal Access Token',
    severity: 'high',
    category: 'Source Control',
    regex: '\\b(glpat-[A-Za-z0-9\\-_]{20,})\\b',
    flags: 'g',
    description: 'GitLab personal access token',
  },
  {
    id: 'gitlab-pipeline-token',
    name: 'GitLab Pipeline Token',
    severity: 'high',
    category: 'Source Control',
    regex: '\\b(glptt-[A-Za-z0-9\\-_]{20,})\\b',
    flags: 'g',
    description: 'GitLab pipeline trigger token',
  },
  {
    id: 'gitlab-runner-token',
    name: 'GitLab Runner Token',
    severity: 'high',
    category: 'Source Control',
    regex: '\\b(glcrt-[A-Za-z0-9\\-_]{20,})\\b',
    flags: 'g',
    description: 'GitLab CI/CD runner authentication token',
  },
  {
    id: 'bitbucket-app-password',
    name: 'Bitbucket App Password',
    severity: 'high',
    category: 'Source Control',
    regex: '\\b(?:BITBUCKET_APP_PASSWORD|bitbucket_app_password)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{20,})[\'"]?',
    flags: 'gi',
    description: 'Bitbucket app password — scoped API access',
  },
  {
    id: 'bitbucket-token',
    name: 'Bitbucket Access Token',
    severity: 'high',
    category: 'Source Control',
    regex: '\\b(?:BITBUCKET_ACCESS_TOKEN|bitbucket_access_token)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{40,})[\'"]?',
    flags: 'gi',
    description: 'Bitbucket OAuth2 access token',
  },

  // AI / ML Platforms
  {
    id: 'openai-key',
    name: 'OpenAI API Key',
    severity: 'high',
    category: 'AI/ML',
    regex: '\\b(sk-[A-Za-z0-9]{48,})\\b',
    flags: 'g',
    description: 'OpenAI API key — billing access to GPT, DALL-E, Whisper',
  },
  {
    id: 'openai-project-key',
    name: 'OpenAI Project Key',
    severity: 'high',
    category: 'AI/ML',
    regex: '\\b(sk-proj-[A-Za-z0-9\\-_]{40,})\\b',
    flags: 'g',
    description: 'OpenAI project-scoped API key',
  },
  {
    id: 'anthropic-key',
    name: 'Anthropic API Key',
    severity: 'high',
    category: 'AI/ML',
    regex: '\\b(sk-ant-[A-Za-z0-9\\-_]{40,})\\b',
    flags: 'g',
    description: 'Anthropic API key — access to Claude models',
  },
  {
    id: 'cohere-key',
    name: 'Cohere API Key',
    severity: 'high',
    category: 'AI/ML',
    regex: '\\b(?:COHERE_API_KEY|cohere_api_key)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{40,})[\'"]?',
    flags: 'gi',
    description: 'Cohere API key',
  },
  {
    id: 'huggingface-token',
    name: 'HuggingFace Token',
    severity: 'high',
    category: 'AI/ML',
    regex: '\\b(hf_[A-Za-z0-9]{34,})\\b',
    flags: 'g',
    description: 'HuggingFace personal access token',
  },
  {
    id: 'mistral-key',
    name: 'Mistral API Key',
    severity: 'high',
    category: 'AI/ML',
    regex: '\\b(?:MISTRAL_API_KEY|mistral_api_key)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{32,})[\'"]?',
    flags: 'gi',
    description: 'Mistral AI API key',
  },
  {
    id: 'replicate-token',
    name: 'Replicate API Token',
    severity: 'high',
    category: 'AI/ML',
    regex: '\\b(r8_[A-Za-z0-9]{40,})\\b',
    flags: 'g',
    description: 'Replicate API token',
  },
  {
    id: 'pinecone-key',
    name: 'Pinecone API Key',
    severity: 'high',
    category: 'AI/ML',
    regex: '\\b(?:PINECONE_API_KEY|pinecone_api_key)\\s*[:=]\\s*[\'"]?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})[\'"]?',
    flags: 'gi',
    description: 'Pinecone vector database API key',
  },
  {
    id: 'weaviate-key',
    name: 'Weaviate API Key',
    severity: 'high',
    category: 'AI/ML',
    regex: '\\b(?:WEAVIATE_API_KEY|weaviate_api_key)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{20,})[\'"]?',
    flags: 'gi',
    description: 'Weaviate vector database API key',
  },

  // Platform Tokens
  {
    id: 'github-token',
    name: 'GitHub Token',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|ghu_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36}|ghr_[A-Za-z0-9]{36})\\b',
    flags: 'g',
    description: 'GitHub personal access token or OAuth token',
  },
  {
    id: 'gitlab-token',
    name: 'GitLab Token',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(glpat-[A-Za-z0-9\\-_]{20,})\\b',
    flags: 'g',
    description: 'GitLab personal access token',
  },
  {
    id: 'slack-token',
    name: 'Slack Token',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(xox[bpoas]-[A-Za-z0-9\\-]{10,})\\b',
    flags: 'g',
    description: 'Slack bot/user/app token — full workspace access',
  },
  {
    id: 'stripe-secret',
    name: 'Stripe Secret Key',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(sk_live_[A-Za-z0-9]{24,})\\b',
    flags: 'g',
    description: 'Stripe live secret key — full API access',
  },
  {
    id: 'stripe-restricted',
    name: 'Stripe Restricted Key',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(rk_live_[A-Za-z0-9]{24,})\\b',
    flags: 'g',
    description: 'Stripe restricted API key',
  },
  {
    id: 'stripe-test',
    name: 'Stripe Test Key',
    severity: 'medium',
    category: 'Platform',
    regex: '\\b(sk_test_[A-Za-z0-9]{24,})\\b',
    flags: 'g',
    description: 'Stripe test-mode secret key (lower risk but still sensitive)',
  },
  {
    id: 'shopify-token',
    name: 'Shopify Access Token',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(shpat_[A-Za-z0-9]{32})\\b',
    flags: 'g',
    description: 'Shopify private app access token',
  },
  {
    id: 'shopify-admin',
    name: 'Shopify Admin API Token',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(shppa_[A-Za-z0-9]{32})\\b',
    flags: 'g',
    description: 'Shopify Admin API access token',
  },
  {
    id: 'npm-token',
    name: 'NPM Access Token',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(npm_[A-Za-z0-9]{36})\\b',
    flags: 'g',
    description: 'NPM publish token — full package access',
  },
  {
    id: 'pypi-token',
    name: 'PyPI API Token',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(pypi-[A-Za-z0-9\\-_]{50,})\\b',
    flags: 'g',
    description: 'PyPI API token — publish to any project',
  },
  {
    id: 'rubygems-key',
    name: 'RubyGems API Key',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(?:RUBYGEMS_API_KEY|rubygems_api_key)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{40,})[\'"]?',
    flags: 'gi',
    description: 'RubyGems API key — gem push access',
  },
  {
    id: 'dockerhub-token',
    name: 'DockerHub Access Token',
    severity: 'high',
    category: 'Platform',
    regex: '\\b(?:DOCKERHUB_TOKEN|dockerhub_token)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{20,})[\'"]?',
    flags: 'gi',
    description: 'DockerHub personal access token',
  },

  // Communication / Messaging
  {
    id: 'telegram-bot',
    name: 'Telegram Bot Token',
    severity: 'high',
    category: 'Communication',
    regex: '\\b([0-9]{8,10}:[A-Za-z0-9_-]{35})\\b',
    flags: 'g',
    description: 'Telegram bot token — can send/receive messages',
  },
  {
    id: 'discord-bot-token',
    name: 'Discord Bot Token',
    severity: 'high',
    category: 'Communication',
    regex: '\\b([MN][A-Za-z\\d]{23,27}\\.[A-Za-z\\d_-]{6}\\.[A-Za-z\\d_-]{27,})\\b',
    flags: 'g',
    description: 'Discord bot token — full bot access',
  },
  {
    id: 'discord-user-token',
    name: 'Discord User Token',
    severity: 'high',
    category: 'Communication',
    regex: '\\b([MN][A-Za-z\\d]{23,27})\\b',
    flags: 'g',
    description: 'Discord user token (against ToS, high risk)',
  },

  // CI/CD
  {
    id: 'circleci-token',
    name: 'CircleCI Token',
    severity: 'high',
    category: 'CI/CD',
    regex: '\\b(?:CIRCLECI_TOKEN|circleci_token|CIRCLE_TOKEN)\\s*[:=]\\s*[\'"]?([a-f0-9]{40})[\'"]?',
    flags: 'gi',
    description: 'CircleCI personal API token',
  },
  {
    id: 'travis-ci-token',
    name: 'Travis CI Token',
    severity: 'high',
    category: 'CI/CD',
    regex: '\\b(?:TRAVIS_CI_TOKEN|travis_ci_token|TRAVIS_TOKEN)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{20,})[\'"]?',
    flags: 'gi',
    description: 'Travis CI access token',
  },
  {
    id: 'circleci-api-key',
    name: 'CircleCI API Key',
    severity: 'high',
    category: 'CI/CD',
    regex: '\\b(?:CIRCLECI_API_KEY|circleci_api_key)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{40})[\'"]?',
    flags: 'gi',
    description: 'CircleCI API key',
  },
  {
    id: 'github-actions-secret',
    name: 'GitHub Actions Secret',
    severity: 'medium',
    category: 'CI/CD',
    regex: '\\b(?:secrets\\.[A-Z_]+)\\b',
    flags: 'g',
    description: 'GitHub Actions secret reference (informational)',
  },

  // Hosting / Deployment
  {
    id: 'vercel-token',
    name: 'Vercel Access Token',
    severity: 'high',
    category: 'Hosting',
    regex: '\\b(?:VERCEL_TOKEN|vercel_token)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{24,})[\'"]?',
    flags: 'gi',
    description: 'Vercel deployment and project management token',
  },
  {
    id: 'netlify-token',
    name: 'Netlify Access Token',
    severity: 'high',
    category: 'Hosting',
    regex: '\\b(?:NETLIFY_AUTH_TOKEN|netlify_auth_token)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{40,})[\'"]?',
    flags: 'gi',
    description: 'Netlify personal access token',
  },
  {
    id: 'heroku-api-key',
    name: 'Heroku API Key',
    severity: 'high',
    category: 'Hosting',
    regex: '\\b(?:HEROKU_API_KEY|heroku_api_key)\\s*[:=]\\s*[\'"]?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})[\'"]?',
    flags: 'gi',
    description: 'Heroku API key — full platform access',
  },
  {
    id: 'cloudflare-api-token',
    name: 'Cloudflare API Token',
    severity: 'high',
    category: 'Hosting',
    regex: '\\b(?:CLOUDFLARE_API_TOKEN|cloudflare_api_token)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{40,})[\'"]?',
    flags: 'gi',
    description: 'Cloudflare scoped API token',
  },
  {
    id: 'cloudflare-global-key',
    name: 'Cloudflare Global API Key',
    severity: 'high',
    category: 'Hosting',
    regex: '\\b(?:CLOUDFLARE_API_KEY|cloudflare_api_key|CF_API_KEY)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{37})[\'"]?',
    flags: 'gi',
    description: 'Cloudflare Global API key — unrestricted account access',
  },
  {
    id: 'flyctl-token',
    name: 'Fly.io API Token',
    severity: 'high',
    category: 'Hosting',
    regex: '\\b(?:FLY_API_TOKEN|fly_api_token)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{20,})[\'"]?',
    flags: 'gi',
    description: 'Fly.io deployment token',
  },

  // DevOps / Monitoring
  {
    id: 'datadog-api-key',
    name: 'Datadog API Key',
    severity: 'high',
    category: 'DevOps',
    regex: '\\b(?:DATADOG_API_KEY|datadog_api_key|DD_API_KEY)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{32})[\'"]?',
    flags: 'gi',
    description: 'Datadog API key — metrics and events submission',
  },
  {
    id: 'datadog-app-key',
    name: 'Datadog App Key',
    severity: 'high',
    category: 'DevOps',
    regex: '\\b(?:DATADOG_APP_KEY|datadog_app_key|DD_APP_KEY)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{40})[\'"]?',
    flags: 'gi',
    description: 'Datadog application key — read access to dashboards and data',
  },
  {
    id: 'pagerduty-token',
    name: 'PagerDuty API Token',
    severity: 'high',
    category: 'DevOps',
    regex: '\\b(?:PAGERDUTY_TOKEN|pagerduty_token|PD_API_KEY)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{20,})[\'"]?',
    flags: 'gi',
    description: 'PagerDuty API token — incident management access',
  },
  {
    id: 'pagerduty-integration',
    name: 'PagerDuty Integration Key',
    severity: 'medium',
    category: 'DevOps',
    regex: '\\b(?:PAGERDUTY_INTEGRATION_KEY|pagerduty_integration_key)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{32})[\'"]?',
    flags: 'gi',
    description: 'PagerDuty Events API v2 integration key',
  },
  {
    id: 'vault-token',
    name: 'HashiCorp Vault Token',
    severity: 'high',
    category: 'DevOps',
    regex: '\\b(?:VAULT_TOKEN|vault_token|HCV_TOKEN)\\s*[:=]\\s*[\'"]?(s\\.[A-Za-z0-9]{24,})[\'"]?',
    flags: 'gi',
    description: 'HashiCorp Vault service token',
  },
  {
    id: 'vault-root-token',
    name: 'Vault Root Token',
    severity: 'high',
    category: 'DevOps',
    regex: '\\b(?:VAULT_ROOT_TOKEN|vault_root_token)\\s*[:=]\\s*[\'"]?(hvs\\.[A-Za-z0-9]{24,})[\'"]?',
    flags: 'gi',
    description: 'HashiCorp Vault root token — full unseal access',
  },
  {
    id: 'consul-token',
    name: 'Consul Token',
    severity: 'high',
    category: 'DevOps',
    regex: '\\b(?:CONSUL_HTTP_TOKEN|consul_http_token)\\s*[:=]\\s*[\'"]?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})[\'"]?',
    flags: 'gi',
    description: 'HashiCorp Consul ACL token',
  },
  {
    id: 'newrelic-key',
    name: 'New Relic API Key',
    severity: 'high',
    category: 'DevOps',
    regex: '\\b(?:NEW_RELIC_API_KEY|new_relic_api_key|NRAK-[A-Z0-9]{27})\\b',
    flags: 'g',
    description: 'New Relic Insights API key',
  },
  {
    id: 'newrelic-license',
    name: 'New Relic License Key',
    severity: 'high',
    category: 'DevOps',
    regex: '\\b(?:NEW_RELIC_LICENSE_KEY|new_relic_license_key)\\s*[:=]\\s*[\'"]?([A-Za-z0-9]{32})[\'"]?',
    flags: 'gi',
    description: 'New Relic license key — metric ingestion',
  },
  {
    id: 'sentry-dsn',
    name: 'Sentry DSN',
    severity: 'medium',
    category: 'DevOps',
    regex: '\\b(https://[a-f0-9]{32}@[a-z0-9\\.-]+\\.ingest\\.sentry\\.io/[0-9]+)\\b',
    flags: 'gi',
    description: 'Sentry DSN with embedded key (informational)',
  },
  {
    id: 'sentry-auth-token',
    name: 'Sentry Auth Token',
    severity: 'high',
    category: 'DevOps',
    regex: '\\b(?:SENTRY_AUTH_TOKEN|sentry_auth_token)\\s*[:=]\\s*[\'"]?(sntrys_[A-Za-z0-9_]{50,})[\'"]?',
    flags: 'gi',
    description: 'Sentry organization auth token',
  },

  // Kubernetes / Infrastructure
  {
    id: 'k8s-service-account',
    name: 'Kubernetes Service Account Token',
    severity: 'high',
    category: 'Infrastructure',
    regex: '\\b(?:K8S_SERVICE_ACCOUNT_TOKEN|k8s_token|KUBERNETES_SERVICE_ACCOUNT_TOKEN)\\s*[:=]\\s*[\'"]?(eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)[\'"]?',
    flags: 'gi',
    description: 'Kubernetes service account JWT — cluster access',
  },
  {
    id: 'k8s-kubeconfig',
    name: 'Kubernetes Kubeconfig',
    severity: 'high',
    category: 'Infrastructure',
    regex: 'apiVersion:\\s*v1[\\s\\S]*?client-key-data:\\s*([A-Za-z0-9/+=]{100,})',
    flags: 'g',
    description: 'Kubernetes kubeconfig with embedded credentials',
  },
  {
    id: 'docker-config',
    name: 'Docker Config JSON',
    severity: 'high',
    category: 'Infrastructure',
    regex: '"auths"\\s*:\\s*\\{[^}]*"auth"\\s*:\\s*"[A-Za-z0-9/+=]+"',
    flags: 'g',
    description: 'Docker config.json with registry credentials',
  },

  // Communication
  {
    id: 'telegram-bot-token',
    name: 'Telegram Bot Token',
    severity: 'high',
    category: 'Communication',
    regex: '\\b([0-9]{8,10}:[A-Za-z0-9_-]{35})\\b',
    flags: 'g',
    description: 'Telegram Bot API token',
  },
  {
    id: 'discord-bot-token',
    name: 'Discord Bot Token',
    severity: 'high',
    category: 'Communication',
    regex: '\\b([MN][A-Za-z\\d]{23,27})\\.[A-Za-z\\d_-]{6}\\.[A-Za-z\\d_-]{27,}\\b',
    flags: 'g',
    description: 'Discord bot token — full bot API access',
  },
  {
    id: 'discord-webhook',
    name: 'Discord Webhook URL',
    severity: 'medium',
    category: 'Communication',
    regex: '\\b(https://discord(?:app)?\\.com/api/webhooks/[0-9]+/[A-Za-z0-9_-]+)\\b',
    flags: 'gi',
    description: 'Discord webhook — can post messages to channel',
  },
  {
    id: 'twilio-api-key',
    name: 'Twilio API Key',
    severity: 'high',
    category: 'Communication',
    regex: '\\b(SK[0-9a-fA-F]{32})\\b',
    flags: 'g',
    description: 'Twilio API key',
  },
  {
    id: 'twilio-account-sid',
    name: 'Twilio Account SID',
    severity: 'medium',
    category: 'Communication',
    regex: '\\b(AC[a-f0-9]{32})\\b',
    flags: 'g',
    description: 'Twilio Account SID (identify only, needs Auth Token)',
  },
  {
    id: 'sendgrid-key',
    name: 'SendGrid API Key',
    severity: 'high',
    category: 'Communication',
    regex: '\\b(SG\\.[A-Za-z0-9\\-_]{22}\\.[A-Za-z0-9\\-_]{43})\\b',
    flags: 'g',
    description: 'SendGrid API key — email sending access',
  },
  {
    id: 'mailgun-api-key',
    name: 'Mailgun API Key',
    severity: 'high',
    category: 'Communication',
    regex: '\\b(?:MAILGUN_API_KEY|mailgun_api_key)\\s*[:=]\\s*[\'"]?(key-[A-Za-z0-9]{32})[\'"]?',
    flags: 'gi',
    description: 'Mailgun private API key',
  },
  {
    id: 'mailgun-pub-key',
    name: 'Mailgun Public API Key',
    severity: 'medium',
    category: 'Communication',
    regex: '\\b(?:MAILGUN_PUBKEY|mailgun_pub_key)\\s*[:=]\\s*[\'"]?(pubkey-[A-Za-z0-9]{32})[\'"]?',
    flags: 'gi',
    description: 'Mailgun public API key (lower risk)',
  },
  {
    id: 'mailchimp-key',
    name: 'Mailchimp API Key',
    severity: 'high',
    category: 'Communication',
    regex: '\\b([A-Za-z0-9]{32}-us[0-9]{1,2})\\b',
    flags: 'g',
    description: 'Mailchimp API key — full marketing access',
  },
  {
    id: 'sparkpost-key',
    name: 'SparkPost API Key',
    severity: 'high',
    category: 'Communication',
    regex: '\\b(?:SPARKPOST_API_KEY|sparkpost_api_key)\\s*[:=]\\s*[\'"]?([a-f0-9]{40})[\'"]?',
    flags: 'gi',
    description: 'SparkPost API key',
  },

  // Databases
  {
    id: 'mysql-connection',
    name: 'MySQL Connection String',
    severity: 'high',
    category: 'Database',
    regex: '\\bmysql://[^\\s\'"]+:([^@]+)@[^\\s\'"]+',
    flags: 'gi',
    description: 'MySQL connection with embedded password',
  },
  {
    id: 'postgres-connection',
    name: 'PostgreSQL Connection String',
    severity: 'high',
    category: 'Database',
    regex: '\\b(?:postgres|postgresql)://[^\\s\'"]+:([^@]+)@[^\\s\'"]+',
    flags: 'gi',
    description: 'PostgreSQL connection with embedded password',
  },
  {
    id: 'mongodb-connection',
    name: 'MongoDB Connection String',
    severity: 'high',
    category: 'Database',
    regex: '\\bmongodb(?:\\+srv)?://[^\\s\'"]+:([^@]+)@[^\\s\'"]+',
    flags: 'gi',
    description: 'MongoDB connection with embedded password',
  },
  {
    id: 'redis-connection',
    name: 'Redis Connection String',
    severity: 'high',
    category: 'Database',
    regex: '\\bredis://[^\\s\'"]*:[^@]+@[^\\s\'"]+',
    flags: 'gi',
    description: 'Redis connection with embedded password',
  },
  {
    id: 'amqp-connection',
    name: 'AMQP Connection String',
    severity: 'high',
    category: 'Database',
    regex: '\\bamqps?://[^\\s\'"]*:[^@]+@[^\\s\'"]+',
    flags: 'gi',
    description: 'AMQP/RabbitMQ connection with embedded password',
  },
  {
    id: 'elastic-connection',
    name: 'Elasticsearch Connection String',
    severity: 'high',
    category: 'Database',
    regex: '\\bhttps?://[^\\s\'"]*:[^@]+@[^\\s\'"]+:[0-9]+',
    flags: 'gi',
    description: 'Elasticsearch connection with embedded credentials',
  },

  // Cryptography
  {
    id: 'private-key-pem',
    name: 'Private Key (PEM)',
    severity: 'high',
    category: 'Cryptography',
    regex: '-----BEGIN (?:RSA |EC |DSA |OPENSSH |ED25519 )?PRIVATE KEY-----[\\s\\S]*?-----END (?:RSA |EC |DSA |OPENSSH |ED25519 )?PRIVATE KEY-----',
    flags: 'g',
    description: 'Cryptographic private key — can decrypt and sign',
  },
  {
    id: 'ssh-private-key',
    name: 'SSH Private Key',
    severity: 'high',
    category: 'Cryptography',
    regex: '-----BEGIN OPENSSH PRIVATE KEY-----[\\s\\S]*?-----END OPENSSH PRIVATE KEY-----',
    flags: 'g',
    description: 'SSH private key — remote server access',
  },
  {
    id: 'pgp-private-key',
    name: 'PGP Private Key',
    severity: 'high',
    category: 'Cryptography',
    regex: '-----BEGIN PGP PRIVATE KEY BLOCK-----[\\s\\S]*?-----END PGP PRIVATE KEY BLOCK-----',
    flags: 'g',
    description: 'PGP private key block',
  },
  {
    id: 'jwt-token',
    name: 'JWT Token',
    severity: 'medium',
    category: 'Cryptography',
    regex: '\\beyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\b',
    flags: 'g',
    description: 'JSON Web Token — may contain sensitive claims',
  },
  {
    id: 'generic-api-key',
    name: 'Generic API Key',
    severity: 'medium',
    category: 'General',
    regex: '\\b(?:api[_-]?key|apikey|api[_-]?secret|access[_-]?key|auth[_-]?token|secret[_-]?key|client[_-]?secret)\\s*[:=]\\s*[\'"]([A-Za-z0-9\\-_]{20,})[\'"]',
    flags: 'gi',
    description: 'Generic API key or secret token',
  },
  {
    id: 'generic-password',
    name: 'Hardcoded Password',
    severity: 'medium',
    category: 'General',
    regex: '\\b(?:password|passwd|pwd)\\s*[:=]\\s*[\'"]([^\'"]{8,})[\'"]',
    flags: 'gi',
    description: 'Hardcoded password in source code',
  },

  // Secrets Management
  {
    id: 'doppler-token',
    name: 'Doppler Token',
    severity: 'high',
    category: 'Secrets Management',
    regex: '\\b(dp\\.st\\.[A-Za-z0-9\\-_]{20,}|dp\\.sci\\.[A-Za-z0-9\\-_]{20,})\\b',
    flags: 'g',
    description: 'Doppler service token — secrets access',
  },
  {
    id: 'vault-token',
    name: 'HashiCorp Vault Token',
    severity: 'high',
    category: 'Secrets Management',
    regex: '\\b(s\\.[A-Za-z0-9]{24,}|hvs\\.[A-Za-z0-9]{24,})\\b',
    flags: 'g',
    description: 'HashiCorp Vault service/root token',
  },
  {
    id: '1password-service-account',
    name: '1Password Service Account Token',
    severity: 'high',
    category: 'Secrets Management',
    regex: '\\b(?:OP_SERVICE_ACCOUNT_TOKEN|op_service_account_token)\\s*[:=]\\s*[\'"]?(eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)[\'"]?',
    flags: 'gi',
    description: '1Password service account token',
  },

  // ============================================================
  // MEDIUM — Contextually sensitive
  // ============================================================

  {
    id: 'slack-webhook',
    name: 'Slack Webhook URL',
    severity: 'medium',
    category: 'Communication',
    regex: '\\b(https://hooks\\.slack\\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[A-Za-z0-9]+)\\b',
    flags: 'g',
    description: 'Slack incoming webhook — can post to channel',
  },
  {
    id: 'github-webhook',
    name: 'GitHub Webhook Secret',
    severity: 'medium',
    category: 'Source Control',
    regex: '\\b(?:GITHUB_WEBHOOK_SECRET|github_webhook_secret)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{32,})[\'"]?',
    flags: 'gi',
    description: 'GitHub webhook HMAC secret',
  },
  {
    id: 'stripe-webhook',
    name: 'Stripe Webhook Secret',
    severity: 'medium',
    category: 'Platform',
    regex: '\\b(whsec_[A-Za-z0-9]{32,})\\b',
    flags: 'g',
    description: 'Stripe webhook signing secret',
  },
  {
    id: 'shopify-webhook',
    name: 'Shopify Webhook Secret',
    severity: 'medium',
    category: 'Platform',
    regex: '\\b(?:SHOPIFY_WEBHOOK_SECRET|shopify_webhook_secret)\\s*[:=]\\s*[\'"]?([A-Za-z0-9\\-_]{32,})[\'"]?',
    flags: 'gi',
    description: 'Shopify webhook HMAC secret',
  },
  {
    id: 'sentry-dsn',
    name: 'Sentry DSN',
    severity: 'medium',
    category: 'DevOps',
    regex: '\\b(https://[a-f0-9]{32}@[a-z0-9\\.-]+\\.ingest\\.sentry\\.io/[0-9]+)\\b',
    flags: 'gi',
    description: 'Sentry DSN with embedded key (informational)',
  },
  {
    id: 'connection-string',
    name: 'Database Connection String',
    severity: 'high',
    category: 'Database',
    regex: '\\b(?:mysql|postgres|postgresql|mongodb|redis|mssql|amqp):\\/\\/[^\\s\'"]+',
    flags: 'gi',
    description: 'Database connection string with credentials',
  },
  {
    id: 'internal-url',
    name: 'Internal URL',
    severity: 'low',
    category: 'Informational',
    regex: '\\bhttps?://(?:localhost|127\\.0\\.0\\.1|10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|192\\.168\\.\\d{1,3}\\.\\d{1,3}|172\\.(?:1[6-9]|2\\d|3[01])\\.\\d{1,3}\\.\\d{1,3})(?::[0-9]+)?(?:\\/[^\\s\'"]*)?\\b',
    flags: 'gi',
    description: 'Internal/private network URL (informational)',
  },
  {
    id: 'email-address',
    name: 'Email Address',
    severity: 'low',
    category: 'Informational',
    regex: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
    flags: 'g',
    description: 'Email address (may indicate account owner)',
  },

  // ============================================================
  // LOW — Informational
  // ============================================================

  {
    id: 'aws-account-id',
    name: 'AWS Account ID',
    severity: 'low',
    category: 'Informational',
    regex: '\\b([0-9]{12})\\b',
    flags: 'g',
    description: 'AWS account ID (12-digit, informational)',
  },
  {
    id: 'aws-arn',
    name: 'AWS ARN',
    severity: 'low',
    category: 'Informational',
    regex: '\\b(arn:aws:[a-z0-9-]+:[a-z0-9-]*:[0-9]{12}:[A-Za-z0-9\\-_/.:\\*]+)\\b',
    flags: 'g',
    description: 'AWS Amazon Resource Name (informational)',
  },
  {
    id: 'github-repo',
    name: 'GitHub Repository URL',
    severity: 'low',
    category: 'Informational',
    regex: '\\b(https?://github\\.com/[A-Za-z0-9\\-_]+/[A-Za-z0-9\\-_\\.]+)\\b',
    flags: 'gi',
    description: 'GitHub repository URL (informational)',
  },
  {
    id: 'ip-address',
    name: 'IP Address',
    severity: 'low',
    category: 'Informational',
    regex: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    description: 'IPv4 address (informational)',
  },
  {
    id: 'base64-long',
    name: 'Long Base64 String',
    severity: 'low',
    category: 'Informational',
    regex: '\\b[A-Za-z0-9+/]{40,}={0,2}\\b',
    flags: 'g',
    description: 'Long base64-encoded string (may contain secrets)',
  },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function SecretScanner() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const colors = useThemeColors();

  const findings = useMemo<Finding[]>(() => {
    if (!input) return [];
    const results: Finding[] = [];
    const lines = input.split('\n');
    const seen = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of SECRET_PATTERNS) {
        try {
          const regex = new RegExp(pattern.regex, pattern.flags);
          let match;
          while ((match = regex.exec(line)) !== null) {
            const key = `${pattern.id}:${i}:${match.index}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const start = Math.max(0, match.index - 30);
            const end = Math.min(line.length, match.index + match[0].length + 30);
            const context = (start > 0 ? '...' : '') + line.substring(start, end) + (end < line.length ? '...' : '');

            results.push({
              line: i + 1,
              column: match.index + 1,
              match: match[0],
              context,
              pattern,
            });
          }
        } catch {
          // skip invalid patterns
        }
      }
    }

    return results;
  }, [input]);

  const filteredFindings = useMemo(() => {
    if (filterSeverity === 'all') return findings;
    return findings.filter((f) => f.pattern.severity === filterSeverity);
  }, [findings, filterSeverity]);

  const stats = useMemo(() => {
    const high = findings.filter((f) => f.pattern.severity === 'high').length;
    const medium = findings.filter((f) => f.pattern.severity === 'medium').length;
    const low = findings.filter((f) => f.pattern.severity === 'low').length;
    return { total: findings.length, high, medium, low };
  }, [findings]);

  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    for (const f of findings) {
      cats.set(f.pattern.category, (cats.get(f.pattern.category) || 0) + 1);
    }
    return Array.from(cats.entries()).sort((a, b) => b[1] - a[1]);
  }, [findings]);

  const handleCopy = async () => {
    if (filteredFindings.length === 0) return;
    const text = filteredFindings.map((f) =>
      `[${f.pattern.severity.toUpperCase()}] Line ${f.line}: ${f.pattern.name} — ${f.match}`
    ).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const severityColor = (sev: string) => {
    switch (sev) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#3B82F6';
      default: return colors.textSecondary;
    }
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <ShieldAlert size={28} color={colors.accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Secret Scanner</h1>
        </div>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Detect leaked API keys, tokens, credentials, and private keys in code and config files.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <label style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>Paste Code or Config</label>
          {input && (
            <span style={{ fontSize: 13, color: colors.textSecondary }}>
              {input.split('\n').length} lines | {formatBytes(new Blob([input]).size)}
            </span>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your code, config file, or any text to scan for secrets..."
          style={{
            width: '100%',
            minHeight: 200,
            padding: 16,
            backgroundColor: colors.input,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            fontSize: 15,
            fontFamily: 'ui-monospace, monospace',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
          spellCheck={false}
        />
      </div>

      {input && findings.length === 0 && (
        <div
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: `1px solid rgba(34,197,94,0.3)`,
            borderRadius: 10,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Check size={20} color="#22C55E" />
          <span style={{ fontWeight: 500, fontSize: 15 }}>No secrets detected</span>
        </div>
      )}

      {findings.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => setFilterSeverity('all')}
              style={{
                padding: '8px 16px',
                background: filterSeverity === 'all' ? colors.accent : colors.input,
                color: filterSeverity === 'all' ? colors.text : colors.textSecondary,
                border: `1px solid ${filterSeverity === 'all' ? colors.accent : colors.border}`,
                borderRadius: 8,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: filterSeverity === 'all' ? 500 : 400,
              }}
            >
              All ({stats.total})
            </button>
            {(['high', 'medium', 'low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                style={{
                  padding: '8px 16px',
                  background: filterSeverity === sev ? `${severityColor(sev)}20` : colors.input,
                  color: filterSeverity === sev ? severityColor(sev) : colors.textSecondary,
                  border: `1px solid ${filterSeverity === sev ? severityColor(sev) : colors.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: filterSeverity === sev ? 500 : 400,
                }}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)} ({stats[sev]})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: colors.input,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#EF4444' }}>{stats.high}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' }}>High</div>
            </div>
            <div
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: colors.input,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#F59E0B' }}>{stats.medium}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' }}>Medium</div>
            </div>
            <div
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: colors.input,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#3B82F6' }}>{stats.low}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' }}>Low</div>
            </div>
          </div>

          {categories.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>By Category</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.map(([cat, count]) => (
                  <span
                    key={cat}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: colors.input,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 6,
                      fontSize: 13,
                      color: colors.textSecondary,
                    }}
                  >
                    {cat}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <label style={{ fontSize: 15, fontWeight: 500 }}>
              Findings ({filteredFindings.length} secret{filteredFindings.length !== 1 ? 's' : ''})
            </label>
            <button
              onClick={handleCopy}
              disabled={filteredFindings.length === 0}
              style={{
                padding: '8px 16px',
                background: copied ? '#22C55E' : 'transparent',
                color: copied ? '#fff' : colors.textSecondary,
                border: `1px solid ${copied ? '#22C55E' : colors.border}`,
                borderRadius: 8,
                fontSize: 13,
                cursor: filteredFindings.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: filteredFindings.length > 0 ? 1 : 0.5,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Report'}
            </button>
          </div>

          <div
            style={{
              backgroundColor: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              overflow: 'hidden',
              maxHeight: 600,
              overflowY: 'auto',
            }}
          >
            {filteredFindings.map((f, i) => (
              <div
                key={`${f.line}-${f.column}-${i}`}
                style={{
                  padding: '16px 20px',
                  borderBottom: i < filteredFindings.length - 1 ? `1px solid ${colors.border}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: `${severityColor(f.pattern.severity)}20`,
                      color: severityColor(f.pattern.severity),
                    }}
                  >
                    {f.pattern.severity}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 15 }}>{f.pattern.name}</span>
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 11,
                      background: `${colors.accent}20`,
                      color: colors.accent,
                    }}
                  >
                    {f.pattern.category}
                  </span>
                  <span style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 'auto' }}>
                    Line {f.line}, Col {f.column}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 13,
                    padding: 10,
                    backgroundColor: colors.bg,
                    borderRadius: 6,
                    wordBreak: 'break-all',
                    color: colors.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  {f.context}
                </div>
                <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6 }}>
                  {f.pattern.description}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
