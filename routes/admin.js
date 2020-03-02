const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const checkAdminAuth = require('../utils/checkAdminAuth');

const Admin = require('../controllers/admin');

router.post('/login', (req, res) => {
	Admin.login(req, res);
});

// protected routes..
router.get('/me', checkAdminAuth, (req, res) => {
	Admin.getProfile(req, res);
});

router.put('/', checkAdminAuth, (req, res) => {
	Admin.updateProfile(req, res);
});

router.put('/password', checkAdminAuth, (req, res) => {
	Admin.updatePassword(req, res);
});

module.exports = router;