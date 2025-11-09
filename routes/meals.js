// routes/meals.js - Meal API routes
const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../config/database');

// GET all meals
router.get('/', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    let meals;
    if (house_id) {
      meals = await query(
        'SELECT * FROM meal WHERE house_id = ?',
        [house_id]
      );
    } else {
      meals = await query('SELECT * FROM meal');
    }
    
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single meal with details
router.get('/:id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const meal = await queryOne(
      'SELECT * FROM meal WHERE meal_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    // Get attendees
    const attendees = await query(
      `SELECT p.id, p.name, p.email
       FROM meal_attend ma
       JOIN people p ON ma.user_id = p.id AND ma.house_id = p.house_id
       WHERE ma.meal_id = ? AND ma.house_id = ?`,
      [req.params.id, house_id]
    );
    
    // Get ingredients
    const ingredients = await query(
      `SELECT mi.*, i.item_name
       FROM meal_ingredient mi
       JOIN item i ON mi.item_id = i.item_id AND mi.house_id = i.house_id
       WHERE mi.meal_id = ? AND mi.house_id = ?`,
      [req.params.id, house_id]
    );
    
    // Calculate total cost
    const totalCost = ingredients.reduce((sum, ing) => 
      sum + (ing.quant_used * ing.cost_per_ct), 0
    );
    
    // Calculate cost per person
    const costPerPerson = attendees.length > 0 ? totalCost / attendees.length : 0;
    
    res.json({
      ...meal,
      attendees: attendees,
      ingredients: ingredients,
      total_cost: totalCost,
      cost_per_person: costPerPerson
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET meal attendees
router.get('/:id/attendees', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const attendees = await query(
      `SELECT p.*
       FROM meal_attend ma
       JOIN people p ON ma.user_id = p.id AND ma.house_id = p.house_id
       WHERE ma.meal_id = ? AND ma.house_id = ?`,
      [req.params.id, house_id]
    );
    
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET meal ingredients
router.get('/:id/ingredients', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const ingredients = await query(
      `SELECT mi.*, i.item_name
       FROM meal_ingredient mi
       LEFT JOIN item i ON mi.item_id = i.item_id AND mi.house_id = i.house_id
       WHERE mi.meal_id = ? AND mi.house_id = ?`,
      [req.params.id, house_id]
    );
    
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new meal
router.post('/', async (req, res) => {
  try {
    const { house_id, meal_name, made_on } = req.body;
    
    if (!house_id || !meal_name) {
      return res.status(400).json({ 
        error: 'house_id and meal_name are required' 
      });
    }
    
    const date = made_on || new Date().toISOString().split('T')[0];
    
    const result = await run(
      'INSERT INTO meal (house_id, meal_name, made_on) VALUES (?, ?, ?)',
      [house_id, meal_name, date]
    );
    
    const newMeal = await queryOne(
      'SELECT * FROM meal WHERE meal_id = ? AND house_id = ?',
      [result.lastID, house_id]
    );
    
    res.status(201).json(newMeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add attendee to meal
router.post('/:id/attendees', async (req, res) => {
  try {
    const { house_id, user_id } = req.body;
    
    if (!house_id || !user_id) {
      return res.status(400).json({ 
        error: 'house_id and user_id are required' 
      });
    }
    
    // Check if already attending
    const existing = await queryOne(
      'SELECT * FROM meal_attend WHERE meal_id = ? AND house_id = ? AND user_id = ?',
      [req.params.id, house_id, user_id]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'User already attending this meal' });
    }
    
    await run(
      'INSERT INTO meal_attend (meal_id, house_id, user_id) VALUES (?, ?, ?)',
      [req.params.id, house_id, user_id]
    );
    
    const person = await queryOne(
      'SELECT * FROM people WHERE id = ? AND house_id = ?',
      [user_id, house_id]
    );
    
    res.status(201).json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add ingredient to meal
router.post('/:id/ingredients', async (req, res) => {
  try {
    const { house_id, item_id, quant_used, cost_per_ct } = req.body;
    
    if (!house_id || !item_id || !quant_used || !cost_per_ct) {
      return res.status(400).json({ 
        error: 'house_id, item_id, quant_used, and cost_per_ct are required' 
      });
    }
    
    await run(
      `INSERT INTO meal_ingredient (meal_id, house_id, item_id, quant_used, cost_per_ct) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, house_id, item_id, quant_used, cost_per_ct]
    );
    
    const ingredient = await queryOne(
      `SELECT mi.*, i.item_name
       FROM meal_ingredient mi
       LEFT JOIN item i ON mi.item_id = i.item_id AND mi.house_id = i.house_id
       WHERE mi.meal_id = ? AND mi.house_id = ? AND mi.item_id = ?`,
      [req.params.id, house_id, item_id]
    );
    
    res.status(201).json(ingredient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update meal
router.put('/:id', async (req, res) => {
  try {
    const { house_id, meal_name, made_on } = req.body;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id is required' });
    }
    
    const updates = [];
    const params = [];
    
    if (meal_name) {
      updates.push('meal_name = ?');
      params.push(meal_name);
    }
    if (made_on) {
      updates.push('made_on = ?');
      params.push(made_on);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(req.params.id, house_id);
    
    const result = await run(
      `UPDATE meal SET ${updates.join(', ')} WHERE meal_id = ? AND house_id = ?`,
      params
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    const updatedMeal = await queryOne(
      'SELECT * FROM meal WHERE meal_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    res.json(updatedMeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE attendee from meal
router.delete('/:id/attendees/:user_id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const result = await run(
      'DELETE FROM meal_attend WHERE meal_id = ? AND house_id = ? AND user_id = ?',
      [req.params.id, house_id, req.params.user_id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Attendee not found' });
    }
    
    res.json({ message: 'Attendee removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ingredient from meal
router.delete('/:id/ingredients/:item_id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    const result = await run(
      'DELETE FROM meal_ingredient WHERE meal_id = ? AND house_id = ? AND item_id = ?',
      [req.params.id, house_id, req.params.item_id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    res.json({ message: 'Ingredient removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE meal
router.delete('/:id', async (req, res) => {
  try {
    const { house_id } = req.query;
    
    if (!house_id) {
      return res.status(400).json({ error: 'house_id query parameter required' });
    }
    
    // Delete attendees
    await run(
      'DELETE FROM meal_attend WHERE meal_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    // Delete ingredients
    await run(
      'DELETE FROM meal_ingredient WHERE meal_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    // Delete meal
    const result = await run(
      'DELETE FROM meal WHERE meal_id = ? AND house_id = ?',
      [req.params.id, house_id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;