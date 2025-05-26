if(process.env.NODE_ENV != 'production'){
    require('dotenv').config()
}

const express = require('express')
const session = require('express-session')

//database imports
const mongoStore = require('connect-mongo')

//route imports
const indexRouter = require('./routes/index')

//utils imports
const path = require('path')

//middlewares imports
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')

const app = express()

//view section
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

//middlewares use
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(cookieParser())

//database
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => {
    console.error(error)
})
db.once('open',() => {
    console.log('Connected to DataBase')
})

//session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
        ttl: 60*30
    }),
    cookie: {
        maxAge: 1000*60*30,
        secure: false,
        httpOnly: true,
        sameSite: 'Lax'
    }
}))

//using routers
app.use('/',indexRouter)

//starting server
app.listen(3000,() => {console.log('Listening on port 3000')})