const port = 8090
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const app = express()
const mysql = require("mysql");

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



const SECRET_KEY = "SAMPLEDATAOOWSAMPLEDATAOOWSAMPLEDATAOOWSAMPLEDATAOOWSAMPLEDATAOOW"

const db = mysql.createConnection({
  host: "sql12.freesqldatabase.com",
  user: "sql12648279",
  password: "BigXSkcAWb",
  database: "sql12648279",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the MySQL database");
});

const generateAuthToken = async function (email) {
  try {
    const token = jwt.sign({ _id: email }, SECRET_KEY);

    db.query(
      'UPDATE customer SET token = ? WHERE email = ?',
      [token, email],
      (err) => {
        if (err) {
          console.error(err);
          throw err;
        }
        console.log('Token updated in the database');
      }
    );

    return token;
  } catch (error) {
    console.log(error);
  }
};


app.post('/signup', async (req, res) => {
  const { email, password, name, token } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({ error: 'Please fill in all the required fields' });
  }

  try {
    // Check if the email already exists in the database
    db.query('SELECT * FROM customer WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results.length > 0) {
        return res.status(422).json({ error: 'Email is already registered' });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert the user into the database
        db.query(
          'INSERT INTO customer (email, password,name,token) VALUES (?, ?, ?,?)',
          [email, hashedPassword, name, token],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
          }
        )
      }
    }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post("/signin", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please fill in all the required fields" });
    }

    // Check if the email exists in the database
    db.query('SELECT * FROM customer WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: "Invalid Credentials" });
      }

      const user = results[0];

      // Compare the provided password with the hashed password in the database
      bcrypt.compare(password, user.password, async (err, isMatch) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (!isMatch) {
          return res.status(400).json({ error: "Invalid Credentials" });
        } else {
          token = await generateAuthToken(user.email);

          res.status(200).json({
            message: "Login successful",
            cookie: token
          });

          console.log("Login Successful");
        }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.get('/api/astrologers', (req, res) => {
  const query = 'SELECT name,id,gender,mobile_number,email,experience,short_bio FROM astrologer';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching astrologers:', err);
      res.status(500).json({ error: 'Error fetching astrologers' });
    } else {

      res.json(results);
    }
  });
});

app.get('/api/users', (req, res) => {
  const query = 'SELECT name,id,mobileno,wallet FROM users';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Error fetching users' });
    } else {
      res.json(results);
    }
  });
});


app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT name, id, mobileno, wallet FROM users WHERE id = ?';

  db.query(query, [userId], (err, results) => {

    if (err) {
      console.error('Error fetching user by ID:', err);
      res.status(500).json({ error: 'Error fetching user by ID' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(results[0]);
    }
  });
});

app.get('/api/astrologers/:id', (req, res) => {
  const userId = req.params.id;
  console.log("first")
  const query = 'SELECT name,id,gender,mobile_number,email,experience,short_bio FROM astrologer WHERE id = ?';


  db.query(query, [userId], (err, results) => {

    if (err) {
      console.error('Error fetching astrologer by ID:', err);
      res.status(500).json({ error: 'Error fetching astrologer by ID' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(results[0]);
    }
  });
});


// Update a user by ID
app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { name, mobileno, wallet } = req.body;
  const updateUserQuery = 'UPDATE users SET name = ?, mobileno = ?, wallet = ? WHERE id = ?';

  db.query(updateUserQuery, [name, mobileno, wallet, userId], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: 'Error updating user' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ message: 'User updated successfully' });
    }
  });
});



app.put('/api/astrologers/:astrologerId', (req, res) => {
  const astrologerId = req.params.astrologerId;
  const updatedAstrologerData = req.body;

  const query = 'UPDATE astrologer SET ? WHERE id = ?';

  db.query(query, [updatedAstrologerData, astrologerId], (err, results) => {
    if (err) {
      console.error('Error updating astrologer:', err);
      res.status(500).json({ error: 'Error updating astrologer' });
    } else {
      res.json({ message: 'Astrologer updated successfully' });
    }
  });
});


app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const deleteUserQuery = 'DELETE FROM users WHERE id = ?';

  db.query(deleteUserQuery, [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Error deleting user' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ message: 'User deleted successfully' });
    }
  });
});

app.delete('/api/astrologers/:id', (req, res) => {
  const astrologerId = req.params.id;
  const deleteAstrologerQuery = 'DELETE FROM astrologer WHERE id = ?';

  db.query(deleteAstrologerQuery, [astrologerId], (err, result) => {
    if (err) {
      console.error('Error deleting astrologer:', err);
      res.status(500).json({ error: 'Error deleting astrologer' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Astrologer not found' });
    } else {
      res.json({ message: 'Astrologer deleted successfully' });
    }
  });
});

http.createServer(app).listen(port, () => {
  console.log(`server started at port ${port}`)
})
