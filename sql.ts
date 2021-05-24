import mysql from 'mysql'

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

// Returns true if the database is successfully connected
export function getConnected(): boolean {
    return connected
}
