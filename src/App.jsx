import { useState } from 'react';
import jsPDF from 'jspdf';

const restaurants = [
  {
    id: 1,
    name: 'Mama Africa Kitchen',
    logo: '/logos/africa.jpg',
    color: '#808080',
    description: 'Traditional African meals with a modern twist.',
    menu: [
      { id: 1, item: 'Pap & Beef Stew', price: 35.0, img: '/menu/africa1.jpg' },
      { id: 2, item: 'Grilled Chicken', price: 25.0, img: '/menu/africa2.jpg' },
      { id: 3, item: 'Vegetable Curry', price: 22.0, img: '/menu/africa3.jpg' }
    ]
  },
  {
    id: 2,
    name: 'Urban Pizza',
    logo: '/logos/urbanpizza.jpg',
    color: '#FF6600',
    description: 'Fast, fresh and cheesy pizzas.',
    menu: [
      { id: 4, item: 'Margherita Pizza', price: 35.0, img: '/menu/pizza1.jpg' },
      { id: 5, item: 'Pepperoni Pizza', price: 50.0, img: '/menu/pizza2.jpg' },
      { id: 6, item: 'Veggie Lovers Pizza', price: 27.0, img: '/menu/pizza3.jpg' }
    ]
  },
  {
    id: 3,
    name: 'KFC',
    logo: '/logos/kfc.png',
    color: '#E41B17',
    description: 'Finger-lickin’ good fried chicken.',
    menu: [
      { id: 7, item: 'Original Recipe Chicken (2 pcs)', price: 51.9, img: '/menu/kfc1.png' },
      { id: 8, item: 'Zinger Burger', price: 40.9, img: '/menu/kfc2.png' },
      { id: 9, item: 'Mashed Potatoes & Gravy', price: 42.9, img: '/menu/kfc3.png' }
    ]
  },
  {
    id: 4,
    name: 'Steers',
    logo: '/logos/steers.jpg',
    color: '#A020F0',
    description: 'Flame-grilled burgers and sides.',
    menu: [
      { id: 10, item: 'Flame-Grilled Burger', price: 54.9, img: '/menu/steers1.png' },
      { id: 11, item: 'Steers Fries', price: 59.7, img: '/menu/steers2.png' },
      { id: 12, item: 'Chicken Wings (6 pcs)', price: 79.9, img: '/menu/steers3.png' }
    ]
  },
  {
    id: 5,
    name: "Domino's Pizza",
    logo: '/logos/dominos.png',
    color: '#0066CC',
    description: 'Delicious pizzas delivered fast.',
    menu: [
      { id: 13, item: 'Hawaiian Pizza', price: 8, img: '/menu/domino1.jpg' },
      { id: 14, item: 'Meat Lovers Pizza', price: 9, img: '/menu/domino2.jpg' },
      { id: 15, item: 'Cheesy Garlic Bread', price: 4, img: '/menu/domino3.jpg' }
    ]
  },
  {
    id: 6,
    name: 'Jays',
    logo: '/logos/jays.jpg',
    color: '#000000',
    description: 'Fresh and tasty local favorites.',
    menu: [
      { id: 16, item: 'Jays Burger', price: 30.0, img: '/menu/jays1.jpg' },
      { id: 17, item: 'Fries & Sauce', price: 15.0, img: '/menu/jays2.jpg' },
      { id: 18, item: 'Chicken Wrap', price: 25.0, img: '/menu/jays3.jpg' }
    ]
  }
];

function App() {
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [rawPhone, setRawPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(p => p.id === id ? { ...p, qty: p.qty + delta } : p).filter(p => p.qty > 0)
    );
  };

  const removeItem = (id) => setCart(prev => prev.filter(p => p.id !== id));

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);

  const reset = () => {
    setRestaurant(null);
    setCart([]);
    setShowCart(false);
    setShowModal(false);
    setPaymentMethod('');
    setRawPhone('');
    setCardNumber('');
    setCardName('');
    setPhoneError('');
  };

  const downloadReceipt = async () => {
    const doc = new jsPDF();

    const loadImageAsBase64 = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
      });
    };

    let logoBase64 = '';
    if (restaurant?.logo) {
      try {
        logoBase64 = await loadImageAsBase64(restaurant.logo);
      } catch (err) {
        console.error('Failed to load logo:', err);
      }
    }

    doc.setFontSize(16);
    doc.text("LocalBites Lite Receipt", 10, 20);

    if (logoBase64) {
      const imgProps = doc.getImageProperties(logoBase64);
      const imgWidth = 30;
      const imgHeight = (imgProps.height / imgProps.width) * imgWidth;
      doc.addImage(logoBase64, 'PNG', 170, 10, imgWidth, imgHeight);
    }

    doc.setFontSize(12);
    doc.text(`Restaurant: ${restaurant?.name}`, 10, 30);
    doc.text(`Payment: ${paymentMethod}`, 10, 40);

    if (paymentMethod === 'Card' && cardNumber) doc.text(`Card: ${cardNumber}`, 10, 50);
    if (paymentMethod === 'Card' && cardName) doc.text(`Card Name: ${cardName}`, 10, 60);
    if ((paymentMethod === 'M-Pesa' || paymentMethod === 'EcoCash') && rawPhone)
      doc.text(`Phone: +266 ${rawPhone.slice(0,4)} ${rawPhone.slice(4)}`, 10, 50);

    let startY = 70;
    doc.setFont(undefined, 'bold');
    doc.text("Item", 10, startY);
    doc.text("Qty", 110, startY);
    doc.text("Price (M)", 140, startY);
    doc.setFont(undefined, 'normal');
    startY += 5;
    doc.line(10, startY, 190, startY);
    startY += 5;

    cart.forEach(i => {
      doc.text(i.item, 10, startY);
      doc.text(String(i.qty), 110, startY);
      doc.text((i.price * i.qty).toFixed(2), 140, startY);
      startY += 10;
    });

    doc.setFont(undefined, 'bold');
    doc.text(`Total: M${total.toFixed(2)}`, 10, startY + 5);
    doc.setFontSize(10);
    doc.text("Thank you for your order!", 10, startY + 20);
    doc.save('receipt.pdf');
  };

  const needsPhone = paymentMethod === 'M-Pesa' || paymentMethod === 'EcoCash';

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
    setRawPhone('');
    setCardNumber('');
    setCardName('');
    setPhoneError('');
  };

  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.startsWith('266')) digits = digits.slice(3);
    digits = digits.slice(0, 8);
    setRawPhone(digits);

    if (digits.length && ((paymentMethod === 'M-Pesa' && digits[0] !== '5') || (paymentMethod === 'EcoCash' && digits[0] !== '6'))) {
      setPhoneError(`Please insert valid ${paymentMethod} number`);
    } else {
      setPhoneError('');
    }
  };

  const formatPhoneDisplay = (digits) => {
    if (!digits) return '+266 ';
    if (digits.length <= 4) return `+266 ${digits}`;
    return `+266 ${digits.slice(0,4)} ${digits.slice(4)}`;
  };

  const handleCardChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  return (
    <div className="container">
      <h1>LocalBites Lite</h1>

      {!restaurant && (
        <div className="list">
          {restaurants.map(r => (
            <div key={r.id} className="card" onClick={() => setRestaurant(r)} style={{ borderColor: r.color }}>
              <img src={r.logo} alt={`${r.name} logo`} />
              <h2>{r.name}</h2>
              <p>{r.description}</p>
              <p className="menu-preview">{r.menu.slice(0, 3).map(m => m.item).join(', ')}</p>
            </div>
          ))}
        </div>
      )}

      {restaurant && (
        <>
          <button onClick={reset} style={{ marginBottom: '10px' }}>← Back</button>
          <h2 style={{ color: restaurant.color }}>{restaurant.name}</h2>

          <div className="menu">
            {restaurant.menu.map(m => (
              <div key={m.id} className="menu-item" onClick={() => addToCart(m)} style={{ border: `2px solid ${restaurant.color}` }}>
                {m.img && <img src={m.img} alt={m.item} />}
                <span>{m.item}</span>
                <strong>M{m.price.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </>
      )}

      {restaurant && (
        <button className="cart-toggle" style={{ background: restaurant.color }} onClick={() => setShowCart(prev => !prev)}>
          🛒 {totalQty}
        </button>
      )}

      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-panel" onClick={e => e.stopPropagation()}>
            <h3>Your Cart</h3>
            {cart.map(i => (
              <div key={i.id} className="cart-item">
                <img src={i.img} alt={i.item} className="cart-img" />
                <span>{i.item}</span>
                <div className="qty-controls">
                  <button onClick={() => updateQty(i.id, -1)}>-</button>
                  <span>{i.qty}</span>
                  <button onClick={() => updateQty(i.id, 1)}>+</button>
                </div>
                <strong>M{(i.price * i.qty).toFixed(2)}</strong>
                <button className="remove" onClick={() => removeItem(i.id)}>✕</button>
              </div>
            ))}
            <h2>Total: M{total.toFixed(2)}</h2>
            <button className="order" disabled={!cart.length} onClick={() => { setShowModal(true); setShowCart(false); }}>
              Checkout
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2>Payment Method</h2>

            <label>
              <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={e => handlePaymentChange(e.target.value)} /> Card
            </label>
            <label>
              <input type="radio" name="payment" value="M-Pesa" checked={paymentMethod === 'M-Pesa'} onChange={e => handlePaymentChange(e.target.value)} /> M-Pesa
            </label>
            <label>
              <input type="radio" name="payment" value="EcoCash" checked={paymentMethod === 'EcoCash'} onChange={e => handlePaymentChange(e.target.value)} /> EcoCash
            </label>

            {paymentMethod === 'Card' && (
              <>
                <div style={{
                  margin: '10px 0',
                  padding: '16px',
                  background: '#333',
                  color: '#fff',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  minHeight: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'uppercase' }}>
                    {cardName || 'CARD NAME'}
                  </div>
                  <div style={{ fontSize: '16px', letterSpacing: '2px' }}>
                    {cardNumber || 'XXXX XXXX XXXX XXXX'}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Card Name"
                  value={cardName}
                  onChange={e => {
                    const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setCardName(lettersOnly.toUpperCase());
                  }}
                  style={{ margin: '10px 0', padding: '8px', width: '100%' }}
                />

                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={handleCardChange}
                  maxLength={19}
                  style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
                />
              </>
            )}

            {needsPhone && (
              <>
                <input
                  type="text"
                  name="phone"
                  autoComplete="off"
                  placeholder="+266 XXXX XXXX"
                  value={formatPhoneDisplay(rawPhone)}
                  onChange={handlePhoneChange}
                  maxLength={14}
                  style={{ marginBottom: '4px' }}
                />
                {phoneError && <div style={{ color: 'red', fontSize: '12px', marginBottom: '5px' }}>{phoneError}</div>}
              </>
            )}

            <h3>Total: M{total.toFixed(2)}</h3>

            <button
              className="order"
              disabled={
                !paymentMethod ||
                (needsPhone && (rawPhone.length !== 8 || phoneError)) ||
                (paymentMethod === 'Card' && (cardNumber.replace(/\D/g, '').length < 16 || !cardName))
              }
              onClick={() => { downloadReceipt(); alert('✅ Order placed successfully!'); reset(); }}
            >
              Confirm Order
            </button>

            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
