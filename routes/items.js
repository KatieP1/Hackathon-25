// routes/items.js - Item/Inventory API routes
const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../config/database');

// GET all items
router.get('/', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    let items;
    if (house_id) {
      items = await query(
        'SELECT * FROM item WHERE house_id = ?',
        [house_id]
      );
    } else {
      items = await query('SELECT * FROM item');
    }
    
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const item = await queryOne(
      'SELECT * FROM item WHERE item_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new item
router.post('/', async (req, res) => {
  try {
    const { item_name, count, house_id, cost_per_ct } = req.body;
    
    if (!item_name || count === undefined || !house_id || cost_per_ct === undefined) {
      return res.status(400).json({ 
        error: 'item_name, count, house_id, and cost_per_ct are required' 
      });
    }
    
    const result = await run(
      'INSERT INTO item (item_name, count, house_id, cost_per_ct) VALUES (?, ?, ?, ?)',
      [item_name, count, house_id, cost_per_ct]
    );
    
    const newItem = await queryOne(
      'SELECT * FROM item WHERE item_id = ? AND house_id = ?',
      [result.lastID, house_id]
    );
    
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update item
router.put('/:id', async (req, res) => {
  try {
    const { house_id, item_name, count, cost_per_ct } = req.body;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id is required' });
    }
    
    const updates = [];
    const params = [];
    
    if (item_name) {
      updates.push('item_name = ?');
      params.push(item_name);
    }
    if (count !== undefined) {
      updates.push('count = ?');
      params.push(count);
    }
    if (cost_per_ct !== undefined) {
      updates.push('cost_per_ct = ?');
      params.push(cost_per_ct);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(req.params.id, house_id);
    
    const result = await run(
      `UPDATE item SET ${updates.join(', ')} WHERE item_id = ? AND house_id = ?`,
      params
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const updatedItem = await queryOne(
      'SELECT * FROM item WHERE item_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update item count (increment/decrement)
router.patch('/:id/count', async (req, res) => {
  try {
    const { house_id, change } = req.body;
    
    if (!house_id || change === undefined) {
      return res.status(400).json({ 
        error: 'house_id and change are required' 
      });
    }
    
    const item = await queryOne(
      'SELECT * FROM item WHERE item_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const newCount = item.count + change;
    
    if (newCount < 0) {
      return res.status(400).json({ error: 'Count cannot be negative' });
    }
    
    await run(
      'UPDATE item SET count = ? WHERE item_id = ? AND house_id = ?',
      [newCount, req.params.id, house_id]
    );
    
    const updatedItem = await queryOne(
      'SELECT * FROM item WHERE item_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const result = await run(
      'DELETE FROM item WHERE item_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;