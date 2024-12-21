FROM node:20-alpine

RUN apk update && \
    apk add --no-cache ffmpeg

WORKDIR /backend

COPY package.json bun.lockb ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]