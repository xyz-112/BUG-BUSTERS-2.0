import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Product from './pages/Product'
import Login from './pages/Login'
import './styles.css'


function App(){
return (
<BrowserRouter>
<div className="p-4">
<header className="mb-6">
<Link to="/">Store</Link> | <Link to="/login">Login</Link>
</header>
<Routes>
<Route path="/" element={<Home/>} />
<Route path="/product/:slug" element={<Product/>} />
<Route path="/login" element={<Login/>} />
</Routes>
</div>
</BrowserRouter>
)
}


createRoot(document.getElementById('root')).render(<App />)