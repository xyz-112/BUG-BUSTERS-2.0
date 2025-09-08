const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;


function signAccess(user){
return jwt.sign({ id: user._id, role: user.role }, ACCESS_SECRET, { expiresIn: '15m' });
}
function signRefresh(user){
return jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '7d' });
}


router.post('/register', async (req, res)=>{
const { name, email, password } = req.body;
if(!email || !password) return res.status(400).json({error:'missing'});
const existing = await User.findOne({ email });
if(existing) return res.status(400).json({ error: 'email exists' });
const hash = await bcrypt.hash(password, 10);
const user = await User.create({ name, email, passwordHash: hash });
const access = signAccess(user);
const refresh = signRefresh(user);
res.cookie('refreshToken', refresh, { httpOnly:true, sameSite:'lax', maxAge:7*24*3600*1000 });
res.json({ user: { id: user._id, email: user.email, name: user.name }, accessToken: access });
});


router.post('/login', async (req, res)=>{
const { email, password } = req.body;
const user = await User.findOne({ email });
if(!user) return res.status(400).json({ error: 'invalid' });
const ok = await bcrypt.compare(password, user.passwordHash);
if(!ok) return res.status(400).json({ error: 'invalid' });
const access = signAccess(user);
const refresh = signRefresh(user);
res.cookie('refreshToken', refresh, { httpOnly:true, sameSite:'lax', maxAge:7*24*3600*1000 });
res.json({ user: { id: user._id, email: user.email, name: user.name }, accessToken: access });
});


router.post('/refresh', (req, res)=>{
const token = req.cookies.refreshToken;
if(!token) return res.status(401).end();
try{
const payload = jwt.verify(token, REFRESH_SECRET);
const access = jwt.sign({ id: payload.id }, ACCESS_SECRET, { expiresIn: '15m' });
res.json({ accessToken: access });
}catch(e){
return res.status(401).end();
}
});


router.post('/logout', (req,res)=>{
res.clearCookie('refreshToken');
res.json({ ok: true });
});


module.exports = router;