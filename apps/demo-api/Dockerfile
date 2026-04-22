FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev --frozen-lockfile

COPY src/ ./src/

EXPOSE 3001
CMD ["node", "src/index.js"]
