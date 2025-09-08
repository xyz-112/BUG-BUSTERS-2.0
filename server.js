require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();


const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');


const PORT = process.env.PORT || 4000;


app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);


app.get('/', (req, res) => res.send('Online store backend running'));


mongoose.connect(process.env.MONGO_URI)
.then(()=>{
app.listen(PORT, ()=> console.log('Server running on', PORT));
})
.catch(err => console.error(err));