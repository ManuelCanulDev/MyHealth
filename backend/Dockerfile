# MyHealth API (Node + artefacto Foundry para el ABI)
FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends git curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Foundry: compilar el contrato y dejar out/MyHealth.sol/MyHealth.json
ENV PATH="/root/.foundry/bin:${PATH}"
RUN curl -L https://foundry.paradigm.xyz | sh && /root/.foundry/bin/foundryup
WORKDIR /app
COPY foundry.toml ./
COPY contracts ./contracts
COPY lib ./lib
COPY script ./script
RUN forge build

# Imagen de ejecución
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY backend ./backend
COPY landing ./landing
COPY INTEGRACION_APP.md ./INTEGRACION_APP.md
COPY openapi.json ./openapi.json
COPY --from=builder /app/out ./out
COPY --from=builder /app/contracts ./contracts

# /app/data: persistir borradores u otros archivos del servidor (volumen en Coolify)
RUN mkdir -p /app/data

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "backend/server.js"]
