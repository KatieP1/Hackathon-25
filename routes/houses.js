const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../config/database')

// GET all house
router.get("/", async (req, res) => {
    try {
        const houses = await query('SELECT * FROM house');
        res.json(houses);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// GET a single house by id
router.get("/:id", async (req, res) => {
    try {
        const house = await query('SELECT * FROM house WHERE id = ?',
            [req.param.id]
        );
        
        if(!house) {
            return res.status(404).json({error: 'House not found'});
        }
        res.json(house);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

//GET house member
router.get("/:id/members", async (req, res) => {
    try {
        const members = await query('SELECT * FROM people WHERE house_id = ?',
            [req.param.id]
        );
        
        if(!members) {
            return res.status(404).json({error: 'Members not found'});
        }
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

//GET house items
router.get("/:id/items", async (req, res) => {
    try {
        const items = await query('SELECT * FROM item WHERE house_id = ?',
            [req.param.id]
        );
        
        if(!items) {
            return res.status(404).json({error: 'Items not found'});
        }
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

//GET house purchase
router.get("/:id/purchases", async (req, res) => {
    try {
        const purchases = await query('SELECT * FROM purchase WHERE house_id = ?',
            [req.param.id]
        );
        
        if(!purchases) {
            return res.status(404).json({error: 'Purchases not found'});
        }
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// GET house meal
router.get("/:id/meals", async (req, res) => {
    try {
        const meals = await query('SELECT * FROM meal WHERE house_id = ?',
            [req.param.id]
        );
        
        if(!meals) {
            return res.status(404).json({error: 'Meals not found'});
        }
        res.json(meals);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// POST create new house
router.post('/', async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const result = await run(
        'INSERT INTO house (name) VALUES (?)',
        [name]
      );
      
      const newHouse = await queryOne(
        'SELECT * FROM house WHERE id = ?',
        [result.lastID]
      );
      
      res.status(201).json(newHouse);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});
  
// PUT update house
router.put('/:id', async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const result = await run(
        'UPDATE house SET name = ? WHERE id = ?',
        [name, req.params.id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'House not found' });
      }
      
      const updatedHouse = await queryOne(
        'SELECT * FROM house WHERE id = ?',
        [req.params.id]
      );
      
      res.json(updatedHouse);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});
  
// DELETE house
router.delete('/:id', async (req, res) => {
    try {
      const result = await run(
        'DELETE FROM house WHERE id = ?',
        [req.params.id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'House not found' });
      }
      
      res.json({ message: 'House deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

module.exports = router; 