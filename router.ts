import express from 'express'
import session from 'express-session'
import sql = require("./sql")
var router = express.Router()


router.get('/', (req,res) => {
    // if (req.session) {
    //     req.session.test = "test"
    // }
    res.render('homepage',{

    })
})
export default router