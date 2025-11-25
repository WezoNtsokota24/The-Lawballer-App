import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/products/')
      .then(response => response.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(error => console.error('Error fetching cows:', error))
  }, [])

  return (
    <div className="container">
      <h1>🐄 The Low-baller Marketplace</h1>
      <p>Digital Lobola & Livestock Trading</p>

      {loading ? (
        <p>Scouting for livestock...</p>
      ) : (
        <div className="grid">
          {products.map(cow => (
            <div key={cow.id} className="card">
              <div className="card-header">
                <h2>{cow.title}</h2>
                <span className="price">R {cow.price}</span>
              </div>
              <p className="seller">Farmer: {cow.seller_name}</p>
              
              <div className="specs">
                {Object.entries(cow.specifications).map(([key, value]) => (
                  <div key={key} className="spec-tag">
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>

              <button className="buy-btn">Negotiate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App