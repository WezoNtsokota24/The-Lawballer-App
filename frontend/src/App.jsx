import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([]) // New: Store the offers
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)

  // 1. Load Products on startup
  useEffect(() => {
    fetchProducts()
  }, [])

  // 2. Load Orders whenever the User logs in
  useEffect(() => {
    if (token) {
      fetchOrders()
    }
  }, [token])

  const fetchProducts = () => {
    fetch('http://127.0.0.1:8000/api/products/')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }

  const fetchOrders = () => {
    fetch('http://127.0.0.1:8000/api/orders/', {
      headers: { 'Authorization': token }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Login failed or no permission")
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data)
        } else {
          console.error("API didn't return a list:", data)
          setOrders([]) 
        }
      })
      .catch(err => console.error(err))
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const basicAuth = 'Basic ' + btoa(username + ':' + password)
    setToken(basicAuth)
    alert("Login details saved! Loading your offers...")
  }

  const handleNegotiate = (product) => {
    if (!token) {
      alert("Please login first!")
      return
    }
    const offerPrice = prompt(`Enter your offer for ${product.title}:`)
    if (!offerPrice) return

    fetch('http://127.0.0.1:8000/api/orders/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        product: product.id,
        agreed_price: offerPrice
      })
    })
    .then(async res => {
      if (res.ok) {
        alert("Offer sent! The Uncles will discuss it.")
        fetchOrders() // Refresh the list
      } else {
        const err = await res.json()
        alert("Error: " + JSON.stringify(err))
      }
    })
  }

  // --- NEW FEATURE: ACCEPT OFFER ---
  const handleAcceptOffer = (orderId) => {
    fetch(`http://127.0.0.1:8000/api/orders/${orderId}/accept/`, {
      method: 'POST',
      headers: { 'Authorization': token }
    })
    .then(async res => {
      if (res.ok) {
        alert("Offer Accepted! 🤝 Cattle marked as sold.")
        fetchOrders()   // Refresh offers
        fetchProducts() // Refresh products (Cow should disappear/update)
      } else {
        alert("Failed to accept.")
      }
    })
  }

  // Safety check: Only filter if orders is actually a list
  const myIncomingOffers = Array.isArray(orders) 
    ? orders.filter(order => order.seller === username && order.status === 'negotiation')
    : []
  return (
    <div className="container">
      <h1>🐄 The Low-baller Marketplace</h1>

      {/* LOGIN SECTION */}
      <div className="login-bar">
        {!token ? (
          <form onSubmit={handleLogin} style={{background: '#333', padding: '10px'}}>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{marginRight:'10px'}}/>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{marginRight:'10px'}}/>
            <button type="submit">Login</button>
          </form>
        ) : (
          <p style={{color: '#4caf50'}}>Logged in as <strong>{username}</strong></p>
        )}
      </div>

      {/* NEW: DASHBOARD SECTION */}
      {token && myIncomingOffers.length > 0 && (
        <div className="dashboard">
          <h2>🔔 Incoming Offers (The Uncles' Table)</h2>
          <div className="grid">
            {myIncomingOffers.map(order => (
              <div key={order.id} className="card offer-card">
                <h3>Offer for: {order.product_title}</h3>
                <p><strong>Buyer:</strong> {order.buyer}</p>
                <p className="price">Offer: R {order.agreed_price}</p>
                <button className="accept-btn" onClick={() => handleAcceptOffer(order.id)}>
                  ✅ Accept Offer
                </button>
              </div>
            ))}
          </div>
          <hr />
        </div>
      )}

      {/* MARKETPLACE SECTION */}
      <h2>Livestock For Sale</h2>
      {loading ? <p>Scouting...</p> : (
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
                  <div key={key} className="spec-tag"><strong>{key}:</strong> {value}</div>
                ))}
              </div>
              {/* Hide Negotiate button if I own the cow */}
              {cow.seller_name !== username && (
                <button className="buy-btn" onClick={() => handleNegotiate(cow)}>Negotiate</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App