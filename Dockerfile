FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .

RUN cd /usr/src/app/historiador-db && npm install 

RUN cd /usr/src/app/historiador-mqtt && npm install 

RUN cd /usr/src/app/historiador-api && npm install

RUN cd /usr/src/app/historiador-agent && npm install

RUN cd /usr/src/app/historiador-agent/gui && npm install

RUN cd /usr/src/app/historiador-web && npm install 
