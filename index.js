const express = require('express')
const path = require('path');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const { Schema } = mongoose;

const uploads_folder = './uploads';

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, uploads_folder)
    },
    filename: (req, file, cb) =>{
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname
                            .replace(fileExt, "")
                            .toLowerCase()
                            .split(" ")
                            .join("-") + "-" + Date.now() + fileExt;
        cb(null, fileName)
    }
})
var upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
    fileFilter: (req, file, cb) =>{
        if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
            cb(null, true)
        }
        else{
            cb(new Error("File type does not match"))
        }
    }
})
// const locationSchema = new Schema({
//     city: String,
//     country: String, 
//     user: {
//         type: mongoose.Types.ObjectId,
//         ref: Blog
//     }
// })
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
      image: String,

      token: String,

      status: {
        type: String,
        enum: ["active", "inactive"],
      }
});

const Blog = mongoose.model('Blog', blogSchema);
const locationSchema = new Schema({
    city: String,
    country: String, 
    user: {
        type: mongoose.Types.ObjectId,
        ref: Blog
    }
})
const Location = mongoose.model('Location', locationSchema);

const port = 3500
const dbURL = 'ongodb+srv://mongoose_backend:naimur88@cluster0.esvfp.mongodb.net/crud?retryWrites=true&w=majority'

mongoose.connect(process.env.Mongoose_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log('connect MongoDb'))
    .catch(err => console.log('Mongo err', err))

    const createToken = (req) =>{
        token = jwt.sign({
        username:req.body.username,
        name: req.body.name,
    }, process.env.JWT_SECRET)
        return token;
    }


const checkLogin = (req, res, next) => {
    const { authorization } = req.headers;
    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { username, userId } = decoded;
        console.log(userId);
        req.username = username;
        req.userId = userId;
        next();
    } catch(err) {
        next("Authentication failure!");
    }
};
// adding Location
app.post('/user/location', checkLogin, async(req, res)=>{
    console.log(req.userId);
    const locationData = await Location.create({
        city: req.body.city,
        country: req.body.country,
        user: req.userId
    });
    return res.status(201).json(locationData);
})
app.get('/user/locations', async(req, res)=>{
    const locationData = await Location.find({}).populate("user");
    return res.status(200).json(locationData);
})
app.post('/user/location/:id', checkLogin, async(req,res)=>{

    const locationData = await Location.create({
        city: req.body.city,
        country: req.body.country,
        name: req.name
    });
    return res.status(201).json(locationData);
})

app.post('/user/signup', async function (req, res) {
    const post = req.body;
    console.log(post);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const token = await createToken(req);
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
    console.log(req.body.username);
    const user = await Blog.find({
        username: req.body.username
    })
    console.log(user);
    const userId = user[0]._id;
    token = jwt.sign({
        username:user[0].username,
        userId: userId,
    }, process.env.JWT_SECRET)
    
    const data = await Blog.create({
        name: user[0].name,
        username: user[0].username,
        password: user[0].password,
        token
    })
    console.log(user);
    return res.json(data)
})

app.post('/file', upload.single('avater'), async (req, res)=>{
    console.log(req.body, req.file.filename);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const token = await createToken(req);
    const uploadedData = {
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        image: req.file.filename,
        token: token
    }
    const data = await Blog.create(uploadedData);
    return res.json(data)
})

app.get('/user/:id', checkLogin, async function (req, res) {
    const postId = req.params.id;
    const result = await Blog.findById(postId);
    return res.status(200).json({
        data: result,
        message: "Take your data"
    });
})




app.get('/users', async(req,res)=>{
    const users = await Blog.find();
    res.send(users)
})



// post a single documnets
app.post('/posts', async function (req, res) {
    const post = req.body;
    const createdPost = await Blog.create(post);
    return res.status(201).json(createdPost);
  });
// getting all Posts
app.get('/user', async function(req, res) {
    const result = await Blog.find({});
    return res.status(200).json(result);
})

// getting Post by Id
app.get('/posts/:id', async function(req, res) {
    const postId = req.params.id;
    const result = await Blog.findById(postId);
    return res.status(200).json(result);
})

app.get('/', (req, res) => {
    res.send('Welcome!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})