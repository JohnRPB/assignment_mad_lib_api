const express = require('express');
const router = express.Router();
const helpers = require('./../helpers');
const h = helpers.registered;
const passport = require('passport');

// ----------------------------------------
// Index
// ----------------------------------------
router.get(
  '/furious_spinoffs', // <---- don't forget

  // Register the passport bearer strategy middleware
  // we this router's only route
  passport.authenticate('bearer', { session: false }),

  // Callback for the route
  // serves the data from the API
  (req, res, next) => {
    const count = +req.query.count || 10;
    const titles = [];
    for (let i = 0; i < count; i++) {
      titles.push(furiousSpinoff());
    }
    res.status(200).json(titles);
  }
);

module.exports = router;
