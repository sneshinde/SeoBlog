const express = require('express');
const router = express.Router();
const { requireSignin, authMiddlemare } = require('../controllers/auth');
const { read } = require('../controllers/user');

router.get('/profile', requireSignin, authMiddlemare, read);

module.exports = router;