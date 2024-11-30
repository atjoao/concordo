FROM node:20-alpine

RUN apk update && \
    apk add --no-cache ffmpeg

WORKDIR /backend

COPY package.json bun.lockb ./

RUN npm install -g bun \
    && bun install

COPY . .

CMD ["bun", "run", "start"]