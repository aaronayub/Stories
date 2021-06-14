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
    res.render('user',{
        title: title,
        bio: bio,
        exists: exists,
        username: req.session.username,
        output: req.session.output,
        success: req.session.success,
        stories: stories
    })

    delete req.session.output
    delete req.session.success
})

export default router