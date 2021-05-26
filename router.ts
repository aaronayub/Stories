import express from 'express'
import session from 'express-session'
import bcrypt from 'bcrypt'
import con from './sql'
var router = express.Router()

// Express-session variables must be declaration merged with typescript
declare module 'express-session' {
    interface SessionData {
        username: string
    }
}

router.use(session({secret: "StoriesApp session secret",saveUninitialized: false, resave: false}))
router.use(express.urlencoded({extended:false}))

router.get('/login',(req,res)=>{
    if (req.session.username) {
        res.redirect('/')
        return
    }
    res.render('login',{
        username: req.session.username,
        title: "Log In"
    })
})
router.get('/register',(req,res,next)=>{
    if (req.session.username) {
        res.redirect('/')
        return
    }
    res.render('register',{
        username: req.session.username,
        title: "Register"
    })
})
router.get('/logout',(req,res)=>{
    delete req.session.username
    res.redirect('/')
})
router.post('/login',async(req,res)=>{
    var compare = null
    await con.promise().query('SELECT pass FROM users WHERE username = ?',
    [req.body.username]).then(([rows,fields])=>{
        if (rows[0]) {
            compare = rows[0].pass
        }
    })
    if (compare) {
        const matches = await bcrypt.compare(req.body.password,compare)
        if (matches) {
            req.session.username = req.body.username
            res.redirect('/')
            return
        }
    }
    res.redirect('/login')
})
router.post('/register',async(req,res)=>{
    var valid = true // User is eligible for registering
    if (req.body.password.length < 6) valid = false // If the password isn't of the required length
    else if (req.body.confirm !== req.body.password) valid = false // If the password and confirmed password don't match
    await con.promise().query('SELECT username FROM users WHERE username = ?',
    [req.body.username]).then(([rows,fields]) => {
        if (rows[0]) valid = false
    })
    if (valid) {
        bcrypt.hash(req.body.password,10,(err,hash)=>{
            con.query('INSERT INTO users (username,pass,account) VALUES (?,?,?)',
            [req.body.username,hash,'user'], (err,result)=>{
                if (err) console.log(err)
                req.session.username = con.escape(req.body.username)
                res.redirect('/')
            })
        })
    }
    else {
        res.redirect('/register')
    }
})
router.all('/',(req,res) => {
    res.render('homepage',{
        username: req.session.username,
        title: "Stories App"
    })
})
export default router