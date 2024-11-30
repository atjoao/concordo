FROM node:20-alpine

WORKDIR /server

COPY package.json pnpm-lock.yaml ./

RUN npm install -g bun \
    && bun install

COPY . .

CMD ["bun", "run", "start"]