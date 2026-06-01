const express = require('express');
const router = express.Router();
const issueService = require('../services/issueService');
const auth = require('../middleware/auth');
const { issueValidation, handleValidationErrors } = require('../middleware/validate');

router.post('/', auth, issueValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const issue = await issueService.createIssue(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: issue
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { projectId, status, priority, assigneeId, search, page, limit } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const filters = { status, priority, assigneeId, search, page, limit };
    const result = await issueService.getIssues(projectId, req.user.id, filters);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const issue = await issueService.getIssueById(req.params.id, req.user.id);
    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth, issueValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const issue = await issueService.updateIssue(req.params.id, req.body, req.user.id);
    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: issue
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await issueService.deleteIssue(req.params.id, req.user.id);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
