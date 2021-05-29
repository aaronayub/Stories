import express from 'express'
import con from './sql'

// Automatically log the user in if they have a valid authentication token
var sessionToken = async function (req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.session.username && req.cookies.token) {
        await con.promise().query('SELECT username FROM logins WHERE token = ?',
        [req.cookies.token]).then(([rows,fields])=>{
            if (rows[0]) { // If this is a valid token, then log the user in
                req.session.username = rows[0].username
            }
            else { // Otherwise, erase the token from the user's cookies
                res.clearCookie('token')
            }
        })
    }
    next()
}

export default sessionToken