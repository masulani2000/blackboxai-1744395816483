// Connect to WebSocket server
const socket = io({
    transports: ['websocket'],
    upgrade: false,
    withCredentials: true
});

// DOM Elements
const opportunitiesGrid = document.getElementById('opportunitiesGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const connectionStatus = document.getElementById('connectionStatus');
const leagueFilter = document.getElementById('leagueFilter');
const bookmakerFilter = document.getElementById('bookmakerFilter');
const minProfitFilter = document.getElementById('minProfitFilter');
const activeOpps = document.getElementById('activeOpps');
const avgProfit = document.getElementById('avgProfit');
const highestProfit = document.getElementById('highestProfit');

// State
let opportunities = [];
let filters = {
    league: '',
    bookmaker: '',
    minProfit: 0
};

// Handle connection status
socket.on('connect', () => {
    updateConnectionStatus(true);
    console.log('Connected to server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    updateConnectionStatus(false);
});

socket.on('error', (error) => {
    console.error('Server error:', error);
    toggleError(true);
});

// Handle initial data and updates
socket.on('initialData', (newOpportunities) => {
    console.log('Received initial data:', newOpportunities);
    toggleLoading(false);
    opportunities = newOpportunities || [];
    updateOpportunitiesGrid();
});

socket.on('opportunities', (newOpportunities) => {
    console.log('Received new opportunities:', newOpportunities);
    opportunities = newOpportunities || [];
    updateOpportunitiesGrid();
});

// Show/hide loading state
const toggleLoading = (show) => {
    loadingState.classList.toggle('hidden', !show);
    if (show) {
        opportunitiesGrid.innerHTML = '';
    }
};

// Show/hide error state
const toggleError = (show) => {
    errorState.classList.toggle('hidden', !show);
    if (show) {
        toggleLoading(false);
    }
};

// Update connection status
const updateConnectionStatus = (connected) => {
    connectionStatus.classList.remove('hidden');
    if (connected) {
        connectionStatus.textContent = 'Connected';
        connectionStatus.classList.remove('bg-red-100', 'text-red-800');
        connectionStatus.classList.add('bg-green-100', 'text-green-800');
        toggleError(false);
    } else {
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.classList.remove('bg-green-100', 'text-green-800');
        connectionStatus.classList.add('bg-red-100', 'text-red-800');
        toggleError(true);
    }
};

// Format date and time
const formatDateTime = (dateString) => {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format currency
const formatCurrency = (amount) => {
    // Convert to ZMK (multiply by exchange rate of 1 USD = 30 ZMK)
    const zmkAmount = amount * 30;
    return new Intl.NumberFormat('en-ZM', {
        style: 'currency',
        currency: 'ZMK',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(zmkAmount);
};

// Create opportunity card
const createOpportunityCard = (opportunity) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300';
    
    card.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-gray-500">${opportunity.league}</span>
                <span class="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                    ${opportunity.profit.toFixed(2)}% Profit
                </span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${opportunity.match}</h3>
            <div class="text-sm text-gray-600 mb-4">
                <p><i class="far fa-clock mr-2"></i>${formatDateTime(opportunity.datetime)}</p>
                <p><i class="fas fa-wallet mr-2"></i>Total Stake: ${formatCurrency(opportunity.totalStake)}</p>
            </div>
            <div class="space-y-3 mb-4">
                ${opportunity.bets.map(bet => `
                    <div class="bg-gray-50 p-3 rounded-md">
                        <div class="flex justify-between items-center text-sm mb-2">
                            <span class="font-medium text-gray-900">${bet.bookmaker}</span>
                            <span class="text-indigo-600 font-semibold">Odds: ${bet.odds.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-600">${bet.market}</span>
                            <span class="font-medium">Stake: ${formatCurrency(bet.stake)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="border-t pt-4">
                <button onclick="window.location.href='/detail.html?id=${opportunity.id}'" 
                        class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-300">
                    View Details
                </button>
            </div>
        </div>
    `;
    
    return card;
};

// Update opportunities grid
const updateOpportunitiesGrid = () => {
    opportunitiesGrid.innerHTML = '';
    
    const filteredOpportunities = opportunities.filter(opp => {
        const leagueMatch = !filters.league || opp.league.toLowerCase() === filters.league.toLowerCase();
        const bookmakerMatch = !filters.bookmaker || 
            opp.bets.some(bet => bet.bookmaker.toLowerCase() === filters.bookmaker.toLowerCase());
        const profitMatch = !filters.minProfit || opp.profit >= filters.minProfit;
        
        return leagueMatch && bookmakerMatch && profitMatch;
    });

    if (filteredOpportunities.length === 0) {
        opportunitiesGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500">No arbitrage opportunities found matching your criteria.</p>
            </div>
        `;
    } else {
        filteredOpportunities.forEach(opportunity => {
            opportunitiesGrid.appendChild(createOpportunityCard(opportunity));
        });
    }

    // Update stats
    updateStats(filteredOpportunities);
    
    // Update filter options
    updateFilterOptions();
};

// Update statistics
const updateStats = (filteredOpportunities) => {
    activeOpps.textContent = filteredOpportunities.length;
    
    if (filteredOpportunities.length > 0) {
        const profits = filteredOpportunities.map(opp => opp.profit);
        const avgProfitValue = profits.reduce((a, b) => a + b, 0) / profits.length;
        const highestProfitValue = Math.max(...profits);
        
        avgProfit.textContent = avgProfitValue.toFixed(2) + '%';
        highestProfit.textContent = highestProfitValue.toFixed(2) + '%';
    } else {
        avgProfit.textContent = '0%';
        highestProfit.textContent = '0%';
    }
};

// Update filter options
const updateFilterOptions = () => {
    // Get unique leagues and bookmakers
    const leagues = new Set();
    const bookmakers = new Set();
    
    opportunities.forEach(opp => {
        leagues.add(opp.league);
        opp.bets.forEach(bet => bookmakers.add(bet.bookmaker));
    });

    // Update league filter options
    leagueFilter.innerHTML = '<option value="">All Leagues</option>';
    [...leagues].sort().forEach(league => {
        leagueFilter.innerHTML += `<option value="${league}">${league}</option>`;
    });

    // Update bookmaker filter options
    bookmakerFilter.innerHTML = '<option value="">All Bookmakers</option>';
    [...bookmakers].sort().forEach(bookmaker => {
        bookmakerFilter.innerHTML += `<option value="${bookmaker}">${bookmaker}</option>`;
    });

    // Restore selected values
    leagueFilter.value = filters.league;
    bookmakerFilter.value = filters.bookmaker;
    minProfitFilter.value = filters.minProfit;
};

// Event Listeners
leagueFilter.addEventListener('change', (e) => {
    filters.league = e.target.value;
    updateOpportunitiesGrid();
});

bookmakerFilter.addEventListener('change', (e) => {
    filters.bookmaker = e.target.value;
    updateOpportunitiesGrid();
});

minProfitFilter.addEventListener('input', (e) => {
    filters.minProfit = parseFloat(e.target.value) || 0;
    updateOpportunitiesGrid();
});

// Initial load
toggleLoading(true);
