const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const dbConnection = require('./helpers/dbConnection');

dbConnection();
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept" )
    next();
})

app.use('/api/v1/user', require('./routes/user'));
app.use('/api/v1/post', require('./routes/post'));
app.use('/api/v1/like', require('./routes/like'));
app.use('/api/v1/comment', require('./routes/comment'));

app.listen(port, () => {
    console.log(`listening at port ${port}`)
})