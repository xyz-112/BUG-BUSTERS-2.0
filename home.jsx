import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'


export default function Home(){
const [products, setProducts] = useState([]);
useEffect(()=>{
api.get('/products').then(r=> setProducts(r.data.products)).catch(console.error)
},[])
return (
<div>
<h1>Products</h1>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
{products.map(p=> (
<div key={p._id} style={{padding:12,border:'1px solid #ddd'}}>
<h3>{p.title}</h3>
<p>₹{p.price}</p>
<Link to={`/product/${p.slug}`}>View</Link>
</div>
))}
</div>
</div>
)
}