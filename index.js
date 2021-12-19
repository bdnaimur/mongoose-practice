const express = require('express')
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const { Schema } = mongoose;

const blogSchema = new Schema({
    title: String, // String is shorthand for {type: String}
    author: String,
});

const port = 3000
const dbURL = 'ongodb+srv://mongoose_backend:naimur88@cluster0.esvfp.mongodb.net/crud?retryWrites=true&w=majority'

mongoose.connect(process.env.Mongoose_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log('connect MongoDb'))
    .catch(err => console.log('Mongo err', err))

const Blog = mongoose.model('Blog', blogSchema);
console.log(Blog);

app.get('/', (req, res) => {
    res.send('Welcome!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})