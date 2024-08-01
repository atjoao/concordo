FROM oven/bun:alpine

RUN apk update && \
    apk add --no-cache ffmpeg

WORKDIR /backend

COPY package.json ./

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "start"]