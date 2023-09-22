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

app.get('/', (req, res) => {
    res.send("GET Request Called");
    res.json("hello");
})


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



http.createServer(app).listen(port, () => {
  console.log(`server started at port ${port}`)
})

