const axios = require('axios');

// Helper function to get future dates
const getFutureDate = (daysFromNow = 0, hoursFromNow = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(date.getHours() + hoursFromNow);
    return date.toISOString();
};

// Example odds data for development (replace with actual API integration)
const MOCK_ODDS_DATA = [
    {
        id: '1',
        sport: 'Football',
        league: 'English Premier League',
        match: 'Manchester City vs Arsenal',
        datetime: getFutureDate(2, 4), // 2 days and 4 hours from now
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
        datetime: getFutureDate(3, 6), // 3 days and 6 hours from now
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

// Add more realistic matches with dynamic dates
const ADDITIONAL_MATCHES = [
    {
        teams: ['Liverpool vs Chelsea', 'Tottenham vs Newcastle', 'Brighton vs Aston Villa'],
        league: 'English Premier League',
        bookmakers: ['Bet365', 'William Hill', 'Betfair', 'Unibet']
    },
    {
        teams: ['Atletico Madrid vs Sevilla', 'Valencia vs Athletic Bilbao'],
        league: 'La Liga',
        bookmakers: ['Bet365', 'William Hill', 'Betfair', 'Unibet']
    },
    {
        teams: ['Bayern Munich vs Dortmund', 'Leipzig vs Leverkusen'],
        league: 'Bundesliga',
        bookmakers: ['Bet365', 'William Hill', 'Betfair', 'Unibet']
    }
];

// Generate dynamic odds data
const generateDynamicOdds = () => {
    const dynamicData = [...MOCK_ODDS_DATA];
    let idCounter = dynamicData.length + 1;

    ADDITIONAL_MATCHES.forEach(({ teams, league, bookmakers }) => {
        teams.forEach(match => {
            const daysAhead = Math.floor(Math.random() * 7) + 1; // 1-7 days ahead
            const hoursAhead = Math.floor(Math.random() * 12); // 0-12 hours ahead
            
            const bookmaker1 = bookmakers[Math.floor(Math.random() * bookmakers.length)];
            let bookmaker2;
            do {
                bookmaker2 = bookmakers[Math.floor(Math.random() * bookmakers.length)];
            } while (bookmaker2 === bookmaker1);

            const baseOdds1 = 1.5 + Math.random() * 2; // Random odds between 1.5 and 3.5
            const baseOdds2 = 1.5 + Math.random() * 2;

            dynamicData.push({
                id: String(idCounter++),
                sport: 'Football',
                league,
                match,
                datetime: getFutureDate(daysAhead, hoursAhead),
                bookmakers: [
                    {
                        name: bookmaker1,
                        markets: [
                            {
                                name: 'Home Win',
                                odds: baseOdds1
                            }
                        ]
                    },
                    {
                        name: bookmaker2,
                        markets: [
                            {
                                name: 'Away Win',
                                odds: baseOdds2
                            }
                        ]
                    }
                ]
            });
        });
    });

    return dynamicData;
};

const fetchOdds = async () => {
    try {
        // TODO: Replace with actual API call when ready
        // const response = await axios.get('YOUR_ODDS_API_ENDPOINT');
        // return response.data;

        // Return dynamic mock data
        return generateDynamicOdds();
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
        const currentData = generateDynamicOdds();
        const updatedOdds = currentData.map(event => ({
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
