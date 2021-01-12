const Model = require('./model');

function addRealTagRegister(register){
    const myRegister = new Model(register);
    myRegister.save();
}

async function getRegister(userId){ 
    return new Promise((resolve, reject) => {
        let filter = {};
        if (userId){
            filter = {
                users: userId,
            };
        }
        Model.find(filter)
            .populate('users')
            .exec((error, populated) => {
                if(error){
                    reject(error);
                    return false;
                }
                resolve(populated);

            });
        //resolve(messages);
            

    })
    
    
}

module.exports = {
    add: addRealTagRegister,
    list: getRegister,
};