const express = require('express');
const router = express.Router();
const projectService = require('../services/projectService');
const auth = require('../middleware/auth');
const { projectValidation, handleValidationErrors } = require('../middleware/validate');

router.post('/', auth, projectValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.user.id);
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth, projectValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.id);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
