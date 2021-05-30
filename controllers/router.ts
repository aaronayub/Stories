import express from 'express'
import session from 'express-session'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import con from './sql'
import cookieParser from 'cookie-parser'
import sessionToken from './sessionToken'
import renderPage from './renderPage'
import Story from '../interfaces/story'
import '../interfaces/sessionData'
var router = express.Router()

router.use(express.static('public'))
router.use(session({secret: "StoriesApp session secret",saveUninitialized: false, resave: false}))
router.use(express.urlencoded({extended:false}))
router.use(cookieParser())
router.use(sessionToken)

router.get('/read-:id([0-9]{1,})',async (req,res)=>{
    let story: Story | null = null
    let title: string = "Story Not Found!"
    await con.promise().query("SELECT * FROM stories WHERE id = ?",[
        req.params.id]).then(([rows,fields])=>{
            if (rows[0]) {
                story = {
                    id: rows[0].id,
                    title: rows[0].title,
                    brief: rows[0].brief,
                    content: rows[0].content,
                    username: rows[0].username,
                    rating: rows[0].rating,
                }
                title = story.title
            }
        })
    renderPage(req,res,'read',title,story)
})
router.get('/login',(req,res)=>{
    if (req.session.username) {
        req.session.output = "You are already logged in."
        res.redirect('/')
        return
    }
    renderPage(req,res,'login','Log In')
})
router.get('/new',(req,res)=>{
    if (!req.session.username) {
        res.redirect('/')
        return
    }
    renderPage(req,res,'new','Add New Story')
})
router.post('/new',async (req,res)=>{
    if (!req.session.username) {
        req.session.output = "You must be logged in to submit a story."
        res.redirect('/')
        return
    }
    else if (!req.body.title) {
        req.session.output = "Your story must have a title."
        res.redirect('/new')
        return
    }
    else if (!req.body.content) {
        req.session.output = "You can't upload a blank story."
        res.redirect('/new')
        return
    }
    else {
        await con.promise().query("INSERT INTO stories (title, brief, content, username) VALUES (?,?,?,?)",
        [req.body.title,req.body.brief,req.body.content,req.session.username])
        req.session.output = "Story uploaded!"
        req.session.success = true
        res.redirect('/stories')
    }
})
router.get('/stories',(req,res)=>{
    if (!req.session.username) {
        req.session.output = "You have to be logged in to view your stories."
        res.redirect('/')
        return
    }
    
    renderPage(req,res,'stories','Your Stories')
})
router.get('/register',(req,res)=>{
    if (req.session.username) {
        req.session.output = "You are already logged in with your account. Please log out if you would like to register for a new account."
        res.redirect('/')
        return
    }
    renderPage(req,res,'register','Register')
})
router.get('/logout',(req,res)=>{
    delete req.session.username
    if (req.cookies.token) {
        res.clearCookie('token')
        con.query('DELETE FROM logins WHERE token = ?',[req.cookies.token])
    }

    res.redirect('/')
})
router.post('/login',async(req,res)=>{
    let compare: string | null = null
    await con.promise().query('SELECT pass FROM users WHERE username = ?',
    [req.body.username]).then(([rows,fields])=>{
        if (rows[0]) {
            compare = rows[0].pass
        }
    })
    let matches: boolean = false
    if (compare) {
        matches = await bcrypt.compare(req.body.password,compare)
    }
    if (matches) { // Credentials match, so the user logs in
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
router.post('/register',async(req,res)=>{
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
router.get('/',(req,res) => {
    renderPage(req,res,'homepage','Stories App')
})
router.get('/*',(req,res)=>{
    renderPage(req,res,'404',"Page Not Found")
})
export default router