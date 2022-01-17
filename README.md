# Historiador de Procesos

Desarrollada completamente en Node.js, se trata de una API destinada al registro de datos a nivel industrial y a su implementación en sistemas SCADA.
[Repositorio](https://github.com/Christopher-Castro/Historiador)

## Dockerfile
```Dockerfile
FROM node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY . .

RUN cd /usr/src/app/historiador-db && npm install 

RUN cd /usr/src/app/historiador-mqtt && npm install 

RUN cd /usr/src/app/historiador-agent && npm install 

RUN cd /usr/src/app/historiador-api && npm install 

RUN cd /usr/src/app/historiador-web && npm install 
```

## Instalación

Ejecutar directamente mediante docker-compose.

```docker-compose
version: "3.8"

services:
  db:
    image: postgres
    restart: always
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: example
      PGDATA: /var/lib/postgresql/data
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    
 
  pgadmin:
    image: dpage/pgadmin4
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: user@domain.com
      PGADMIN_DEFAULT_PASSWORD: example
      PGADMIN_LISTEN_PORT: 80
    ports:
      - "80:80"
    volumes:
      - pgadmin-data:/var/lib/pgadmin
    links:
      - "db:pgsql-server"
    depends_on:
      - db
  
  noip:
    image:  coppit/no-ip
    volumes:
      - noip-config:/config
      - noip-etc:/etc
    
  openvpn:
    image: kylemanna/openvpn
    container_name: openvpn
    ports:
     - "1194:1194/udp"
    volumes:
     - openvpn-data:/etc/openvpn
  
  node:
    image: node
    working_dir: /home/node/app
    environment:
      - NODE_ENV=production
    volumes:
      - ./nodejs/Historiador:/home/node/app
    command: "npm run server"
    ports: 
      - "3001:3001"
    depends_on:
      - mongo

  mqtt:
    image: christopher57/historiador_image
    working_dir: /usr/src/app/historiador-mqtt
    command: "npm run start-dev"
    ports: 
      - "1883:1883"
    depends_on:
      - mongo
      - db
  
  agent:
    image: christopher57/historiador_image
    working_dir: /usr/src/app/historiador-agent
    command: "tail -f /dev/null"
    ports: 
      - "502:502"
    volumes:
      - "../historiador-agent/examples:/usr/src/app/historiador-agent/examples"
    depends_on:
      - mqtt

  api:
    image: christopher57/historiador_image
    working_dir: /usr/src/app/historiador-api
    command: "npm run start-dev"
    ports: 
      - "3000:3000"
    depends_on:
      - db

  web:
    image: christopher57/historiador_image
    working_dir: /usr/src/app/historiador-web
    command: "npm run start-dev"
    ports: 
      - "8080:8080"
    depends_on:
      - api
      - mqtt

  mongo:
    image: mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    ports:
      - 27017:27017
    volumes:
      - mongodb-data:/data/db
    

  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: example
    depends_on:
      - mongo
    


volumes:
  db-data:
  pgadmin-data:
  openvpn-data:
  noip-config:
  noip-etc:
  
  mongodb-data:
```

## Uso

```

```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://github.com/Christopher-Castro/Historiador/blob/master/LICENSE)
