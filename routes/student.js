const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const checkAdminAuth = require('../utils/checkAdminAuth');
const checkStudentAuth = require('../utils/checkStudentAuth');
const Student = require('../controllers/student');

router.post('/', (req, res) => {
	Student.create(req, res);
});

router.post('/login', (req, res) => {
	Student.login(req, res);
});

router.get('/emailconfirm/:token', (req, res) => {
	const token = req.params.token;
	try {
		if (!token) { throw 'Нерабочая ссылка!'; }
		jwt.verify(token, 'whoatemycat?', (err, decoded) => {
			if (err) throw err;
			Student.finishCreate(req, res, decoded);
		});
	} catch(err) {
		res.status(400).json(err);
	}
});

// protected routes..
router.get('/me', checkStudentAuth, (req, res) => {
	Student.getMyProfile(req, res);
});

router.put('/me', checkStudentAuth, (req, res) => {
	Student.updateMyProfile(req, res);
});

router.get('/data', checkStudentAuth, (req, res) => {
	Student.getData(req, res);
});

router.put('/changemypassword', checkStudentAuth, (req, res) => {
	Student.changeMyPassword(req, res);
});

// getting list of teachers and their slots by company id..
router.get('/schedule', checkStudentAuth, (req, res) => {
	Student.getSchedule(req, res);
});

// This route is open ONLY to admins!
router.get('/admin', checkAdminAuth, (req, res) => {
	Student.getByAdmin(req, res);
});

module.exports = router;