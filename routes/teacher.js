const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const checkAdminAuth = require('../utils/checkAdminAuth');
const checkTeacherAuth = require('../utils/checkTeacherAuth');

const Teacher = require('../controllers/teacher');

// public routes..
router.post('/login', (req, res) => {
	Teacher.login(req, res);
});

// protected routes..
router.get('/me', checkTeacherAuth, (req, res) => {
	Teacher.getMyProfile(req, res);
});

router.put('/me', checkTeacherAuth, (req, res) => {
	Teacher.updateMyProfile(req, res);
});

router.put('/changemypassword', checkTeacherAuth, (req, res) => {
	Teacher.changeMyPassword(req, res);
});

// protected routes for admin..
router.post('/', checkAdminAuth, (req, res) => {
	Teacher.create(req, res);
});

router.put('/', checkAdminAuth, (req, res) => {
	Teacher.updateProfile(req, res);
});

router.put('/password', checkAdminAuth, (req, res) => {
	Teacher.resetPassword(req, res);
});

router.get('/admin', checkAdminAuth, (req, res) => {
	Teacher.getByAdmin(req, res);
});

module.exports = router;
