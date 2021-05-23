import express from 'express'
import mysql from 'mysql'

var app = express()
var port = 3000
var connected: boolean = false

// Edit these parameters to authenticate to your own server if you are hosting this locally
var con = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password'
})

// Connect to the appropriate database
con.connect((err)=>{
    if (err) return
    con.query("use storiesApp",(err)=>{
        if (err) return
        connected = true
    })
})

app.get('/',(req,res)=>{
    if (connected) res.send("Still working on getting the site running!")
    else res.send("Sorry, there's a problem with the site right now.")
})

app.listen(port,()=>{
    console.log("Listening on port " + port)
})