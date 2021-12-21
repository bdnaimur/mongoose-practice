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

const Blog = mongoose.model('Slag', blogSchema);
console.log(Blog);
// post a single documnets
app.post('/posts', async function (req, res) {
    const post = req.body;
    const createdPost = await Blog.create(post);
    return res.status(201).json(createdPost);
  });
// getting all Posts
app.get('/posts', async function(req, res) {
    const result = await Blog.find({});
    return res.status(200).json(result);
})

// getting Post by Id
app.get('/posts/:id', async function(req, res) {
    const postId = req.params.id;
    const result = await Blog.findById(postId);
    return res.status(200).json(result);
})

// update data by Id
app.put('/posts/:id', async function(req, res) {
    const postId = req.params.id;
    const updateData = req.body;
    const result = await Blog.findByIdAndUpdate(postId, updateData, { new: true });
    return res.status(200).json(result);
})

// delete documents
app.delete('/posts/:id', async function(req, res) {
    const postId = req.params.id;
    const result = await Blog.findByIdAndDelete(postId);  
    return res.status(200).json(result);
})
app.get('/', (req, res) => {
    res.send('Welcome!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})