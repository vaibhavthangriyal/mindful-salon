const mongoose = require('mongoose');
const util = require('util');
const debug = require('debug')('express-mongoose-es6-rest-api:index');

const config = require('./config');

// const mongoUri = config.mongo.host;
mongoose.set('useFindAndModify', false);

// Connect to MongoDB
mongoose
  // .connect(mongoUri, { useNewUrlParser: true, useCreateIndex: true })
  // .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/binsar", { useNewUrlParser: true, useCreateIndex: true })
  .connect(process.env.MONGODB_URI || "mongodb://heroku_rwxztsfk:tu82s81k7mo3f77olfvd39vn25@ds349587.mlab.com:49587/heroku_rwxztsfk", { useNewUrlParser: true, useCreateIndex: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


// print mongoose logs in dev env
if (config.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}
module.exports = mongoose;
