import express from 'express'
import con from './sql'
import bcrypt from 'bcrypt'
var router = express.Router()

router.get('/',async(req,res)=>{
    if (!req.session.username) {
        req.session.output = "You must be logged in to access your settings!"
        res.redirect('/')
        return
    }
    let [rows] = await con.promise().query("SELECT * FROM users WHERE username=?",
    [req.session.username])
    let bio: string | null = null
    if (rows[0]) {
        bio = rows[0].bio
    }
    else {
        req.session.output = "You must be logged in to access your settings!"
        res.redirect('/')
        return
    }
    res.render('settings',{
        title: "User Settings",
        username: req.session.username,
        output: req.session.output,
        success: req.session.success,
        bio: bio
    })
    delete req.session.output
    delete req.session.success
})
// Check that the user is logged in for all post requests
router.post('/*',async(req,res,next)=>{
    if (!req.session.username) {
        req.session.output = "You must be logged in to access your settings!"
        res.redirect('/')
        return
    }
    next()
})
router.post('/profile',async(req,res)=>{
    try {
        await con.promise().query("UPDATE users SET bio=? WHERE username=?",
        [req.body.bio,req.session.username])
    }
    catch (err) {
        console.log(err)
        req.session.output = "You are trying to update the profile of a user that doesn't exist."
        res.redirect('/settings')
        return
    }
    req.session.output = "Successfully updated profile!"
    req.session.success = true
    res.redirect('/settings')
})
router.post('/password',async(req,res)=>{
    let oldPass: string | null = null
    let passMatches: boolean = false
    let [rows] = await con.promise().query('SELECT pass FROM users WHERE username = ?',
    [req.session.username])
    if (rows[0]) {
        oldPass = rows[0].pass
    }
    if (oldPass) passMatches = await bcrypt.compare(req.body.oldpass,oldPass)
    if (!passMatches) {
        req.session.output = "The old password was entered incorrectly."
        res.redirect('/settings')
        return
    }
    if (!req.body.newpass || req.body.newpass != req.body.confirmpass) {
        req.session.output = "The new passwords do not match."
        res.redirect('/settings')
        return
    }
    bcrypt.hash(req.body.newpass,10,(err,hash)=>{
        con.query("UPDATE users SET pass=? WHERE username=?",
        [hash,req.session.username])
    })
    req.session.output = "Updated password!"
    req.session.success = true
    res.redirect('/settings')
    return
})
router.post('/delete',async(req,res)=>{
    con.query("DELETE FROM users WHERE username=?",
    [req.session.username])
    res.clearCookie('token')
    req.session.username=null

    req.session.output = "Your account has been deleted."
    req.session.success = true
    res.redirect('/')
    return
})
router.post('/sessionDelete',async(req,res)=>{
    con.query("DELETE FROM logins WHERE username=? AND NOT token=?",
    [req.session.username,req.cookies.token])

    req.session.output = "Logged out of all other sessions!"
    req.session.success = true
    res.redirect('/')
    return
})

export default router