# Stage 1: Build the React app
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
CMD ["npm", "run", "dev", "--", "--host"]