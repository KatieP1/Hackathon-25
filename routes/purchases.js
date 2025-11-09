// routes/purchases.js - Purchase API routes
const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../config/database');

// GET all purchases
router.get('/', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    let purchases;
    if (house_id) {
      purchases = await query(
        'SELECT * FROM purchase WHERE house_id = ?',
        [house_id]
      );
    } else {
      purchases = await query('SELECT * FROM purchase');
    }
    
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single purchase with details
router.get('/:id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const purchase = await queryOne(
      `SELECT p.*, pe.name as buyer_name 
       FROM purchase p
       JOIN people pe ON p.buyer_id = pe.id AND p.house_id = pe.house_id
       WHERE p.p_id = ? AND p.house_id = ?`,
      [req.params.id, house_id]
    );
    
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    // Get purchase lines
    const lines = await query(
      `SELECT pl.*, i.item_name
       FROM purchase_line pl
       JOIN item i ON pl.item_id = i.item_id AND pl.house_id = i.house_id
       WHERE pl.p_id = ? AND pl.house_id = ?`,
      [req.params.id, house_id]
    );
    
    // Calculate total
    const total = lines.reduce((sum, line) => 
      sum + (line.quantity * line.cost_per_ct), 0
    );
    
    res.json({
      ...purchase,
      lines: lines,
      total: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET purchase lines for a purchase
router.get('/:id/lines', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const lines = await query(
      `SELECT pl.*, i.item_name
       FROM purchase_line pl
       LEFT JOIN item i ON pl.item_id = i.item_id AND pl.house_id = i.house_id
       WHERE pl.p_id = ? AND pl.house_id = ?`,
      [req.params.id, house_id]
    );
    
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new purchase
router.post('/', async (req, res) => {
  try {
    const { house_id, buyer_id, purchase_at } = req.body;
    
    if (!house_id || !buyer_id) {
      return res.status(400).json({ 
        error: 'house_id and buyer_id are required' 
      });
    }
    
    const date = purchase_at || new Date().toISOString().split('T')[0];
    
    const result = await run(
      'INSERT INTO purchase (house_id, buyer_id, purchase_at) VALUES (?, ?, ?)',
      [house_id, buyer_id, date]
    );
    
    const newPurchase = await queryOne(
      'SELECT * FROM purchase WHERE p_id = ? AND house_id = ?',
      [result.lastID, house_id]
    );
    
    res.status(201).json(newPurchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add line to purchase
router.post('/:id/lines', async (req, res) => {
  try {
    const { house_id, item_id, quantity, cost_per_ct } = req.body;
    
    if (!house_id || !item_id || !quantity || !cost_per_ct) {
      return res.status(400).json({ 
        error: 'house_id, item_id, quantity, and cost_per_ct are required' 
      });
    }
    
    const result = await run(
      `INSERT INTO purchase_line (house_id, p_id, item_id, quantity, cost_per_ct) 
       VALUES (?, ?, ?, ?, ?)`,
      [house_id, req.params.id, item_id, quantity, cost_per_ct]
    );
    
    const newLine = await queryOne(
      `SELECT pl.*, i.item_name
       FROM purchase_line pl
       LEFT JOIN item i ON pl.item_id = i.item_id AND pl.house_id = i.house_id
       WHERE pl.pl_id = ? AND pl.p_id = ?`,
      [result.lastID, req.params.id]
    );
    
    res.status(201).json(newLine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update purchase
router.put('/:id', async (req, res) => {
  try {
    const { house_id, buyer_id, purchase_at } = req.body;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id is required' });
    }
    
    const updates = [];
    const params = [];
    
    if (buyer_id) {
      updates.push('buyer_id = ?');
      params.push(buyer_id);
    }
    if (purchase_at) {
      updates.push('purchase_at = ?');
      params.push(purchase_at);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(req.params.id, house_id);
    
    const result = await run(
      `UPDATE purchase SET ${updates.join(', ')} WHERE p_id = ? AND house_id = ?`,
      params
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    const updatedPurchase = await queryOne(
      'SELECT * FROM purchase WHERE p_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    res.json(updatedPurchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE purchase line
router.delete('/:id/lines/:line_id', async (req, res) => {
  try {
    const result = await run(
      'DELETE FROM purchase_line WHERE pl_id = ? AND p_id = ?',
      [req.params.line_id, req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Purchase line not found' });
    }
    
    res.json({ message: 'Purchase line deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE purchase
router.delete('/:id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    // Delete all purchase lines first
    await run(
      'DELETE FROM purchase_line WHERE p_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    // Delete purchase
    const result = await run(
      'DELETE FROM purchase WHERE p_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    res.json({ message: 'Purchase deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;