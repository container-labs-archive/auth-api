const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const auth = express.Router(); // eslint-disable-line new-cap

auth.use(bodyParser.urlencoded({ extended: true }));
auth.use(bodyParser.json());
auth.use(morgan('dev'));

auth.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  next();
});

auth.get('/setup', (req, res) => {
  User.findOne({ username: 'chicken' }, (err, user) => {
    if (err) throw err;

    if (user) {
      return res.status(409).json({ message: 'user already exists' });
    }

    const admin = new User({
      username: 'chicken',
      password: 'egg',
    });

    return admin.save((saveErr) => {
      if (saveErr) throw saveErr;

      return res.json({ success: true });
    });
  });
});

auth.post('/', (req, res) => {
  User.findOne({
    username: req.body.username,
  }, (err, user) => {
    if (err) throw err;

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Authentication failed. Username and password do not match.',
      });
    }

    return user.comparePassword(req.body.password, (compareErr, isMatch) => {
      if (compareErr) throw compareErr;

      if (isMatch) {
        const token = jwt.sign(user, req.app.get('superSecret'), {
          expiresIn: 86400, // 24 hours
        });

        return res.json({
          success: true,
          message: 'Enjoy your token!',
          token,
        });
      }

      return res.status(403).json({
        success: false,
        message: 'Authentication failed. Username and password do not match.',
      });
    });
  });
});

module.exports = auth;
