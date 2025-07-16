# backend/Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copia todo o código-fonte
COPY . .

# Transpila o TypeScript para JavaScript
RUN npm run build

EXPOSE 8080

# Executa o arquivo JavaScript compilado (geralmente na pasta 'dist')
CMD ["node", "dist/server.js"]
