const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://tmohamedaashir:SyTGpclFCi3YREKH@memoflowdatabase.o8e32xe.mongodb.net/";

// Connecting Mongo Atlas to the server
const connectToMongo = () => {
    if(mongoose.connect(mongoURI)){
        console.log('Mongo Connected!!')
    }
}

module.exports = connectToMongo;