const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const mySchema = new Schema({
    register: {
        type: Schema.ObjectId,
        ref: 'Register',
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    group: String,
    realTag: {
        type: String,
        required: true,
    },
    value: {
        type: mongoose.Decimal128,
        required: true,
    },
    units: String,
    description: String,
    date: Date,
    
});

const model = mongoose.model('realTag', mySchema);
module.exports = model;