FROM oven/bun:latest

WORKDIR /frontend

COPY package.json ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

CMD ["bun", "start"]
