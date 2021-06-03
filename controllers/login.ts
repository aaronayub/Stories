import express from 'express'
import renderPage from './renderPage'
import con from './sql'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
var router = express.Router()

router.get('/',(req,res)=>{
    if (req.session.username) {
        req.session.output = "You are already logged in."
        res.redirect('/')
        return
    }
    renderPage(req,res,'login','Log In')
})
router.post('/',async(req,res)=>{
    let givenPass: string | null = null
    let passMatches: boolean = false
    let [rows] = await con.promise().query('SELECT pass FROM users WHERE username = ?',
    [req.body.username])
    if (rows[0]) givenPass = rows[0].pass
    if (givenPass) passMatches = await bcrypt.compare(req.body.password,givenPass)
    if (passMatches) { // Credentials match, so the user logs in
        req.session.username = req.body.username

        if (req.body.remember) { // If the user wants to be remembered across sessions
            let token: string = crypto.randomBytes(64).toString('hex')
            con.query('INSERT INTO logins (token,username) VALUES (?,?)',
            [token,req.body.username])

            let expiry: Date = new Date()
            expiry.setDate(expiry.getDate() + 14)
            res.cookie('token',token,{expires: expiry})
        }
        res.redirect('/')
        return
    }
    // If this section is reached, then the user did not enter valid credentials.
    req.session.output = "Invalid username or password."
    res.redirect('/login')
})

export default router