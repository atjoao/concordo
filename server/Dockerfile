FROM oven/bun:alpine

WORKDIR /server

COPY package.json ./

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "start"]