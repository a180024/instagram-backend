const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const User = mongoose.model('User');

// POST new user route(optional)
router.post('/signup', auth.optional, (req, res, next) =>{
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      }
    })
  }

  if(!user.username) {
    return res.status(422).json({
      errors: {
        username: 'is required',
      }
    })
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      }
    })
  }

  const finalUser = new User(user);
  
  finalUser.setPassword(user.password);

  return finalUser.save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }));
});

// POST login route(optional)
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user.username) {
    return res.status(422).json({
      errors: {
        username: 'is required',
      }
    })
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      }
    })
  }

  return passport.authenticate('local', { session: false }, (err, user, info) => {
    if(err) {
      return next(err);
    }
    
    if(user) {
      user.token = user.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    }
    return res.status(422).json(info);
  })(req, res, next);
});

// GET User Information
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return User.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(404);
      }

      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next)
});

module.exports = router;
