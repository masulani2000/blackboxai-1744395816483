// Connect to WebSocket server
const socket = io({
    transports: ['websocket'],
    upgrade: false,
    withCredentials: true
});

// DOM Elements
const matchTitle = document.getElementById('matchTitle');
const profitBadge = document.getElementById('profitBadge');
const leagueName = document.getElementById('leagueName');
const eventDateTime = document.getElementById('eventDateTime');
const totalStake = document.getElementById('totalStake');
const bettingInstructions = document.getElementById('bettingInstructions');
const totalInvestment = document.getElementById('totalInvestment');
const guaranteedReturn = document.getElementById('guaranteedReturn');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const connectionStatus = document.getElementById('connectionStatus');

// State
let currentOpportunity = null;

// Handle connection status
socket.on('connect', () => {
    console.log('Connected to server');
    updateConnectionStatus(true);
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    updateConnectionStatus(false);
    showError('Unable to connect to server. Please check your internet connection.');
});

socket.on('error', (error) => {
    console.error('Server error:', error);
    showError('Server error occurred. Please try again later.');
});

// Handle real-time updates
socket.on('opportunities', (opportunities) => {
    if (!currentOpportunity) return;
    
    const updatedOpportunity = opportunities.find(opp => opp.id === currentOpportunity.id);
    if (updatedOpportunity) {
        updateOpportunityDetails(updatedOpportunity);
    }
});

// Update connection status
const updateConnectionStatus = (connected) => {
    connectionStatus.classList.remove('hidden');
    if (connected) {
        connectionStatus.textContent = 'Connected';
        connectionStatus.classList.remove('bg-red-100', 'text-red-800');
        connectionStatus.classList.add('bg-green-100', 'text-green-800');
    } else {
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.classList.remove('bg-green-100', 'text-green-800');
        connectionStatus.classList.add('bg-red-100', 'text-red-800');
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

// Show/hide loading state
const toggleLoading = (show) => {
    loadingState.classList.toggle('hidden', !show);
};

// Show error message
const showError = (message) => {
    errorState.classList.remove('hidden');
    errorState.querySelector('p').textContent = message;
    toggleLoading(false);
};

// Hide error message
const hideError = () => {
    errorState.classList.add('hidden');
};

// Calculate potential returns
const calculateReturns = (bet) => {
    const potentialReturn = bet.stake * bet.odds;
    const profit = potentialReturn - bet.stake;
    return {
        potentialReturn: formatCurrency(potentialReturn),
        profit: formatCurrency(profit)
    };
};

// Update UI with opportunity details
const updateOpportunityDetails = (opportunity) => {
    try {
        currentOpportunity = opportunity;

        // Update basic information
        matchTitle.textContent = opportunity.match;
        profitBadge.textContent = `${opportunity.profit.toFixed(2)}% Profit`;
        leagueName.textContent = opportunity.league;
        eventDateTime.textContent = formatDateTime(opportunity.datetime);
        totalStake.textContent = formatCurrency(opportunity.totalStake);

        // Update betting instructions
        bettingInstructions.innerHTML = opportunity.bets.map((bet, index) => {
            const returns = calculateReturns(bet);
            return `
                <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-lg font-semibold text-gray-900">
                            <i class="fas fa-bookmark mr-2 text-indigo-500"></i>
                            Bet ${index + 1}: ${bet.bookmaker}
                        </h4>
                        <span class="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full">
                            Odds: ${bet.odds.toFixed(2)}
                        </span>
                    </div>
                    <div class="space-y-3">
                        <p class="text-gray-600">
                            <i class="fas fa-tag mr-2"></i>
                            Market: ${bet.market}
                        </p>
                        <p class="text-gray-600">
                            <i class="fas fa-coins mr-2"></i>
                            Stake: ${formatCurrency(bet.stake)}
                            <span class="text-sm text-gray-500 ml-2">(${(bet.stake / opportunity.totalStake * 100).toFixed(1)}% of total)</span>
                        </p>
                        <p class="text-gray-600">
                            <i class="fas fa-chart-line mr-2"></i>
                            Potential Return: ${returns.potentialReturn}
                            <span class="text-sm text-green-600 ml-2">(+${returns.profit})</span>
                        </p>
                        <div class="mt-4 p-3 bg-blue-50 rounded-md">
                            <p class="text-sm text-blue-700">
                                <i class="fas fa-info-circle mr-2"></i>
                                Place this bet at <strong>${bet.bookmaker}</strong> with odds of <strong>${bet.odds.toFixed(2)}</strong>.
                                Stake exactly <strong>${formatCurrency(bet.stake)}</strong> on <strong>${bet.market}</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update profit breakdown
        const totalInvestmentAmount = opportunity.totalStake;
        const guaranteedReturnAmount = totalInvestmentAmount * (1 + (opportunity.profit / 100));

        totalInvestment.textContent = formatCurrency(totalInvestmentAmount);
        guaranteedReturn.textContent = formatCurrency(guaranteedReturnAmount);

        hideError();
    } catch (error) {
        console.error('Error updating opportunity details:', error);
        showError('Error updating opportunity details. Please refresh the page.');
    }
};

// Fetch opportunity details
const fetchOpportunityDetails = async (id) => {
    try {
        toggleLoading(true);
        hideError();

        const response = await fetch(`/api/arbitrage/${id}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch opportunity details');
        }

        const opportunity = await response.json();
        updateOpportunityDetails(opportunity);
    } catch (error) {
        console.error('Error fetching opportunity details:', error);
        showError(error.message || 'Error loading opportunity details. Please try again later.');
    } finally {
        toggleLoading(false);
    }
};

// Get opportunity ID from URL
const urlParams = new URLSearchParams(window.location.search);
const opportunityId = urlParams.get('id');

// Initial load
if (opportunityId) {
    fetchOpportunityDetails(opportunityId);
} else {
    toggleLoading(false);
    showError('No opportunity ID provided. Please select an opportunity from the main page.');
}
