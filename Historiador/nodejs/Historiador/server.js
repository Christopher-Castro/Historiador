const express = require('express');
const app = express();
const server = require('http').Server(app);


const bodyParser = require('body-parser');
const socket = require('./socket');
const db = require('./db');
const router = require('./network/routes');


db('mongodb://localhost:27017/admin');
//db('mongodb://mongo:27017/admin')



app.use(bodyParser.json());
socket.connect(server);
router(app);



app.use('/app', express.static('public'));

server.listen(3000, function () {
    console.log('La aplicación está escuchando en el http://localhost:3000');
});

