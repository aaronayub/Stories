import express from 'express'
import renderPage from './renderPage'
import con from './sql'
import bcrypt from 'bcrypt'
var router = express.Router()

router.get('/',(req,res)=>{
    if (req.session.username) {
        req.session.output = "You are already logged in with your account. Please log out if you would like to register for a new account."
        res.redirect('/')
        return
    }
    renderPage(req,res,'register','Register')
})
router.post('/',async(req,res)=>{
    let valid: boolean = true // User is eligible for registering
    if (req.body.password.length < 6) valid = false // If the password isn't of the required length
    else if (req.body.confirm !== req.body.password) valid = false // If the password and confirmed password don't match
    await con.promise().query('SELECT username FROM users WHERE username = ?',
    [req.body.username]).then(([rows,fields]) => {
        if (rows[0]) {
            valid = false
            req.session.output = "Sorry, this username is already taken."
        }
    })
    if (valid) {
        bcrypt.hash(req.body.password,10,(err,hash)=>{
            con.query('INSERT INTO users (username,pass,account) VALUES (?,?,?)',
            [req.body.username,hash,'user'], (err,result)=>{
                if (err) console.log(err)
                req.session.username = req.body.username
                req.session.output = "Successfully registered!"
                req.session.success = true
                res.redirect('/')
            })
        })
    }
    else {
        res.redirect('/register')
    }
})

export default router