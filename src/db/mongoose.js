const mongoose = require('mongoose');

// Connect to mongoDB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser:true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() =>{
    console.log('MongoDB connected')
}).catch((e) =>{
    console.log(e)
});



// "mongodb://127.0.0.1:27017/developosts-api"


