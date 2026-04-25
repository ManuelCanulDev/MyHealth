#!/bin/sh
set -e
# Coolify: la variable debe tener "Runtime" activado (si solo es Build, aquí llega vacía).
# Orden: VITE_* y luego nombres sin prefijo (por si el panel filtra VITE_ en runtime).
pick_raw() {
  printf '%s' "${1:-}" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}
raw="$(pick_raw "$VITE_API_URL")"
[ -z "$raw" ] && raw="$(pick_raw "$VITE_API_BASE_URL")"
[ -z "$raw" ] && raw="$(pick_raw "$MYHEALTH_API_URL")"
[ -z "$raw" ] && raw="$(pick_raw "$API_BASE_URL")"

if [ -n "$raw" ]; then
  API_URL="$raw"
  echo "myhealth-frontend: API base URL configurada (${#API_URL} caracteres)." >&2
else
  API_URL="http://localhost:3000"
  echo "myhealth-frontend: AVISO — ninguna URL de API en runtime (VITE_API_URL, VITE_API_BASE_URL, MYHEALTH_API_URL, API_BASE_URL). Usando $API_URL. En Coolify revisa que la variable tenga Runtime activado." >&2
fi

ESC=$(printf '%s\n' "$API_URL" | awk '{ gsub(/\\/,"\\\\"); gsub(/"/,"\\\""); print }')
# Varias claves para que coincida con lo que definas en Coolify / inspección en el navegador.
printf 'window.__ENV__ = { VITE_API_URL: "%s", VITE_API_BASE_URL: "%s", MYHEALTH_API_URL: "%s", API_BASE_URL: "%s" };\n' \
  "$ESC" "$ESC" "$ESC" "$ESC" > /usr/share/nginx/html/config.js
exec nginx -g "daemon off;"
