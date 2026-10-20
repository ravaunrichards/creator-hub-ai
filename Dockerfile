FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY backend ./backend
COPY frontend ./frontend
COPY database ./database
EXPOSE 3000
USER node
CMD ["node", "backend/src/server.js"]
