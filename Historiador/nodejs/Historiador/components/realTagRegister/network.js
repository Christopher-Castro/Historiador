const response = require('../../network/response');
const express = require ('express');
const controller = require('./controller');
const router = express.Router();

router.get('/:userId', function(req, res){

    controller.listRealTagsRegister(req.params.userId)
        .then((users)=>{
            response.success(req, res, users, 200)
        })
        .catch( e => {
            response.error(req, res, 'Internal Error', 500, e);
           
        })
});
router.post('/', function(req, res){
    
    controller.addRealTagsRegister(req.body.users)
        .then(data => {
            response.success(req, res, data, 201);
        })
        .catch(e => {
            response.error(req, res, 'Internal error', 400, e);
        });
});

module.exports = router;