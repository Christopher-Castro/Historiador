//const { request } = require('express');
//const { now } = require('mongoose');
const store = require('./store');
const socket = require('../../socket').socket;


function addRealTag(register, user, group, realTag, value, units, description){
    return new Promise((resolve, reject) => {
        if (!register || !user || !realTag || !value){
            console.error('[realTagsController] Datos insuficientes');
            reject('Los datos son incorrectos');
            return false;
        }
        
        const fullMessage = {
            register: register,
            user: user,
            group: group,
            realTag: realTag,
            value: value,
            units: units,
            description: description,
            date: new Date(),
        };
        
        //console.log(fullMessage); 
        store.add(fullMessage);

        socket.io.emit('mensaje', fullMessage);

        resolve(fullMessage);
    });       
}

function getRealTags(filterTag){
    return new Promise ((resolve, reject) => {
        resolve(store.list(filterTag));
    })
}

function updateRealTag(id, user, group, value, description){
    return new Promise(async (resolve, reject) => {
        if (!id || (!user && !group && !value && !description)){
            reject('Invalid data');
            return false;
        }
       const result = await store.updateText(id, user, group, value, description);
       resolve(result);
    })
}

function deleteRealTag(id) {
    return new Promise((resolve, reject) => {
        if (!id) {
            reject ('Id Invalido');
            return false;
        }
        
        store.remove(id)
            .then (() => {
                resolve();
            })
            .catch (e => {
                reject(e);
            })
    })
}
module.exports = {
    addRealTag,
    getRealTags,
    updateRealTag,
    deleteRealTag,
};
