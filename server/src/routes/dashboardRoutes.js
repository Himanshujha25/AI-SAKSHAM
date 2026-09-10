const express = require('express');
const { protect } = require('../middleware/auth');
const c = require('../controllers/dashboardController');

const router = express.Router();
router.use(protect);
router.get('/overview', c.overview);
module.exports = router;
