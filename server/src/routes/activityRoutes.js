const express = require('express');
const { protect } = require('../middleware/auth');
const c = require('../controllers/activityController');

const router = express.Router();
router.use(protect);
router.get('/', c.list);
module.exports = router;
