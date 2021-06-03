import express from 'express'
import con from './sql'
import renderPage from './renderPage'
import Story from '../interfaces/story'
var router = express.Router()

router.get('/',async (req,res) => {
    // Get the highest rated story
    let best: Story | null = null
    let [rows] = await con.promise().query("SELECT * FROM stories WHERE rating = (SELECT MAX(rating) FROM stories) LIMIT 1")
    if (rows[0]) best = {
        id: rows[0].id,
        title: rows[0].title,
        brief: rows[0].brief,
        username: rows[0].username,
        rating: rows[0].rating,
        created: rows[0].created.toLocaleDateString()
    }

    // Get the five most recently uploaded stories
    let recent: Story[] = []
    let results: any = await con.promise().query("SELECT * FROM stories ORDER BY created DESC LIMIT 5")
    results[0].forEach((row: any)=>{
        let story = {
            id: row.id,
            title: row.title,
            brief: row.brief,
            username: row.username,
            rating: row.rating,
            created: row.created.toLocaleDateString()
        }
        recent.push(story)
    })

    renderPage(req,res,'homepage','Stories App',best,recent)
})

export default router