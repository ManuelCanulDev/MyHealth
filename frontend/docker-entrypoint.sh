#!/bin/sh
set -e
# En Coolify: Variable de entorno VITE_API_URL (runtime). Se inyecta en config.js antes de Nginx.
API_URL="${VITE_API_URL:-http://localhost:3000}"
ESC=$(printf '%s\n' "$API_URL" | awk '{ gsub(/\\/,"\\\\"); gsub(/"/,"\\\""); print }')
printf 'window.__ENV__ = { VITE_API_URL: "%s" };\n' "$ESC" > /usr/share/nginx/html/config.js
exec nginx -g "daemon off;"
