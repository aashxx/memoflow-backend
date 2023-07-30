const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

connectToMongo(); // Connecting MongoDB to the server

app.use(express.json());
app.use(cors());

app.use('/api/auth', require('./routes/auth')) // Endpoint for user signup and login
app.use('/api/notes', require('./routes/note')) // Endpoint for CRUD in notes

app.get('/',(req,res)=>{
    res.send('Hello Bro!');
})

app.listen(port, ()=> {
    console.log(`App listening at http://localhost:${port}`)
})