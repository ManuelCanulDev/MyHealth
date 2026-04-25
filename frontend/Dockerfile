# MyHealth frontend (Vite + React) — build estático y Nginx para Coolify
# En Coolify: Base Directory = `frontend`, puerto del contenedor = 80 (solo interno; no mapear 80 del host).
#
# URL del backend: variable de entorno VITE_API_URL en el servicio (runtime).
# docker-entrypoint.sh genera /config.js al arrancar; no hace falta Build Argument.

FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Servir estáticos ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
ENV VITE_API_URL=

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
