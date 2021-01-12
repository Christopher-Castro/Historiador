const response = require('../../network/response');
const express = require ('express');
const controller = require('./controller');
const router = express.Router();

router.post('/', function(req, res) {
    controller.addUser(req.body.name)
        .then(data => {
            response.success(req, res, data, 201);
        })
        .catch(err => {
            response.error(req, res, 'Internal error', 500, err);
        });
})

router.get('/', function (req, res) {
    controller.listUsers()
      .then((users) => {
        response.success(req, res, users, 200)
      })
      .catch(e => {
        response.error(req, res, 'Internal Error', 500, e)
      });
})

router.patch('/:id', function(req, res){
  controller.updateUser(req.params.id, req.body.name)
      .then((data) => {
          response.success(req, res, data, 200);
      })
      .catch(e => {
          response.error(req, res, 'Error interno', 500, e);
      });
})

router.delete('/:id', function(req, res){
  controller.deleteUser(req.params.id)
      .then(() => {
          response.success(req, res, `user ${req.params.id} eliminado`, 200);
      })
      .catch(e => {
          response.error(req, res, 'Error interno', 500, e); 
      });
});
module.exports = router;