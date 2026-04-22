FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev --frozen-lockfile

COPY message.json ./
COPY src/ ./src/

EXPOSE 8080
CMD ["node", "src/index.js"]
