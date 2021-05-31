import express from 'express'
import renderPage from './renderPage'
import con from './sql'
import Story from '../interfaces/story'
var router = express.Router()

router.get('/',async (req,res)=>{
    if (!req.session.username) {
        req.session.output = "You have to be logged in to view your stories."
        res.redirect('/')
        return
    }
    
    let stories: Story[] = []
    const results : any = await con.promise().query("SELECT * FROM stories WHERE username = ?",
    [req.session.username])
    results[0].forEach((row: any)=>{
        let story = {
            id: row.id,
            title: row.title,
            brief: row.brief,
            content: row.content,
            username: row.username,
            rating: row.rating,
            created: row.created.toLocaleDateString()
        }
        stories.push(story)
    })
    console.log(stories)
    renderPage(req,res,'stories','Your Stories',null,stories)
})

export default router