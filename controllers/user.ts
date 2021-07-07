import express from 'express'
import con from './sql'
import Story from '../interfaces/story'
import fs from 'fs'
var router = express.Router()

router.get('/:name',async (req,res)=>{
    let title: string = "User Not Found!"
    let bio: string = ""
    let stories: Story[] = []
    let exists = false // Set to true if the user is found
    let [rows] = await con.promise().query("SELECT * FROM users WHERE username = ?",
    [req.params.name])
    if (rows[0]) {
        title = rows[0].username
        if (rows[0].bio) bio = rows[0].bio
        else bio = title + " has not written a biography yet."
        exists = true
    }
    // If this user exists, set the title, then find all the user's stories
    if (exists) {
        let results: any = await con.promise().query("SELECT * FROM stories WHERE username = ?",
        [req.params.name])
        results[0].forEach((row: any)=>{
            let story = {
                id: row.id,
                title: row.title,
                brief: row.brief,
                username: row.username,
                rating: row.rating,
                created: row.created.toLocaleDateString(),
                cover: false
            }
            let imagePath: string = __dirname+"/../public/covers/"+story.id
            if (fs.existsSync(imagePath)) {
                story.cover = true
            }
            stories.push(story)
        })
    }

    // Allow admins to delete stories from this page
    let canDelete: boolean = req.session.account == "admin"

    res.render('user',{
        title: title,
        bio: bio,
        exists: exists,
        username: req.session.username,
        output: req.session.output,
        success: req.session.success,
        stories: stories,
        canDelete: canDelete
    })

    delete req.session.output
    delete req.session.success
})
router.post('/:name/delete',async (req,res)=>{
    if (!req.session.username || req.session.account != "admin") {
        req.session.output = "You do not have permissions to perform this operation."
        res.redirect('/')
        return
    }

    // Allow an admin to delete their own account, but log them out if this is done.
    if (req.session.username == req.params.name) {
        delete req.session.account
        delete req.session.username
    }
    con.promise().query("DELETE FROM users WHERE username=?",
    [req.params.name])
    req.session.output = "User deleted."
    req.session.success = true
    res.redirect('/')
})

export default router