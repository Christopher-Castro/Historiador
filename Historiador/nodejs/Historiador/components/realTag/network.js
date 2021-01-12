//la capa de red se encarga de despachar las peticiones y enviarla al controlador
const response = require('../../network/response');
const express = require ('express');
const controller = require('./controller');
const router = express.Router();

router.get('/', function(req, res){
    
    let filterRealTag = null;
    if(req.query.user) {
        filterRealTag = {user: req.query.user};
    } else if (req.query.group) {
        filterRealTag = {group: req.query.group};
    } else if (req.query.realTag) {
        filterRealTag = {realTag: req.query.realTag};
    } else {
        filterRealTag = null;
    };

    controller.getRealTags(filterRealTag)
        .then((realTagList)=>{
            response.success(req, res, realTagList, 200)
        })
        .catch( e => {
            response.error(req, res, 'Unexpected Error', 500, e);
           
        })
});
router.post('/', function(req, res){
    
    controller.addRealTag(req.body.register, req.body.user, req.body.group, req.body.realTag, req.body.value, req.body.units, req.body.description)
        .then((fullMessage) => {
            response.success(req, res, fullMessage, 201);
        })
        .catch(e => {
            response.error(req, res, 'Información inválida', 400, 'Error en el conrolador');
        });
//    if (req.query.error == "ok") {
//        response.error(req, res, 'Error inesperado', 500, 'Es solo una simulación de un error');
//    } else {
//        response.success(req, res, 'Creado correctamente', 201)
//    };
    
});
router.patch('/:id', function(req, res){
    controller.updateRealTag(req.params.id, req.body.user, req.body.group, req.body.value, req.body.description)
        .then((data) => {
            response.success(req, res, data, 200);
        })
        .catch(e => {
            response.error(req, res, 'Error interno', 500, e);
        });
})

router.delete('/:id', function(req, res){
    controller.deleteRealTag(req.params.id)
        .then(() => {
            response.success(req, res, `realTag ${req.params.id} eliminado`, 200);
        })
        .catch(e => {
            response.error(req, res, 'Error interno', 500, e); 
        });
});

//app.use('/', function(req, res){
//    res.send('Hola');
//})

module.exports = router;