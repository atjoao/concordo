FROM node:20-alpine

RUN apk update && \
    apk add --no-cache ffmpeg

ENV FFPROBE_PATH=/usr/bin/ffprobe
ENV FFMPEG_PATH=/usr/bin/ffmpeg

WORKDIR /backend

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm \
    && pnpm install

COPY . .

CMD ["pnpm", "start"]