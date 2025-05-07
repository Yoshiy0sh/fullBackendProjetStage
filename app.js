if(process.env.NODE_ENV != 'production'){
    require('dotenv').config()
}

const express = require('express')
const path = require('path')
const session = require('express-session')
const mongoStore = require('connect-mongo')
const accountRouter = require('./routes/account')
const loanRouter = require('./routes/loan')
const methodOverride = require('method-override')

const app = express()

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded())
app.use(express.json())
app.use(methodOverride('_method'))


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => {
    console.error(error)
})
db.once('open',() => {
    console.log('Connected to DataBase')
})

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
        httpOnly: true
    }
}))

app.use('/account',accountRouter)
app.use('/loan',loanRouter) 

app.listen(3000,() => {console.log('Listening on port 3000')})