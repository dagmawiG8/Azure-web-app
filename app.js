const express = require('express');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');
const sql = require('mssql');

const app = express();
const port = process.env.PORT || 3000;

// Azure Storage connection string
const storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=webappstoragedgw;AccountKey=2zSRYDl34+hQeVQJrCtWf3LTyn5lip6wZIghHsd+3tB64USCYSwpWbOMUjHdk7hv6iDInbAaU53L+AStV+jMqQ==;EndpointSuffix=core.windows.net';

// Azure SQL Database connection configuration
const dbConfig = {
  user: 'azureuser',
  password: 'Pa$$w0rd1234',
  server: 'sqlsrver.database.windows.net',
  database: 'mydatabase',
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

app.get('/', async (req, res) => {
  try {
    console.log('does azure storage work? starting...');
    // Fetch static content from Azure Storage
    const containerName = 'webfiles';
    const blobName = 'index.html';
    const containerClient = BlobServiceClient.fromConnectionString(storageConnectionString).getContainerClient(containerName);
    console.log('does azure storage work?...1');
    const blobClient = containerClient.getBlobClient(blobName);
    console.log('does azure storage work?...2');
    const contentBuffer = await blobClient.downloadToBuffer();
    console.log('does azure storage work?...3');
    const staticContent = contentBuffer.toString('utf-8');
    console.log('does azure storage work?...4');

    // Connect to Azure SQL Database
    const pool = await sql.connect(dbConfig);
    console.log('does azure sql work 1');
    const result = await pool.request().query('SELECT * FROM UserInfo');
    console.log('does azure sql work 2');

    // Use static content and database result in your response
    res.send(`<html><body>${staticContent}<br>${JSON.stringify(result.recordset)}</body></html>`);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send(`Internal Server Error: ${err}`);
  } finally {
    // Close the database connection
    await sql.close();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
