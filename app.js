const express = require('express');
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
  server: 'sqlsrver',
  database: 'mydatabase',
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

app.get('/', async (req, res) => {
  try {
    // Fetch static content from Azure Storage
    const containerName = 'webfiles';
    const blobName = 'index.html';
    const containerClient = BlobServiceClient.fromConnectionString(storageConnectionString).getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    const contentBuffer = await blobClient.downloadToBuffer();
    const staticContent = contentBuffer.toString('utf-8');

    // Connect to Azure SQL Database
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM UserInfo');

    // Use static content and database result in your response
    res.send(`<html><body>${staticContent}<br>${JSON.stringify(result.recordset)}</body></html>`);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the database connection
    await sql.close();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
