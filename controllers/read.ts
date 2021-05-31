import express from 'express'
import renderPage from './renderPage'
import con from './sql'
import Story from '../interfaces/story'
var router = express.Router()

router.get('/:id([0-9]{1,})',async (req,res)=>{
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
                    created: rows[0].created.toLocaleDateString()
                }
                title = story.title
            }
        })
    renderPage(req,res,'read',title,story)
})

export default router