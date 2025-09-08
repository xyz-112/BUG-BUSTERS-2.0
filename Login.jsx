import React, { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'


export default function Login(){
const [email,setEmail]=useState('');
const [password,setPassword]=useState('');
const nav = useNavigate();
const submit = async (e)=>{
e.preventDefault();
try{
const res = await api.post('/auth/login',{ email, password });
// accessToken returned; in prod store in memory/react state
localStorage.setItem('accessToken', res.data.accessToken);
nav('/');
}catch(e){
alert('login failed')
}
}
return (
<form onSubmit={submit} style={{maxWidth:400}}>
<h2>Login</h2>
<label>Email<input value={email} onChange={e=>setEmail(e.target.value)} /></label>
<label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
<button type="submit">Login</button>
</form>
)
}