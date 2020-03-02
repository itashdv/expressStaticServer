const express = require('express');
const router = express.Router();

const checkAdminAuth = require('../utils/checkAdminAuth');

const checkSuperUserAuth = require('../utils/checkSuperUserAuth');

const Company = require('../controllers/company');

router.post('/', checkSuperUserAuth, (req, res) => {
	Company.create(req, res);
});

router.get('/', checkSuperUserAuth, (req, res) => {
	Company.getAllCompanies(req, res);
});

router.delete('/', checkSuperUserAuth, (req, res) => {
	Company.delete(req, res);
});




// get company info by UUID..
router.get('/getByUuid/:uuid', (req, res) => {
	Company.getByUuid(req, res);
});

// This route is open ONLY to admins!
router.get('/admin', checkAdminAuth, (req, res) => {
	Company.getByAdmin(req, res);
});

module.exports = router;