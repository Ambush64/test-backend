const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cors({ origin: '*' }))

app.use(function (req, res, next) {
    const allowedOrigins = ['https://ambush64.github.io/test-frontend', 'https://ambush64.github.io/test-frontend/','ambush64.github.io/test-frontend',"*"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Origin', origin);
  }

    // res.header('Access-Control-Allow-Origin', 'https://mern-app-zkd6.vercel.app');
    res.header('Access-Control-Request-Method', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Expose-Headers', 'Content-Type');
    next();
});

app.get('/', (req, res) => {
    res.send("GET Request Called");
    res.json("hello");
})

const generateToken = (userId) => {
    const jwtSecret = 'SWtJIr9-3UVNLQgqSLHi3T_xhSH2BpVp3wz8XfqCMU';


  const tokenData = {
    userId: userId,
    expiresIn: '3650d', // 10 years (365 days * 10)
  };

  return jwt.sign(tokenData, jwtSecret);
};

mongoose.connect('mongodb+srv://user:BBmKsYRn4teOgSuI@cluster0.4pgnj8w.mongodb.net/test?retryWrites=true&w=majority');



const User = mongoose.model('User', {
  username: String,
  password: String,
});

const Product = mongoose.model('Product', {
  name: String,
  description: String,
  price: Number,
  imageLink: String,
});


// Registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const user = new User({ username, password });
  try {
    await user.save();
    res.status(201).send('Registration successful');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });


    if (user) {
// const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: 'never' });
        const token = generateToken(user._id );

console.log(1)

      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });

    }
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

app.post('/api/add-product', async (req, res) => {
  const { name, description, price, imageLink } = req.body;

  try {
    const product = new Product({ name, description, price, imageLink });

    await product.save();

    res.status(200).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Failed to add product:', error);
    res.status(500).json({ message: 'Failed to add product' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Start the server
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
