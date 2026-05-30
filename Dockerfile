# ─── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Recebe a URL da API como build arg (variáveis VITE_ precisam existir no build)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: serve com nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Config leve para SPA (react-router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
