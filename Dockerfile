FROM oven/bun:1 AS builder
WORKDIR /usr/src/app
COPY . .
RUN bun install
RUN bun run build

FROM caddy:2.10.2 AS runner

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /usr/src/app/dist /app
