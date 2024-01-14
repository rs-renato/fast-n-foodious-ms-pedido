FROM node:18.16-alpine

ENV TZ=America/Sao_Paulo

WORKDIR /fast-n-foodious-ms-pedido

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]