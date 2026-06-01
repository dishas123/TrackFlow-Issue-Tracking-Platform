const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const activityService = require('../services/activityService');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

router.get('/charts/status', auth, async (req, res, next) => {
  try {
    const data = await dashboardService.getIssuesByStatus(req.user.id);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

router.get('/charts/priority', auth, async (req, res, next) => {
  try {
    const data = await dashboardService.getIssuesByPriority(req.user.id);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

router.get('/activity', auth, async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const activities = await activityService.getActivities(req.user.id, { projectId });
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
});

router.get('/activity/project/:projectId', auth, async (req, res, next) => {
  try {
    const activities = await activityService.getProjectActivities(req.params.projectId, req.user.id);
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
