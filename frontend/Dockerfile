FROM node:20-alpine

WORKDIR /frontend

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm \
    && pnpm install

COPY . .

ENV SERVER_IP=${SERVER_IP}

RUN pnpm build

CMD ["pnpm", "start"]
