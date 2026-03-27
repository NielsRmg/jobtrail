const express = require('express');
const router = express.Router();
const controller = require('../controllers/applicationController');

router.get('/alerts', controller.getAlerts);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/timeline', controller.addTimelineEvent);

module.exports = router;