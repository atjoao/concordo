FROM node:20-alpine

WORKDIR /server

COPY package.json pnpm-lock.yaml ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]