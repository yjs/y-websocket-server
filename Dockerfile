FROM node:18-alpine

ENV APPSYNC_ENDPOINT=""

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm ci
COPY --chown=node:node . .
EXPOSE 1234
CMD [ "npm", "start" ]