import express from 'express'
import con from './sql'
import Story from '../interfaces/story'
import Comment from '../interfaces/comment'
import fs from 'fs'
var router = express.Router()

router.get('/:id([0-9]{1,})',async (req,res)=>{
    let story: Story | null = null
    let comments: Comment[] = []
    let title: string = "Story Not Found!"
    let exists: boolean = false // Set to true if this story exists
    let [rows] = await con.promise().query("SELECT stories.*, COUNT(favs.username) AS favTrue FROM stories LEFT JOIN favs ON (stories.id = favs.id AND favs.username=?) WHERE stories.id = ?",
    [req.session.username,req.params.id])
    if (rows[0]) {
        story = {
            id: rows[0].id,
            title: rows[0].title,
            brief: rows[0].brief,
            content: rows[0].content,
            username: rows[0].username,
            rating: rows[0].rating,
            created: rows[0].created.toLocaleDateString(),
            cover: false,
            fav: rows[0].favTrue
        }
        let imagePath: string = __dirname+"/../public/covers/"+story.id
        if (fs.existsSync(imagePath)) {
            story.cover = true
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

    // Get comments if the story exists
    if (exists) {
        // Get all comments for this story, and include the user's rating of the story, if that user has rated the story.
        const [results]: any = await con.promise().query("SELECT storyComments.*, ratings.rating FROM storyComments LEFT JOIN ratings ON (storyComments.username=ratings.username AND storyComments.id=ratings.id) WHERE storyComments.id=?",
        [req.params.id])
        results.forEach((row: any)=>{
            let comment: Comment = {
                username: row.username,
                created: row.created.toLocaleString(),
                comment: row.comment,
                id: row.id,
                rating: row.rating,
                cid: row.cid,
                delete: (req.session.username == row.username)
            }
            comments.push(comment)
        })
    }

    res.render('read',{
        title: title,
        username: req.session.username,
        output: req.session.output,
        success: req.session.success,
        story: story,
        comments: comments
    })
    delete req.session.output
    delete req.session.success
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
        if (req.params.rating == "0") {
            await con.promise().query("DELETE FROM ratings WHERE id=? AND username = ?",
            [req.params.id,req.session.username])
        }
        else {
            await con.promise().query("REPLACE INTO ratings (id,username,rating) VALUES (?,?,?)",
            [req.params.id,req.session.username,req.params.rating])
        }

        let [rows] = await con.promise().query("SELECT IFNULL(AVG(rating),0) as avg FROM ratings WHERE id=?",
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
// If the user wants to leave a comment
router.post('/:id([0-9]{1,})/comment',async(req,res)=>{
    if (!req.session.username) {
        req.session.output = "You must be logged in to leave comments."
        return;
    }
    try { // Use a try catch block to prevent users from trying to comment stories that don't exist
        await con.promise().query("INSERT INTO storyComments (id,username,comment) VALUES (?,?,?)",
        [req.params.id,req.session.username,req.body.comment])
    }
    catch (err) {
        req.session.output = "This story doesn't exist!"
        res.redirect('/')
        return;
    }
    
    res.redirect('/read/'+req.params.id)
})
router.post('/:id([0-9]{1,})/favourite/',async(req,res)=>{
    // Send "Bad Request" code if the user tries to favourite something without being logged in
    if (!req.session.username) {
        res.status(400).send('You are not logged in!')
        return
    }
    // If the user is adding the story to their favourites
    if (req.body.add == 'true') {
        try {
            await con.promise().query("INSERT INTO favs (id,username) VALUES (?,?)",
            [req.params.id,req.session.username])
            res.status(200).send(true)
        }
        catch (err) {
            console.log(err)
            res.status(400).send('Invalid request!')
        }
    }
    // If the user is removing the story from their favourites
    else if (req.body.add == 'false') {
        await con.promise().query("DELETE FROM favs WHERE id=? AND username=?",
        [req.params.id,req.session.username])
        res.status(200).send(false)
    }
})
router.get('/:id([0-9]{1,})/delete/:cid([0-9]{1,})',async(req,res)=>{
    if (!req.session.username) {
        req.session.output = "You must be logged in to delete comments."
        return;
    }
    try { 
        await con.promise().query("DELETE FROM storyComments WHERE cid=? AND username=?",
        [req.params.cid,req.session.username]) // Prevent users from deleting another user's comments with the username
    }
    catch (err) {
        req.session.output = "You can't delete another user's comments."
        res.redirect('/')
        return;
    }
    
    res.redirect('/read/'+req.params.id)
})

export default router