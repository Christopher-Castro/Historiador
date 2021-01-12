const store = require('./store');

function addRealTagsRegister(users){
    if (!users || !Array.isArray(users)) {
        return Promise.reject('Invalid user list');
    }    
    const register = {
        users: users,
    };
    store.add(register);
    return Promise.resolve(register);
}

function listRealTagsRegister(userId) {
    return new Promise((resolve, reject) => {
      resolve(store.list(userId))
    })
}

module.exports = {
    addRealTagsRegister,
    listRealTagsRegister,
}