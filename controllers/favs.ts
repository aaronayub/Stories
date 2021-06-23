import express from 'express'
import renderPage from './renderPage'
import con from './sql'
import Story from '../interfaces/story'
var router = express.Router()

router.get('/',async (req,res)=>{
    if (!req.session.username) {
        req.session.output = "You need to be logged in to view this page."
        res.redirect('/')
        return
    }

    let stories: Story[] = []
    const results : any = await con.promise().query("SELECT stories.*, COUNT (favs.id=stories.id) as favCount FROM stories LEFT JOIN favs ON (stories.id=favs.id) WHERE EXISTS (SELECT * FROM favs WHERE favs.username=? and favs.id=stories.id) GROUP BY stories.id",
    [req.session.username,req.session.username])
    results[0].forEach((row: any)=>{
        let story = {
            id: row.id,
            title: row.title,
            brief: row.brief,
            content: row.content,
            username: row.username,
            rating: row.rating,
            created: row.created.toLocaleDateString(),
            favCount: row.favCount
        }
        stories.push(story)
    })
    renderPage(req,res,'favs','Your Favourites',null,stories)
})

export default router