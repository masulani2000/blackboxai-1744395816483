const express = require('express');
const router = express.Router();
const { fetchOdds } = require('../utils/oddsFetcher');
const { normalizeData } = require('../utils/dataNormalizer');
const { calculateArbitrage } = require('../utils/arbitrageCalculator');

// GET /api/arbitrage
router.get('/', async (req, res) => {
    try {
        // Get filter parameters
        const { league, bookmaker, minProfit } = req.query;

        // Fetch odds data
        const rawData = await fetchOdds();

        // Normalize the data
        const normalizedData = normalizeData(rawData);

        // Calculate arbitrage opportunities
        const opportunities = calculateArbitrage(normalizedData);

        // Apply filters if provided
        let filteredOpportunities = opportunities;
        if (league) {
            filteredOpportunities = filteredOpportunities.filter(opp => opp.league === league);
        }
        if (bookmaker) {
            filteredOpportunities = filteredOpportunities.filter(opp => 
                opp.bets.some(bet => bet.bookmaker === bookmaker)
            );
        }
        if (minProfit) {
            filteredOpportunities = filteredOpportunities.filter(opp => 
                opp.profit >= parseFloat(minProfit)
            );
        }

        res.json(filteredOpportunities);
    } catch (error) {
        console.error('Error in arbitrage route:', error);
        res.status(500).json({ error: 'Failed to fetch arbitrage opportunities' });
    }
});

// GET /api/arbitrage/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching opportunity with ID:', id);
        
        const rawData = await fetchOdds();
        console.log('Raw data fetched');
        
        const normalizedData = normalizeData(rawData);
        console.log('Data normalized');
        
        const opportunities = calculateArbitrage(normalizedData);
        console.log('Opportunities calculated:', opportunities.map(o => o.id));
        
        const opportunity = opportunities.find(opp => opp.id === id);
        console.log('Found opportunity:', opportunity ? 'yes' : 'no');
        
        if (!opportunity) {
            console.log('No opportunity found with ID:', id);
            return res.status(404).json({ 
                error: 'Opportunity not found',
                requestedId: id,
                availableIds: opportunities.map(o => o.id)
            });
        }
        
        res.json(opportunity);
    } catch (error) {
        console.error('Error fetching specific opportunity:', error);
        res.status(500).json({ error: 'Failed to fetch opportunity details' });
    }
});

module.exports = router;
