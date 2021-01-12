//importamos express
const express = require('express');
const bodyParser = require('body-parser');
const response = require('./network/response');

//necesitamos manejar las rutas del get, post y demas
const router = express.Router();

//con esto se da por inicializado express
var app = express();

app.use(bodyParser.json());
app.use(router);

//para interpretar peticiones tipo json (content type)
//app.use(bodyParser.urlencoded({extended: false}));
//para interpretar peticiones tipo url encoded

//ahora vamos a configurar los mpetodos y sus rutas
app.get('/mensaje', function(req, res){
    console.log(req.headers)
    res.header({
        "custom-header": "kk",
    });
    response.success(req, res, 'Lista de mensajes');
});
app.post('/mensaje', function(req, res){
    console.log(req.body);
    console.log(req.query);
    //res.send(`Variable creada con nodemonssssa. Req:  ${req.body.a}`);
    if (req.query.error == "ok") {
        response.error(req, res, 'Error inesperado', 500, 'Es solo una simulación de un error');
    } else {
        response.success(req, res, 'Creado correctamente', 201)
    };
    
});
app.delete('/mensaje', function(req, res){
    console.log(req.body);
    console.log(req.query);
    //res.status(201).send({error: '', body: 'todo perfectirijillo'});
    response.success(req, res, 'Dleteado correctamente');
});
//app.use('/', function(req, res){
//    res.send('Hola');
//})

app.use('/app', express.static('public'));

app.listen(3000);
console.log('servidor en el puerto 3000');
