import express from 'express'
import session from 'express-session'
import con from './sql'
import cookieParser from 'cookie-parser'
import sessionToken from './sessionToken'
import renderPage from './renderPage'
import '../interfaces/sessionData'

var router = express.Router()

// Middleware used throughout the site
router.use(express.static('public'))
router.use(session({secret: "StoriesApp session secret",saveUninitialized: false, resave: false}))
router.use(express.urlencoded({extended:false}))
router.use(cookieParser())
router.use(sessionToken)

// More complex routes are defined their own separate files
import login from './login'
import register from './register'
import newstory from './new'
import stories from './stories'
import read from './read'
import all from './all'
router.use('/login',login)
router.use('/register',register)
router.use('/new',newstory)
router.use('/stories',stories)
router.use('/read',read)
router.use('/all',all)

// All the other, common or short routes are defined here
router.get('/logout',(req,res)=>{
    delete req.session.username
    if (req.cookies.token) {
        res.clearCookie('token')
        con.query('DELETE FROM logins WHERE token = ?',[req.cookies.token])
    }

    res.redirect('/')
})
router.get('/',(req,res) => {
    renderPage(req,res,'homepage','Stories App')
})
router.get('/*',(req,res)=>{
    renderPage(req,res,'404',"Page Not Found")
})
export default router