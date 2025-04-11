const axios = require('axios');

// Example odds data for development (replace with actual API integration)
const MOCK_ODDS_DATA = [
    {
        id: '1',
        sport: 'Football',
        league: 'English Premier League',
        match: 'Manchester City vs Arsenal',
        datetime: '2024-03-07T16:00:00Z',
        bookmakers: [
            {
                name: 'Bet365',
                markets: [
                    {
                        name: 'Home Win',
                        odds: 1.95
                    }
                ]
            },
            {
                name: 'William Hill',
                markets: [
                    {
                        name: 'Away Win',
                        odds: 4.2
                    }
                ]
            }
        ]
    },
    {
        id: '2',
        sport: 'Football',
        league: 'La Liga',
        match: 'Real Madrid vs Barcelona',
        datetime: '2024-03-08T20:00:00Z',
        bookmakers: [
            {
                name: 'Betfair',
                markets: [
                    {
                        name: 'Home Win',
                        odds: 2.1
                    }
                ]
            },
            {
                name: 'Unibet',
                markets: [
                    {
                        name: 'Away Win',
                        odds: 3.8
                    }
                ]
            }
        ]
    }
];

const fetchOdds = async () => {
    try {
        // TODO: Replace with actual API call when ready
        // const response = await axios.get('YOUR_ODDS_API_ENDPOINT');
        // return response.data;

        // For now, return mock data
        return MOCK_ODDS_DATA;
    } catch (error) {
        console.error('Error fetching odds:', error);
        throw new Error('Failed to fetch odds data');
    }
};

// WebSocket connection for real-time odds updates
const setupOddsWebSocket = (callback) => {
    // TODO: Implement WebSocket connection to odds provider
    // This is where you'd set up a WebSocket connection to receive real-time odds updates
    
    // For development, simulate real-time updates every 30 seconds
    setInterval(() => {
        // Simulate odds changes
        const updatedOdds = MOCK_ODDS_DATA.map(event => ({
            ...event,
            bookmakers: event.bookmakers.map(bookmaker => ({
                ...bookmaker,
                markets: bookmaker.markets.map(market => ({
                    ...market,
                    odds: market.odds * (0.95 + Math.random() * 0.1) // Random fluctuation
                }))
            }))
        }));
        
        callback(updatedOdds);
    }, 30000);
};

module.exports = {
    fetchOdds,
    setupOddsWebSocket
};
