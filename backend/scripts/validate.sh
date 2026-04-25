#!/usr/bin/env bash
# Validación local antes de probar en navegador o al depurar.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${HOME}/.foundry/bin:${PATH}"

echo "== 1) forge build =="
if ! command -v forge &>/dev/null; then
  echo "Falta Foundry (forge). Instala: https://book.getfoundry.sh" >&2
  exit 1
fi
forge build

echo "== 2) sintaxis del servidor Node =="
node --check backend/server.js

echo "== 3) contrato en .env vs cadena (perfil on-chain) =="
node scripts/check-onchain.cjs

echo ""
echo "=== validate: todo OK ==="
