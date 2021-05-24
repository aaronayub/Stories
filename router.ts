import express from 'express'
import session from 'express-session'
import sql = require("./sql")
var router = express.Router()

// Express-session variables must be declaration merged with typescript
declare module 'express-session' {
    interface SessionData {
        username: string
    }
}
router.use(session({secret: "StoriesApp session secret",saveUninitialized: false, resave: false}))

router.get('/login',(req,res,next)=>{
    if (req.session.username) {
        next()
    }
    res.render('login',{
        username: req.session.username,
        title: "Log In"
    })
})
router.get('/register',(req,res,next)=>{
    if (req.session.username) {
        next()
    }
    res.render('register',{
        username: req.session.username,
        title: "Register"
    })
})
router.get('*',(req,res) => {
    res.render('homepage',{
        username: req.session.username,
        title: "Stories App"
    })
})
export default router