FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4444

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src/server/index.ts ./src/server/index.ts

RUN bun install --production

EXPOSE 4444

CMD ["bun", "src/server/index.ts"]