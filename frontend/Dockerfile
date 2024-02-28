FROM node:20-alpine

WORKDIR /frontend

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm \
    && pnpm install

COPY . .

RUN pnpm build

CMD ["pnpm", "start"]
