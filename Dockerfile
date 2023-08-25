FROM node:16.20-alpine

WORKDIR /app

COPY . /app/

RUN npm install && npx tsc --strict --outDir dist/

ENTRYPOINT ["node", "/app/dist/index.js"]
