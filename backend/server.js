const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mount auth routes (simple JWT example)
try {
    const authRouter = require('./routes/auth');
    app.use('/api/auth', authRouter);
} catch (err) {
    // If route file doesn't exist yet, ignore — it will be created by the setup script
}

// Mount demo API routes
try {
    const apiRouter = require('./routes/api');
    app.use('/api', apiRouter);
} catch (err) {
    // ignore if not present
}

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});