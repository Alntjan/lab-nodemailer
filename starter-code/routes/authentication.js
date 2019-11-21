const {
  Router
} = require('express');
const router = new Router();

const User = require('./../models/user');
const bcryptjs = require('bcryptjs');

router.get('/', (req, res, next) => {
  res.render('index');
});

/*
router.get('/confirm/:confirmCode', (req, res, next) => {
  console.log(req.params);
  res.render('index');
});
*/

router.get('/confirm/:confirmCode', (req, res, next) => {
  User.findOneAndUpdate({
    confirmationCode: req.params.confirmCode
  }, {
    status: 'Active'
  }).then(user => {
    res.render('confirmation');
  }).catch(error => {
    next(error);
  })
});

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});


router.post('/sign-up', (req, res, next) => {
  let cCode;
  const {
    username,
    email,
    password
  } = req.body;

  bcryptjs.hash(email, 10).then(hash => {
    cCode = hash.replace(/(\/)+/g, ".");
  }).catch(error => {
    next(error);
  });

  bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        username,
        email,
        passwordHash: hash,
        confirmationCode: cCode
      });
    })
    .then(user => {
      req.session.user = user._id;
      user.sendConfirmationEmail();
    }).then(document => {
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

router.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

router.post('/sign-in', (req, res, next) => {
  let userId;
  const {
    email,
    password
  } = req.body;
  User.findOne({
      email
    })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        req.session.user = userId;
        res.redirect('/');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch(error => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

const routeGuard = require('./../middleware/route-guard');

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

module.exports = router;