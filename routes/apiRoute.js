const express = require('express');
const router = express.Router();

// requiring routes..
const Company = require('./company');
const Admin = require('./admin');
const Teacher = require('./teacher');
const Student = require('./student');
const Slot = require('./slot');
const Superuser = require('./superuser');

router.get('/', function (req, res) {
  res.send('API root endpoint');
});

router.get('/superusers', function (req, res) {
  res.send('API superusers endpoint');
});

module.exports = router;
