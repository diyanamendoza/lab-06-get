const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/artworks', async(req, res) => {
  try {
    const data = await client.query(`SELECT artworks.id AS piece_id, title, artist, century, img, category_id, categories.category 
    FROM artworks
    JOIN categories
    ON artworks.category_id = categories.id`);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async(req, res) => {
  try {
    const data = await client.query('SELECT * FROM categories');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/artworks/:id', async(req, res) => {
  try {
    const data = await client.query(`SELECT artworks.id AS piece_id, title, artist, century, img, category_id, categories.category 
    FROM artworks
    JOIN categories
    ON artworks.category_id = categories.id
    WHERE artworks.id=$1`, [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/artworks', async(req, res) => {
  try {
    const data = await client.query('INSERT INTO artworks (title, artist, img, century, category_id, owner_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.body.title, req.body.artist, req.body.img, req.body.century, req.body.category_id, 1]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/categories', async(req, res) => {
  try {
    const data = await client.query('INSERT INTO categories (category) VALUES ($1) RETURNING *', [req.body.category]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/artworks/:id', async(req, res) => {
  try {
    const data = await client.query('UPDATE artworks SET title = $1, artist = $2, img = $3, century = $4, category_id = $5 WHERE id = $6 RETURNING *', [req.body.title, req.body.artist, req.body.img, req.body.century, req.body.category_id, req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/artworks/:id', async(req, res) => {
  try {
    const data = await client.query('DELETE from artworks where id=$1 RETURNING *', [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
