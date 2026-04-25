#!/usr/bin/env bash
# Carga .env (npm no exporta variables del archivo .env a los scripts)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${HOME}/.foundry/bin:${PATH}"
if [ ! -f .env ]; then
  echo "Falta el archivo .env en la raiz del proyecto." >&2
  exit 1
fi
set -a
# shellcheck disable=SC1091
source .env
set +a
if [ -z "${PRIVATE_KEY:-}" ]; then
  echo "Falta PRIVATE_KEY en .env (clave de la misma cuenta que desplegara el contrato)." >&2
  exit 1
fi
RPC="${MONAD_RPC:-https://testnet-rpc.monad.xyz}"
ADDR="$(cast wallet address --private-key "$PRIVATE_KEY")"
echo "Cuenta que firma (pide fondos al faucet a ESTA): ${ADDR}"
if ! BAL_ETHER="$(cast balance "$ADDR" --ether --rpc-url "$RPC" 2>/dev/null)"; then
  BAL_ETHER="(no se pudo leer)"
fi
echo "Saldo aprox. en testnet: ${BAL_ETHER} MON (nativo)"
echo "Si el saldo es 0 o muy bajo: https://faucet.monad.xyz"
echo "Desplegando con RPC: ${RPC}"
exec forge script script/DeployMyHealth.s.sol:DeployMyHealthScript \
  --rpc-url "$RPC" \
  --private-key "$PRIVATE_KEY" \
  --broadcast
