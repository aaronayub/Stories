import express from 'express'
import renderPage from './renderPage'
import con from './sql'
import Story from '../interfaces/story'
var router = express.Router()

router.get('/:id([0-9]{1,})',async (req,res)=>{
    let story: Story | null = null
    let title: string = "Story Not Found!"
    let exists: boolean = false // Set to true if this story exists
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
            created: rows[0].created.toLocaleDateString()
        }
        exists = true
        title = story.title
    }
        
    // Also pass the user rating if this story exists and the user is logged in
    if (exists && req.session.username) {
        let [rows] = await con.promise().query("SELECT rating FROM ratings WHERE id = ? AND username = ?",[
            req.params.id,req.session.username])
        if (story && rows[0]) story.yourRating = rows[0].rating
    }
    renderPage(req,res,'read',title,story)
})
// If the user wants to rate a story, it is done here
router.post('/:id([0-9]{1,})/:rating([0-5])', async (req,res) =>{
    // Send "Bad Request" code if the user tries to rate something without being logged in
    if (!req.session.username) {
        res.status(400).send('You are not logged in!')
        return
    }
    else if (!req.params.id || !req.params.rating) {
        res.status(400).send('You must provide a story id and rating to rate a story.')
        return
    }
    
    // Wrap a successful request in a try catch in case someone tries to crash the server with an invalid request.
    // This puts less load on the database server, compared to searching for if the story exists with each request.
    try {
        await con.promise().query("REPLACE INTO ratings (id,username,rating) VALUES (?,?,?)",
        [req.params.id,req.session.username,req.params.rating])

        let [rows] = await con.promise().query("SELECT AVG(rating) as avg FROM ratings WHERE id=?",
        [req.params.id])
        let average = rows[0].avg
        con.query("UPDATE stories SET rating = ? WHERE id = ?",
        [average,req.params.id])
        res.status(200).send(parseFloat(average).toFixed(2)) // Return the new average to the user. No need to wait for the stories table to update the rating, since they are identical.
        return
    }
    catch (err) {
        console.log(err)
        res.status(400).send('Invalid request!')
    }
})

export default router