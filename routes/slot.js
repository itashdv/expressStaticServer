const express = require('express');
const router = express.Router();
const checkAdminAuth = require('../utils/checkAdminAuth');

const Slot = require('../controllers/slot');

// protected routes..
router.post('/', checkAdminAuth, (req, res) => {
	Slot.create(req, res);
});

module.exports = router;