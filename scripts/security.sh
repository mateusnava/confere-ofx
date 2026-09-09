#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

SEMGREP_ARGS=(
  scan
  --config p/javascript
  --config p/typescript
  --config p/owasp-top-ten
  --error
  --metrics=off
)

run_audit() {
  echo "==> npm audit (high+)"
  npm audit --audit-level=high
}

run_semgrep() {
  echo "==> semgrep"
  if command -v semgrep >/dev/null 2>&1; then
    semgrep "${SEMGREP_ARGS[@]}"
    return
  fi

  if command -v docker >/dev/null 2>&1; then
    docker run --rm \
      -v "$root:/src:ro" \
      -w /src \
      semgrep/semgrep \
      semgrep "${SEMGREP_ARGS[@]}"
    return
  fi

  if command -v pipx >/dev/null 2>&1; then
    pipx run semgrep -- "${SEMGREP_ARGS[@]}"
    return
  fi

  echo "Semgrep nao encontrado. Instale com um destes:" >&2
  echo "  pipx install semgrep" >&2
  echo "  brew install semgrep" >&2
  echo "  docker pull semgrep/semgrep" >&2
  exit 1
}

run_audit
run_semgrep
echo "==> security ok"
