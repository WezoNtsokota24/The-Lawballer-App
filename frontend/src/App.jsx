import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/products/')
      .then(response => response.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(error => console.error('Error fetching cows:', error))
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    // This creates a "Basic Auth" token to prove who you are
    const basicAuth = 'Basic ' + btoa(username + ':' + password)
    setToken(basicAuth)
    alert("Login details saved! You can now negotiate.")
  }

  const handleNegotiate = (product) => {
    if (!token) {
      alert("Please enter your username and password at the top first!")
      return
    }

    // 1. Ask the user for their offer price
    const offerPrice = prompt(`Enter your offer for the ${product.title} (in Rands):`)
    if (!offerPrice) return // Stop if they cancelled

    // 2. Send the data to Django
    fetch('http://127.0.0.1:8000/api/orders/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token // <--- This is the key!
      },
      body: JSON.stringify({
        product: product.id,
        agreed_price: offerPrice
      })
    })
    .then(async response => {
      const data = await response.json()
      if (response.ok) {
        alert("Offer sent successfully! The Uncles will discuss it.")
      } else {
        // Show the specific error from Django (e.g. "You cannot buy your own livestock")
        alert("Error: " + JSON.stringify(data))
      }
    })
    .catch(error => {
      console.error('Error:', error)
      alert("Something went wrong.")
    })
  }

  return (
    <div className="container">
      <h1>🐄 The Low-baller Marketplace</h1>
      
      {/* THE NEW LOGIN SECTION */}
      <div className="login-bar">
        {!token ? (
          <form onSubmit={handleLogin} style={{marginBottom: '20px', padding: '10px', background: '#333'}}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              style={{marginRight: '10px', padding: '5px'}}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{marginRight: '10px', padding: '5px'}}
            />
            <button type="submit">Set Login</button>
          </form>
        ) : (
          <p style={{color: '#4caf50'}}>Logged in as {username} ✅</p>
        )}
      </div>

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

              <button 
                className="buy-btn" 
                onClick={() => handleNegotiate(cow)}
              >
                Negotiate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App