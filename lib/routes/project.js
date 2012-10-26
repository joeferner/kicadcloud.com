'use strict';

module.exports = function(app) {
  app.get('/project/:id', app.withConnection(getProject));

  function getProject(req, res, next) {
    res.render('project/view.ejs', {
      title: 'Project',
      layout: 'layout.ejs'
    });
  }
};
