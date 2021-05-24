import express from 'express'
import exphbs from 'express-handlebars'
import router from './router'

var app = express()
var port = 3000

app.engine('hbs',exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}))
app.set('view engine','hbs')
app.set('views','./views')

app.use(router)
app.listen(port,()=>{
    console.log("Listening on port " + port)
})