import express from 'express'
import renderPage from './renderPage'
import con from './sql'
import multer from 'multer'
import fs from 'fs'
var router = express.Router()
const coversPath = "./public/covers/"
var upload = multer({dest: coversPath})

router.get('/',(req,res)=>{
    if (!req.session.username) {
        req.session.output = "You must be logged in to create a story."
        res.redirect('/')
        return
    }
    renderPage(req,res,'new','Add New Story')
})
router.post('/', upload.single('cover'), async (req,res)=>{
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

    // If the author also uploaded a book cover, check that it meets some requirements
    if (req.file) { 
        if (!(req.file.mimetype == 'image/jpeg'
            || req.file.mimetype == 'image/jpg'
            || req.file.mimetype == 'image/gif'
            || req.file.mimetype == 'image/x-png'
            || req.file.mimetype == 'image/png')) {
            req.session.output = "Invalid file type for the cover. The following file extensions are supported: .jpg, .jpeg, .gif, .png"
            res.redirect('/new')
            return
        }
        if (req.file.size > 2097152) {
            req.session.output = "The cover's file size is too large. Covers may be up to 2MB."
            res.redirect('/new')
            return
        }
    }

    const results: any = await con.promise().query("INSERT INTO stories (title, brief, content, username) VALUES (?,?,?,?)",
    [req.body.title,req.body.brief,req.body.content,req.session.username])
    if (req.file) { // Upload the cover now with the corresponding id if needed
        fs.renameSync(coversPath+req.file.filename,coversPath+results[0].insertId)
    }
    req.session.output = "Story uploaded!"
    req.session.success = true
    res.redirect('/stories')
})

export default router
