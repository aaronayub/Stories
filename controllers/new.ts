import express from 'express'
import renderPage from './renderPage'
import con from './sql'
var router = express.Router()

router.get('/',(req,res)=>{
    if (!req.session.username) {
        res.redirect('/')
        return
    }
    renderPage(req,res,'new','Add New Story')
})
router.post('/',async (req,res)=>{
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

export default router