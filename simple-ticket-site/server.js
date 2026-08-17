// Minimal server for the ticket site.
// - Serves the static site in /public (index.html, purchase.html, etc.)
// - One API route: POST /api/purchase — saves the (fake) order to data/orders.csv
//   and data/orders.json so you have a simple record you can open yourself.
//
// There is NO real payment processing here — this simulates a purchase and
// records who "bought" what. See README.md if you later want to add real
// payments.

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const ORDERS_JSON = path.join(__dirname, 'data', 'orders.json');
const ORDERS_CSV = path.join(__dirname, 'data', 'orders.csv');

// Make sure the data files exist so first run doesn't error
if (!fs.existsSync(ORDERS_JSON)) fs.writeFileSync(ORDERS_JSON, '[]');
if (!fs.existsSync(ORDERS_CSV)) {
  fs.writeFileSync(ORDERS_CSV, 'orderId,eventId,eventTitle,name,email,quantity,total,purchasedAt\n');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function csvEscape(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

app.post('/api/purchase', (req, res) => {
  const { eventId, eventTitle, name, email, quantity, pricePerTicket } = req.body;

  if (!eventId || !name || !email || !quantity) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'Quantity must be a positive whole number.' });
  }

  const order = {
    orderId: crypto.randomUUID().slice(0, 8).toUpperCase(),
    eventId,
    eventTitle: eventTitle || '',
    name,
    email,
    quantity: qty,
    total: Number(pricePerTicket || 0) * qty,
    purchasedAt: new Date().toISOString(),
  };

  // Append to JSON
  const orders = JSON.parse(fs.readFileSync(ORDERS_JSON, 'utf8'));
  orders.push(order);
  fs.writeFileSync(ORDERS_JSON, JSON.stringify(orders, null, 2));

  // Append to CSV
  const row = [
    order.orderId, order.eventId, order.eventTitle, order.name,
    order.email, order.quantity, order.total.toFixed(2), order.purchasedAt,
  ].map(csvEscape).join(',');
  fs.appendFileSync(ORDERS_CSV, row + '\n');

  res.json({ ok: true, orderId: order.orderId });
});

app.listen(PORT, () => {
  console.log(`Ticket site running at http://localhost:${PORT}`);
});
