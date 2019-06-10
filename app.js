const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const session = require('express-session')
const cookie = require('cookie-parser')

/* const randomcards=require('./Card');//引入Card.js

const pokers = randomcards.pokers

const randomCards = randomcards.randomCards */

const gameRouter = require('./routes/game')

const indexRouter = require('./routes/index')
require('./models/mysql')

const port = 3000; //网页输入http://localhost:3000/可访问页面

/* const db = require('./db'); */

app.use(express.static('Public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookie())
app.use(session({
    secret: 'card game',
    resave: true,
    saveUninitialized: true
}))
app.use(bodyParser.urlencoded({
    extended: false
}));



app.use('/game',gameRouter)

app.use('/',indexRouter)

app.listen(port, () => {
    console.log('Server start on port ' + port);
});