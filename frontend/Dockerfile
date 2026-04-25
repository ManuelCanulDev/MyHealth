# MyHealth frontend (Vite + React) — build estático y Nginx para Coolify
# En Coolify: Base Directory = `frontend`, Dockerfile = `Dockerfile`, puerto del contenedor = 80
#
# Build-time (Vite): en Coolify → Build Arguments, p. ej. VITE_API_URL=https://api.tudominio.com
# Debe coincidir con import.meta.env.VITE_API_URL en el código (p. ej. src/api.js).

FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# URL del API en producción (misma variable que en .env local para `vite build`)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Servir estáticos ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
