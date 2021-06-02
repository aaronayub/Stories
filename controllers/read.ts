import express from 'express'
import renderPage from './renderPage'
import con from './sql'
import Story from '../interfaces/story'
var router = express.Router()

router.get('/:id([0-9]{1,})',async (req,res)=>{
    let story: Story | null = null
    let title: string = "Story Not Found!"
    let exists: boolean = false // Set to true if this story exists
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
                    created: rows[0].created.toLocaleDateString()
                }
                exists = true
                title = story.title
            }
        })
    // Also pass the user rating if this story exists and the user is logged in
    if (exists && req.session.username) {
        await con.promise().query("SELECT rating FROM ratings WHERE id = ? AND username = ?",[
            req.params.id,req.session.username]).then(([rows,fields])=>{
                if (story && rows[0]) story.yourRating = rows[0].rating
            })
    }
    renderPage(req,res,'read',title,story)
})

export default router