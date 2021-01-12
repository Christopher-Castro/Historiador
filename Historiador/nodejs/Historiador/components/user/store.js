const Model = require('./model');

function addUser(user){
    const myUser = new Model(user);
    return myUser.save();
}

async function listUsers(){
    const users = await Model.find();
    return users  ;
}

async function updateUser(id, name){
    const foundUsers = await Model.findOne({
        _id: id,
    });
    foundUsers.name = name;
    const newUsers = await foundUsers.save();
    return newUsers;
}

function removeUser(id){
    return Model.deleteOne({
        _id: id,
    });
}

module.exports = {
    add: addUser,
    list: listUsers,
    updateUser: updateUser,
    remove: removeUser,
};