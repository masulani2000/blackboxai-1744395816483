const calculateArbitrage = (normalizedData) => {
    try {
        const opportunities = [];
        
        // Process each event individually
        normalizedData.forEach(event => {
            const homeMarkets = [];
            const awayMarkets = [];
            
            // Collect all home and away markets
            event.bookmakers.forEach(bookmaker => {
                bookmaker.markets.forEach(market => {
                    if (market.name.toLowerCase() === 'home win') {
                        homeMarkets.push({ bookmaker: bookmaker.name, market });
                    } else if (market.name.toLowerCase() === 'away win') {
                        awayMarkets.push({ bookmaker: bookmaker.name, market });
                    }
                });
            });

            // Check all combinations of home and away markets
            homeMarkets.forEach(homeMarket => {
                awayMarkets.forEach(awayMarket => {
                    if (homeMarket.bookmaker !== awayMarket.bookmaker) {
                        const impliedProbability = (1 / homeMarket.market.odds) + (1 / awayMarket.market.odds);
                        
                        if (impliedProbability < 1) { // Arbitrage opportunity exists
                            const profit = ((1 - impliedProbability) * 100).toFixed(2);
                            const stakes = calculateOptimalStakes([homeMarket, awayMarket]);
                            
                            opportunities.push({
                                id: generateOpportunityId(event, homeMarket, awayMarket),
                                match: event.match,
                                league: event.league,
                                datetime: event.datetime,
                                profit: parseFloat(profit),
                                totalStake: 100, // Normalized to 100 units
                                bets: [
                                    {
                                        bookmaker: homeMarket.bookmaker,
                                        market: homeMarket.market.name,
                                        odds: homeMarket.market.odds,
                                        stake: parseFloat(stakes[0].toFixed(2))
                                    },
                                    {
                                        bookmaker: awayMarket.bookmaker,
                                        market: awayMarket.market.name,
                                        odds: awayMarket.market.odds,
                                        stake: parseFloat(stakes[1].toFixed(2))
                                    }
                                ]
                            });
                        }
                    }
                });
            });
        });

        console.log('Calculated opportunities:', JSON.stringify(opportunities, null, 2));
        return opportunities;
    } catch (error) {
        console.error('Error calculating arbitrage:', error);
        throw new Error('Failed to calculate arbitrage opportunities');
    }
};

const calculateOptimalStakes = (markets) => {
    const totalStake = 100; // Normalize to 100 units
    const impliedProbabilities = markets.map(market => 1 / market.market.odds);
    const sum = impliedProbabilities.reduce((a, b) => a + b, 0);
    
    return impliedProbabilities.map(prob => (prob / sum) * totalStake);
};

const generateOpportunityId = (event, homeMarket, awayMarket) => {
    // Create a stable ID based on the event and bookmakers
    const eventPart = event.id;
    const marketPart = `${homeMarket.bookmaker}-${awayMarket.bookmaker}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    return `${eventPart}-${marketPart}`;
};

module.exports = {
    calculateArbitrage
};
