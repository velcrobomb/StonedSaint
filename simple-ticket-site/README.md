# Simple ticket site (hand-edited events, fake checkout)

A lightweight site: a homepage listing events, a ticket "purchase" page that
doesn't charge any real money, and a tiny Node server that saves every order
to a CSV/JSON file you can open yourself. There's no admin panel — you add
events by editing one file directly.

## What's here

```
server.js            Tiny Express server: serves the site + saves orders
public/index.html     Homepage (event list)
public/purchase.html  Fake checkout page
public/events.js      <-- YOU EDIT THIS to add/change/remove events
public/styles.css     Styling
data/orders.json      Every order, as JSON (created automatically)
data/orders.csv       Every order, as CSV — opens fine in Excel/Sheets
```

## Adding, editing, or removing events

Open `public/events.js`. Everything is one array called `EVENTS` — each
event is a block like this:

```js
{
  id: "rooftop-sessions",       // unique, no spaces, used in the URL
  title: "Summer Rooftop Sessions",
  date: "2026-09-12",           // YYYY-MM-DD
  location: "The Loft, Downtown",
  description: "An evening of live music on the rooftop.",
  price: 25,                    // dollars, no $ sign
  imageUrl: ""                  // optional image link, or leave blank
}
```

To add an event: copy one of the blocks, paste it inside the `[ ]`, and
change the values. To remove one: delete its block. Save the file — that's
the whole workflow, no build step, no admin login. Both the homepage and the
purchase page read from this same list, so you only ever edit it in one
place.

## Running it

You need [Node.js](https://nodejs.org) installed (18+).

```bash
cd simple-ticket-site
npm install
npm start
```

Visit `http://localhost:3000`. Click into an event, fill out the form, and
submit — you'll get a confirmation screen, and the order will show up in
`data/orders.csv` and `data/orders.json`.

## Putting it on your server

Copy the whole `simple-ticket-site` folder to your server, then on the
server:

```bash
cd simple-ticket-site
npm install
npm start
```

If your host uses a process manager (like `pm2`) or expects you to set a
`PORT` environment variable, use that instead of running `npm start`
directly — check your hosting provider's Node.js docs for the exact
command, since this varies by host.

Once it's running, the site works exactly like it does locally, just at
your real domain instead of `localhost`.

## About the "fake" checkout

This does **not** process real payments — no credit card is charged, and no
payment processor is involved. It's meant to let you test the full flow
(buy → confirmation → order saved) before wiring up something like Stripe.

When you're ready to accept real payments, the natural next step is
swapping the purchase form's submit action for a real payment processor's
checkout (Stripe Checkout is the easiest to bolt on). Just ask and I can
build that version when you're ready — it's a bigger change since real
payments need a securely stored secret key and a webhook, which is why it's
kept separate from this simple version for now.

## Notes

- Orders are appended to `data/orders.csv` / `data/orders.json` — nothing
  is ever overwritten, so it's safe to leave running.
- There's no ticket inventory limit or "sold out" state in this version,
  since you said you didn't want an engine managing that — if you want a
  quantity cap per event later, that's a small addition.
- Email/name aren't validated beyond "not empty" — anyone can type
  anything. Fine for a demo; worth knowing if you show this to others.
