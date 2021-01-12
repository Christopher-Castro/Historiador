const express = require('express');
//const express = require('express');
//const router = require('../components/message/network');
const realTag = require('../components/realTag/network');
const realTagRegister = require('../components/realTagRegister/network');
const user = require('../components/user/network');

const routes = function(server){
    server.use('/realTags', realTag);
    server.use('/realTagsRegister', realTagRegister);
    server.use('/user', user);
}

module.exports = routes;