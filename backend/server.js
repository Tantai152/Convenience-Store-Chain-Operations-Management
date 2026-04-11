const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001; 

// Middleware
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});