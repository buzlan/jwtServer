const Router = require('express').Router
const userController = require('../controllers/user')
const router = new Router()

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/logout',  userController.logout)
router.get('/refresh', userContrsoller.refresh)
router.get('/users', userController.getUsers)


module.exports = router
