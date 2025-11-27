const mongoose = require('mongoose');

const datapointSchema = new mongoose.Schema({
    source: { type: String, required: false },
    survey: { type: String, required: false },
    dimensions: {type: Array, required: true},
    value: { type: Number, required: true }
});

module.exports = mongoose.model('Datapoint', datapointSchema, 'datapoints');