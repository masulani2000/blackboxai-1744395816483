const stringSimilarity = require('string-similarity');

const normalizeData = (rawData) => {
    try {
        return rawData.map(event => ({
            id: event.id,
            sport: normalizeString(event.sport),
            league: normalizeString(event.league),
            match: normalizeString(event.match),
            datetime: new Date(event.datetime).toISOString(),
            bookmakers: event.bookmakers.map(bookmaker => ({
                name: normalizeString(bookmaker.name),
                markets: bookmaker.markets.map(market => ({
                    name: normalizeMarketName(market.name),
                    odds: parseFloat(market.odds)
                }))
            }))
        }));
    } catch (error) {
        console.error('Error normalizing data:', error);
        throw new Error('Failed to normalize odds data');
    }
};

// Helper function to normalize strings
const normalizeString = (str) => {
    if (!str) return '';
    return str.trim().toLowerCase()
              .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
              .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

// Helper function to normalize market names
const normalizeMarketName = (marketName) => {
    if (!marketName) return '';
    
    // Standard market name formats
    const marketFormats = {
        '2way': '2-Way',
        '3way': '3-Way',
        'handicap': 'Handicap',
        'european': 'European',
        '1st': 'First',
        '2nd': 'Second',
        'home win': 'Home Win',
        'away win': 'Away Win',
        'draw': 'Draw'
    };

    let normalized = normalizeString(marketName);
    
    // Replace common variations with standard format
    Object.entries(marketFormats).forEach(([key, value]) => {
        const regex = new RegExp(key, 'gi');
        normalized = normalized.replace(regex, value);
    });

    return normalized;
};

// Function to match similar events across bookmakers
const findSimilarEvents = (events, threshold = 0.85) => {
    const matches = [];
    const used = new Set();

    events.forEach((event1, i) => {
        if (used.has(i)) return;

        const match = {
            mainEvent: event1,
            similarEvents: []
        };

        events.forEach((event2, j) => {
            if (i === j || used.has(j)) return;

            const similarity = stringSimilarity.compareTwoStrings(
                `${event1.match} ${event1.league}`,
                `${event2.match} ${event2.league}`
            );

            if (similarity >= threshold) {
                match.similarEvents.push(event2);
                used.add(j);
            }
        });

        matches.push(match);
        used.add(i);
    });

    return matches;
};

module.exports = {
    normalizeData,
    findSimilarEvents,
    normalizeString,
    normalizeMarketName
};
