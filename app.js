const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Route to serve HTML content directly from here
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DevOps App</title>
    </head>
    <body>
        <h1>Welcome to the DevOps App</h1>
        <p>Hello, DevOps world!</p>
    </body>
    </html>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
