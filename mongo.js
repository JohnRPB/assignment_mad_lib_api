let mongoose = require('mongoose');
let env = process.env.NODE_ENV || 'development';

module.exports = () => {
  let localUrl = `mongodb://localhost/madlib`
  return mongoose.connect(localUrl);
};
