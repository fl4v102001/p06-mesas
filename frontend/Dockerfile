# Etapa 1: Build com cache e dependências limpas
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

RUN npm install -g typescript

COPY . .
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
