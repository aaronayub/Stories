import express from 'express'
import renderPage from './renderPage'
var router = express.Router()

router.get('/',(req,res)=>{
    if (!req.session.username) {
        req.session.output = "You have to be logged in to view your stories."
        res.redirect('/')
        return
    }
    
    renderPage(req,res,'stories','Your Stories')
})

export default router