FROM oven/bun:alpine

RUN apk update && \
    apk add --no-cache ffmpeg nodejs npm

WORKDIR /backend

COPY package.json ./

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "start"]