const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const jwt = require("jsonwebtoken");
// const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }))

// mongoose.connect('mongodb+srv://user:BBmKsYRn4teOgSuI@cluster0.4pgnj8w.mongodb.net/test?retryWrites=true&w=majority');
const mongoURI = 'mongodb://127.0.0.1:27017/test-db';
const client = new MongoClient(mongoURI);

const jwtSecret = 'SWtJIr9-3UVNLQgqSLHi3T_xhSH2BpVp3wz8XfqCMU';

// get customers
app.get('/customers', async (req, res) => {
  try {
    await client.connect();

    const collection = client.db().collection('customers');

    const customers = await collection.find({ active: true }).toArray();

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Error fetching customers' });
  } finally {
    await client.close();
  }
});

// get list-transaction
app.post('/list-transaction', async (req, res) => {
  try {
    await client.connect();

    const collection = client.db().collection('transactions');
    const id = req.body.id;
    const transactions = await collection.findOne({ account_id: Number(id) });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Error fetching customers' });
  } finally {
    await client.close();
  }
});

// get transaction <5000
app.get('/account-transaction', async (req, res) => {
  try {
    await client.connect();

    const collection = client.db().collection('transactions');

    const pipeline = [
      {
        $match: {
          "transactions.amount": { $lt: 5000 }
        }
      },
      {
        $project: {
          _id: 0,
          account_id: 1
        }
      }
    ];

    const customers = await collection.aggregate(pipeline).toArray();

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Error fetching customers' });
  } finally {
    await client.close();
  }
});

// get distinct-products
app.get('/distinct-products', async (req, res) => {
  try {
    await client.connect();

    const collection = client.db().collection('accounts');

    const pipeline = [
      {
        $unwind: '$products'
      },
      {
        $group: {
          _id: null,
          distinctProducts: { $addToSet: '$products' }
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const distinctProducts = result.length > 0 ? result[0].distinctProducts : [];

    res.json(distinctProducts);
  } catch (error) {
    console.error('Error fetching distinct products:', error);
    res.status(500).json({ error: 'Error fetching distinct products' });
  } finally {
    await client.close();
  }
});

// Registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Create a new user document
  const user = new User({ username, password });
  try {
    await user.save();
    res.status(201).send('Registration successful');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });

    if (user) {
      const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: 'never' });

      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });

    }
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});


// Start the server
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});