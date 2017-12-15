const mongoose = require('mongoose');
const mongooseeder = require('mongooseeder');
const models = require('../models/');
const User = require('../models/user.js');
var faker = require('faker');
const bcrypt = require('bcrypt');
const mongodbUrl = 'mongodb://localhost/madlib';

mongooseeder.seed({
  mongodbUrl: mongodbUrl,
  clean: true,
  models: models,
  mongoose: mongoose,
  seeds: () => {
    const users = [];

    for (let i = 0; i < 100; i++) {
      let email = faker.internet.email();
      const user = new User({
        email: email,
        password: email
      });
      users.push(User.create(user));
    }
    return Promise.all(users);
  },
});
