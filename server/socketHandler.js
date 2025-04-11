const { fetchOdds, setupOddsWebSocket } = require('./utils/oddsFetcher');
const { normalizeData } = require('./utils/dataNormalizer');
const { calculateArbitrage } = require('./utils/arbitrageCalculator');

const setupWebSocket = (io) => {
    io.on('connection', async (socket) => {
        console.log('Client connected');

        try {
            // Send initial data
            console.log('Fetching initial odds data...');
            const rawData = await fetchOdds();
            console.log('Raw data:', JSON.stringify(rawData, null, 2));

            console.log('Normalizing data...');
            const normalizedData = normalizeData(rawData);
            console.log('Normalized data:', JSON.stringify(normalizedData, null, 2));

            console.log('Calculating arbitrage opportunities...');
            const opportunities = calculateArbitrage(normalizedData);
            console.log('Found opportunities:', JSON.stringify(opportunities, null, 2));

            socket.emit('initialData', opportunities);

            // Set up real-time updates
            setupOddsWebSocket((updatedOdds) => {
                console.log('Received updated odds...');
                const normalizedData = normalizeData(updatedOdds);
                const opportunities = calculateArbitrage(normalizedData);
                console.log('Found new opportunities:', JSON.stringify(opportunities, null, 2));
                io.emit('opportunities', opportunities); // Changed from 'newOpportunity' to 'opportunities'
            });

            // Handle client disconnection
            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });

            // Handle errors
            socket.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

        } catch (error) {
            console.error('Error in WebSocket setup:', error);
            socket.emit('error', { message: 'Failed to fetch initial data' });
        }
    });
};

module.exports = {
    setupWebSocket
};
