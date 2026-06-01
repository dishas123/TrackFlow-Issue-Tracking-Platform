const express = require('express');
const router = express.Router();
const commentService = require('../services/commentService');
const auth = require('../middleware/auth');
const { commentValidation, handleValidationErrors } = require('../middleware/validate');

router.post('/', auth, commentValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const comment = await commentService.addComment(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { issueId } = req.query;
    
    if (!issueId) {
      return res.status(400).json({
        success: false,
        message: 'Issue ID is required'
      });
    }

    const comments = await commentService.getComments(issueId, req.user.id);
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(req.params.id, req.user.id);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
