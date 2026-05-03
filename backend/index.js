const express = require('express');
const dotenv = require('dotenv');

// Load env vars FIRST so all imports have access to them
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const apiRoutes = require('./routes/apiRoutes');
const keyRoutes = require('./routes/keyRoutes');
const gatewayRoutes = require('./routes/gatewayRoutes');

const usageRoutes = require('./routes/usageRoutes');
const billingRoutes = require('./routes/billingRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/apis', apiRoutes);
app.use('/api/v1/keys', keyRoutes);
app.use('/api/v1/gateway', gatewayRoutes);
app.use('/api/v1/usage', usageRoutes);
app.use('/api/v1/billing', billingRoutes);

app.get('/', (req, res) => {
  res.send('MeterFlow API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
