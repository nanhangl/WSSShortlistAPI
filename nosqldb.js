const mongoose = require('mongoose');
const uuid = require('uuid');
const user = require('./nosqlmodals/User');
mongoose.connect('mongodb://localhost:27017/shortlist', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected to mongodb');
});