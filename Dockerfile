FROM node:19-alpine as base
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app

FROM base as dev
ENV NODE_ENV=dev
RUN npm install
COPY . /app
CMD npm run start:dev

FROM base as prod
ENV NODE_ENV=prod
RUN apk --no-cache add curl
RUN npm run build
RUN npm install --only=production && npm cache clean --force
CMD npm run start:prod