const db = require('mongoose');

db.Promise = global.Promise;

async function connect(url){
    await db.connect(url, {
    //await db.connect(, {
    user: 'root',
    pass: 'example',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    })
    .then(db => console.log('[db] conectada con éxito a: ', db.connection.host))
    .catch(e => console.error(e));
}

module.exports = connect;

