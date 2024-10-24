FROM node:20-alpine

ENV NODE_ENV=production

RUN adduser -S -D -H -u 1001 -s /bin/null appuser

WORKDIR /app

COPY assignment-1-2-1.0.0.tgz /app

RUN npm install assignment-1-2-1.0.0.tgz --no-save

COPY package.json /app

RUN diff node_modules/assignment-1-2/package.json package.json

RUN mv ./node_modules/assignment-1-2/node_modules/* ./node_modules && rm -rf ./node_modules/assignment-1-2

COPY . /app

USER appuser

EXPOSE 3000 

CMD ["node", "app.js"]