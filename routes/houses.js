const express = require('express');
const router = express.Router();

const { query } = require('../config/database')
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

// Add a new house
// router.post("/", async (req, res) => {

// });

module.exports = router; 