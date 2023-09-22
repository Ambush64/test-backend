const port = 8090
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const app = express()
const axios = require("axios")
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('726479389155-15oaapogtf6m287gsmmecbv2c34ledgf.apps.googleusercontent.com');
const mysql = require("mysql");



app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cors({ origin: '*' }))


// Host: sql12.freesqldatabase.com
// Database name: sql12648279
// Database user: sql12648279
// Database password: BigXSkcAWb
// Port number: 3306


// Create a MySQL database connection
const db = mysql.createConnection({
  host: "sql12.freesqldatabase.com",
  user: "sql12648279",
  password: "BigXSkcAWb",
  database: "sql12648279",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to the MySQL database");
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add this route to get a list of products for the dropdown
app.get("/products", (req, res) => {
  const sql = "SELECT ProductID, ProductName FROM Products";

  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});


// Create Operation (Add a New Product)
app.post("/products", (req, res) => {
  const { ProductName, Category, Price } = req.body;
  const product = { ProductName, Category, Price };
  const sql = "INSERT INTO Products SET ?";

  db.query(sql, product, (err, result) => {
    if (err) throw err;
    res.json({ message: "Product added successfully", productId: result.insertId });
  });
});

// Update the /products endpoint to retrieve product details
app.get("/products", (req, res) => {
  const sql = "SELECT ProductID, ProductName, Category, Price FROM Products";

  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});


// Read Operation (Retrieve Order Details)
app.get("/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;
  const sql = `
    SELECT 
      Orders.OrderID, 
      Orders.CustomerName, 
      Orders.OrderDate, 
      Products.ProductName, 
      Products.Price, 
      Orders.Quantity 
    FROM 
      Orders 
    JOIN 
      Products ON Orders.ProductID = Products.ProductID 
    WHERE 
      Orders.OrderID = ?`;

  db.query(sql, [orderId], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  });
});

// Update Operation (Update Product Information)
app.put("/products/:productId", (req, res) => {
  const productId = req.params.productId;
  const newPrice = req.body.Price;
  const sql = "UPDATE Products SET Price = ? WHERE ProductID = ?";

  db.query(sql, [newPrice, productId], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.json({ message: "Product updated successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });
});

// Delete Operation (Remove a Product)
app.delete("/products/:productId", (req, res) => {
  const productId = req.params.productId;
  const sql = "DELETE FROM Products WHERE ProductID = ?";

  db.query(sql, [productId], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });
});

// Join Operation (List Orders with Product Details)
app.get("/orders", (req, res) => {
  const sql = `
    SELECT 
      Orders.OrderID, 
      Orders.CustomerName, 
      Orders.OrderDate, 
      Products.ProductName, 
      Products.Price, 
      Orders.Quantity 
    FROM 
      Orders 
    JOIN 
      Products ON Orders.ProductID = Products.ProductID`;

  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Create Operation (Add a New Order)
app.post("/orders", (req, res) => {
  const { CustomerName, OrderDate, ProductID, Quantity } = req.body;
  const order = { CustomerName, OrderDate, ProductID, Quantity };
  const sql = "INSERT INTO Orders SET ?";

  db.query(sql, order, (err, result) => {
    if (err) throw err;
    res.json({ message: "Order added successfully", orderId: result.insertId });
  });
});


const redirectURL = 'http://localhost:3000';


const oAuth2Client = new OAuth2Client(
  "7147604982-oivo6i2pbn0scp1dcpeqbvt9fegf7ke6.apps.googleusercontent.com",
  "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",
  redirectURL
);


app.get('/verify', function (req, res, next) {
  // verify("eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MGFkMTE4YTk0MGFkYzlmMmY1Mzc2YjM1MjkyZmVkZThjMmQwZWUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiVmJqIEd1aXRhciBoZXJvIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pONG4zZk54ckxoSlU3czF0XzJ2WVZmT0J5bHR2TVVTTlNjLWdiZ1ZCYz1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9yZWFjdC1hdXRoLWZkOTA5IiwiYXVkIjoicmVhY3QtYXV0aC1mZDkwOSIsImF1dGhfdGltZSI6MTY5NDY3ODkzMSwidXNlcl9pZCI6IllIc2IyN2JJOW5manhMdDZFR2xnRTM3ZnF0MTMiLCJzdWIiOiJZSHNiMjdiSTluZmp4THQ2RUdsZ0UzN2ZxdDEzIiwiaWF0IjoxNjk0Njc4OTMxLCJleHAiOjE2OTQ2ODI1MzEsImVtYWlsIjoiZ3VpdGFyaGVyb3ZiakBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMTM2MjQ2MTkwMDE5Nzc3NjI4MCJdLCJlbWFpbCI6WyJndWl0YXJoZXJvdmJqQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.jScZRbsriySeG91ThJpb20lfVAT5M7ebPB5A_JyRSnXBZejcZyW2txZB7bMUrqwM3kbs9c7SjAaKs8IfxpsAXyoiz0aK-JFShvCjrUPoViowgM0KZ2J3X-fypQalS8I1_aWI7jStPuFUQNwwDm6CNtg7dS2ZmEun8J3xsvDxpnKeidofXzI4RGzFFZiwwQ2WWQJKMk7tl1J0m-S3T_oX2ORK_iDOfKszCosfgePZ6nHFytfK54G2eY2nR2PSV5YhLik0SE8l6cuNeWQyuMi6JoiaT0xE0rlPsFxiJLLg0K9SGLHRhpXXB-HfFvPPDptbckizpLBAZezJro8sE2QqVg")

  res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
  res.header("Access-Control-Allow-Credentials", 'true');
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  // Generate the url that will be used for the consent dialog.
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile  openid ',
    prompt: 'consent',
    include_granted_scopes: true

  });

  res.json({ url: authorizeUrl })

});

app.post('/getToken', async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
  res.header("Access-Control-Allow-Credentials", 'true');
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  getRefreshToken(req.body.url)

  let { tokens } = await oAuth2Client.getToken(req.body.url);
  oAuth2Client.setCredentials(tokens);

  // console.log(tokens)
  getNewAccessToken(tokens.refresh_token)

  res.json({ tokens })
});

const getRefreshToken = async (authorizationCode) => {
  console.log(authorizationCode)
  const url = `https://oauth2.googleapis.com/token?grant_type=authorization_code&code=${authorizationCode}&client_id=7147604982-oivo6i2pbn0scp1dcpeqbvt9fegf7ke6.apps.googleusercontent.com&client_secret=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&redirect_uri=http://localhost:3000`;

  let payloadForAccessToken = {
    grant_type: 'refresh_token',
    refresh_token: authorizationCode,
    client_id: "7147604982-oivo6i2pbn0scp1dcpeqbvt9fegf7ke6.apps.googleusercontent.com",
    client_secret: "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",
  };


  console.log(url)
  try {
    const response = await fetch(url, {
      method: 'POST',
    });

    const res = await response.json();
    console.log('token response: ', res);
  } catch (error) {
    console.error('err: ', error);
  }



  // try {
  //   const response = await axios.post(url);

  //   console.log('getRefreshToken', response.data);
  // } catch (error) {
  //   console.error('err:', error);
  // }

};


const getNewAccessToken = (body) => {
  // get new access token using refresh token
  let payloadForAccessToken = {
    grant_type: 'refresh_token',
    refresh_token: body,
    client_id: "7147604982-oivo6i2pbn0scp1dcpeqbvt9fegf7ke6.apps.googleusercontent.com",
    client_secret: "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",
  };

  fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloadForAccessToken),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((res) => {
      console.log('new token response: ', res);
    })
    .catch((err) => console.log('err: ', err));
};




http.createServer(app).listen(port, () => {
  console.log(`server started at port ${port}`)
})



// id
// 7147604982-oivo6i2pbn0scp1dcpeqbvt9fegf7ke6.apps.googleusercontent.com
// secret
// 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