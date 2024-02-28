FROM node:20-alpine

RUN apk update && \
    apk add --no-cache ffmpeg

ENV PATH="/usr/bin/ffmpeg:${PATH}"

WORKDIR /backend

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm \
    && pnpm install

COPY . .

CMD ["pnpm", "start"]