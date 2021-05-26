import mysql from 'mysql2'

// Edit these parameters to authenticate to your own server if you are hosting this locally
var con = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'storiesApp'
})
con.connect()

export default con
// var connected: boolean = false
// con.connect((err)=>{
//     if (err) return
//     con.query("use storiesApp",(err)=>{
//         if (err) return
//         connected = true
//     })
// })
// Returns true if the database is successfully connected
// export function getConnected(): boolean {
//     return connected
// }


// export function selectFrom(from: string, where: string, value: string) {
//     var query = 'SELECT * FROM ? WHERE ? = ?'
//     return con.query(query, [from,where,value])
// }