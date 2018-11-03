FROM node:10-alpine

WORKDIR /app

COPY ./package.json 			/app/package.json
COPY ./.env         			/app/.env
COPY ./.envDev      			/app/.envDev

COPY ./app                /app/app

RUN apk add tzdata
RUN npm install nodemon -g
RUN npm install
EXPOSE 3000

## Esse comando é substituido quando o compose executa algum outro comando.
CMD [ "npm", "start" ]
