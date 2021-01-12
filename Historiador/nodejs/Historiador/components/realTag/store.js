const Model = require('./model');

function addMessage(message){
    //list.push(message);
    const myMessage = new Model(message);
    myMessage.save();
}

async function getMessage(filterTag){ 
    return new Promise((resolve, reject) => {
        let filter = {};
        if (filterTag !== null ){
            //filter = { realTag: filterTag }
            filter = filterTag;
        }
        Model.find(filter)
            .populate('user')
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

async function updateText(id, user, group, value, description){
    const foundMessage = await Model.findOne({
        _id: id,
    });
    if(user){foundMessage.user = user};
    if(group){foundMessage.group = group};
    if(value){foundMessage.value = value};
    if(description){foundMessage.description = description};
    const newMessage = await foundMessage.save();
    return newMessage;
}

function removeMessage(id){
    return Model.deleteOne({
        _id: id,
    });
}

module.exports = {
    add: addMessage,
    list: getMessage,
    updateText: updateText,
    remove: removeMessage,
    //get
    //update
    //delete
};