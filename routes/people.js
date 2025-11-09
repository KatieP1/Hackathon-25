// routes/people.js - People API routes
const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../config/database');

// GET all people
router.get('/', async (req, res) => {
  try {
    const people = await query('SELECT * FROM people');
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single person by ID
router.get('/:id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const person = await queryOne(
      'SELECT * FROM people WHERE id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET person's purchases
router.get('/:id/purchases', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const purchases = await query(
      'SELECT * FROM purchase WHERE buyer_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET person's meals attended
router.get('/:id/meals', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const meals = await query(
      `SELECT m.* FROM meal m
       JOIN meal_attend ma ON m.meal_id = ma.meal_id AND m.house_id = ma.house_id
       WHERE ma.user_id = ? AND ma.house_id = ?`,
      [req.params.id, house_id]
    );
    
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new person
router.post('/', async (req, res) => {
  try {
    const { name, email, house_id } = req.body;
    
    if (!name || !email || !house_id) {
      return res.status(400).json({ 
        error: 'name, email, and house_id are required' 
      });
    }
    
    // Check if email already exists
    const existing = await queryOne(
      'SELECT * FROM people WHERE email = ?',
      [email]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const result = await run(
      'INSERT INTO people (name, email, house_id) VALUES (?, ?, ?)',
      [name, email, house_id]
    );
    
    const newPerson = await queryOne(
      'SELECT * FROM people WHERE id = ? AND house_id = ?',
      [result.lastID, house_id]
    );
    
    res.status(201).json(newPerson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update person
router.put('/:id', async (req, res) => {
  try {
    const { name, email, house_id } = req.body;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id is required' });
    }
    
    // Check if email is being changed and if it already exists
    if (email) {
      const existing = await queryOne(
        'SELECT * FROM people WHERE email = ? AND (id != ? OR house_id != ?)',
        [email, req.params.id, house_id]
      );
      
      if (existing) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(req.params.id, house_id);
    
    const result = await run(
      `UPDATE people SET ${updates.join(', ')} WHERE id = ? AND house_id = ?`,
      params
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    const updatedPerson = await queryOne(
      'SELECT * FROM people WHERE id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    res.json(updatedPerson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE person
router.delete('/:id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const result = await run(
      'DELETE FROM people WHERE id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json({ message: 'Person deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;