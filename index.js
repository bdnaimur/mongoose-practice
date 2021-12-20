const express = require('express')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const { Schema } = mongoose;

const blogSchema = new Schema({
    name: {
        type: String,
        required: true,
      },
      username: {
          type: String,
          required: true,
      },
      password: {
          type: String,
          required: true,
      },

      token: String,

      status: {
        type: String,
        enum: ["active", "inactive"],
      }
});

const port = 3500
const dbURL = 'ongodb+srv://mongoose_backend:naimur88@cluster0.esvfp.mongodb.net/crud?retryWrites=true&w=majority'

mongoose.connect(process.env.Mongoose_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log('connect MongoDb'))
    .catch(err => console.log('Mongo err', err))

const Blog = mongoose.model('User', blogSchema);
console.log(Blog);

app.post('/user/signup', async function (req, res) {
    const post = req.body;
    console.log(post);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const token = await jwt.sign({
        username:req.body.username,
        name: req.body.name,
    }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
    console.log(token);
    const createdPost = await Blog.create({
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        token: token
    });
    return res.status(201).json(createdPost);
  })

app.post('/user/login', async (req, res) =>{
    const user = await Blog.find({username: req.body.username})
    console.log(user);
})

app.get('/', (req, res) => {
    res.send('Welcome!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})