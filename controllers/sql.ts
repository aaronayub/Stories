import mysql from 'mysql2'
var config = require('../sql/config.json')

// Edit the parameters in sql/config.json to authenticate to your own server if you are hosting this locally
var con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
})
con.connect()

export default con