FROM mhart/alpine-node:6
MAINTAINER Will Beebe

RUN apk update && \
    apk add python make g++ && \
    rm -rf /var/cache/apk/*

RUN mkdir -p /app
WORKDIR /app

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
COPY package.json /app/package.json
RUN npm install --progress=false

COPY . /app/

ENV SERVER_PORT 8080
ENV DATABASE_NAME development
EXPOSE 8080

CMD ["npm", "start"]
