FROM node:20-alpine

ENV NODE_ENV=production

RUN adduser -S -D -H -u 1001 -s /bin/null appuser

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . /app

USER appuser

EXPOSE 3000 

CMD ["node", "app.js"]