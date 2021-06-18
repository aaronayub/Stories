import express from 'express'
import renderPage from './renderPage'
import con from './sql'
import multer from 'multer'
import fs from 'fs'
import Story from '../interfaces/story'
import { nextTick } from 'process'
var router = express.Router()
const coversPath = "./public/covers/"
var upload = multer({dest: coversPath})

router.get('/:id([0-9]{1,})',async(req,res)=>{
    if (!req.session.username) {
        req.session.output = "You must be logged in to edit a story."
        res.redirect('/')
        return
    }
    let story: Story | null = null
    let [rows] = await con.promise().query("SELECT * FROM stories WHERE id = ?",
    [req.params.id])
    if (rows[0]) {
        story = {
            id: rows[0].id,
            title: rows[0].title,
            brief: rows[0].brief,
            content: rows[0].content,
            username: rows[0].username,
            rating: rows[0].rating,
            created: rows[0].created.toLocaleDateString(),
            cover: false
        }
        let imagePath: string = __dirname+"/../public/covers/"+story.id
        if (fs.existsSync(imagePath)) {
            story.cover = true
        }
        // Redirect if the user tries to edit a story that they haven't written.
        if (req.session.username != story.username) {
            req.session.output = "You are not the author of this story, and thus cannot edit it."
            res.redirect('/')
            return
        }
    }
    if (!story) {
        req.session.output = "The story you are trying to edit doesn't exist!"
        res.redirect('/')
        return
    }
    renderPage(req,res,'edit','Edit Story',story)
})
router.post('/:id([0-9]{1,})', upload.single('cover'), async (req,res)=>{
    if (!req.session.username) {
        req.session.output = "You must be logged in to edit a story."
        res.redirect('/')
        return
    }
    let username: string | null = null
    let [rows] = await con.promise().query("SELECT username FROM stories WHERE id = ?",
    [req.params.id])
    if (rows[0]) {
       username = rows[0].username
    }
    if (req.session.username != username) {
        req.session.output = "You do not have permission to edit this story."
        res.redirect('/')
        return
    }

    // If the user wants to delete a story
    if (req.body.delete) {
        con.query("DELETE FROM stories WHERE id=?",
        [req.params.id])
        // Delete the cover too, if it exists
        fs.unlink(coversPath+req.params.id,()=>{})
        req.session.output = "Story deleted!"
        req.session.success = true
        res.redirect('/stories')
        return
    }

    else if (!req.body.title) {
        req.session.output = "Your story must have a title."
        res.redirect('/edit/'+req.params.id)
        return
    }
    else if (!req.body.content) {
        req.session.output = "You can't upload a blank story."
        res.redirect('/edit/'+req.params.id)
        return
    }


    // If the user wants to remove the book's cover
    if (req.body.removeCover) {
        fs.unlink(coversPath+req.params.id,()=>{})
    }
    // If the author also uploaded a book cover, check that it meets some requirements
    if (req.file && !req.body.removeCover) { 
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

    const results: any = await con.promise().query("UPDATE stories SET title=?, brief=?, content=?, username=? WHERE id = ?",
    [req.body.title,req.body.brief,req.body.content,req.session.username,req.params.id])
    if (req.file && !req.body.removeCover) { // Upload the cover now with the corresponding id if needed
        fs.renameSync(coversPath+req.file.filename,coversPath+req.params.id)
    }
    req.session.output = "Story updated!"
    req.session.success = true
    res.redirect('/stories')
})

export default router
