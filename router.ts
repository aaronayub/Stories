import express from 'express'
import session from 'express-session'
import bcrypt from 'bcrypt'
import con from './sql'
import { nextTick } from 'process'
var router = express.Router()

// Express-session variables must be declaration merged with typescript
declare module 'express-session' {
    interface SessionData {
        username: string
    }
}

router.use(session({secret: "StoriesApp session secret",saveUninitialized: false, resave: false}))
router.use(express.urlencoded({extended:false}))

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
router.post('/register',(req,res,next)=>{
    var valid = true // User is eligible for registering
    if (req.body.password.length < 6) valid = false // If the password isn't of the required length
    else if (req.body.confirm !== req.body.password) valid = false // If the password and confirmed password don't match
    con.query('SELECT username FROM users WHERE username = ?',
    [req.body.username], (err,result)=>{
        console.log(result)
        console.log(con.escape(req.body.username))
        if (result.length > 0) { // If the query returns a row, then the username is already taken
            valid = false
        }
    })
    if (valid) {
        bcrypt.hash(req.body.password,10,(err,hash)=>{
            con.query('INSERT INTO users (username,pass,account) VALUES (?,?,?)',
            [req.body.username,hash,'user'], (err,result)=>{
                if (err) console.log(err)
                req.session.username = con.escape(req.body.username)
                next()
            })
        })
    }
})
router.all('*',(req,res) => {
    res.render('homepage',{
        username: req.session.username,
        title: "Stories App"
    })
})
export default router