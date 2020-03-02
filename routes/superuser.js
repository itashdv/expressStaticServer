const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const checkSuperUserAuth = require('../utils/checkSuperUserAuth');

const Superuser = require('../controllers/superuser');

router.post('/login', (req, res) => {
	Superuser.login(req, res);
});

router.get('/', (req, res) => {
	res.status(401).json('Access denied!');
	// Superuser.create(req, res);
});

router.get('/me', checkSuperUserAuth, (req, res) => {
	Superuser.getMyProfile(req, res);
});

module.exports = router;