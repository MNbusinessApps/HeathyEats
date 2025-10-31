/**
 * Food Source App - Main Application Logic
 * Handles UI interactions and displays real analytics
 */

class FoodSourceApp {
    constructor() {
        this.analyticsEngine = new SportsAnalyticsEngine();
        this.currentFilter = 'all';
        this.currentScreen = 'home-screen';
        this.nflProps = [];
        this.nbaProps = [];
        
        this.init();
    }

    init() {
        // Initialize the app
        console.log('Food Source App initialized');
        
        // Load data when page loads
        this.loadNFLProps();
        this.loadNBAProps();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAnalysis();
            }
        });

        // Filter button click handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.handleFilterClick(e.target);
            }
        });
    }

    // Screen navigation
    showScreen(screenId) {
        // Hide all screens
        const screens = ['home-screen', 'nfl-screen', 'nba-screen'];
        screens.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) screen.classList.add('hidden');
        });

        // Show selected screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
        }

        // Load props data when entering a sports screen
        if (screenId === 'nfl-screen' && this.nflProps.length === 0) {
            this.loadNFLProps();
        } else if (screenId === 'nba-screen' && this.nbaProps.length === 0) {
            this.loadNBAProps();
        }
    }

    // Load NFL props with real analytics
    loadNFLProps() {
        this.nflProps = this.analyticsEngine.generateNFLProps();
        this.renderNFLProps();
    }

    // Load NBA props with real analytics
    loadNBAProps() {
        this.nbaProps = this.analyticsEngine.generateNBAProps();
        this.renderNBAProps();
    }

    // Render NFL props grid
    renderNFLProps() {
        const grid = document.getElementById('nfl-props-grid');
        if (!grid) return;

        const filteredProps = this.filterNFLProps();
        
        grid.innerHTML = filteredProps.map(prop => this.createPropCard(prop)).join('');
    }

    // Render NBA props grid
    renderNBAProps() {
        const grid = document.getElementById('nba-props-grid');
        if (!grid) return;

        const filteredProps = this.filterNBAProps();
        
        grid.innerHTML = filteredProps.map(prop => this.createPropCard(prop)).join('');
    }

    // Create a prop card with real analytics
    createPropCard(prop) {
        const confidenceClass = prop.prop.direction === 'over' ? 'confidence-over' : 'confidence-under';
        const confidenceIcon = prop.prop.direction === 'over' ? '📈' : '📉';
        
        return `
            <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 card-hover" data-prop-id="${prop.id}">
                <!-- Player Info -->
                <div class="mb-4">
                    <h3 class="text-xl font-semibold text-gray-100 mb-1">${prop.player.name}</h3>
                    <p class="text-sm text-gray-400">${prop.player.team} • ${prop.player.position}</p>
                </div>

                <!-- Prop Line & Odds -->
                <div class="mb-4">
                    <div class="text-lg font-medium text-gray-100 mb-1">
                        ${prop.prop.direction.toUpperCase()} ${prop.prop.line} ${prop.prop.market}
                    </div>
                    <div class="text-sm text-gray-400">Odds: ${prop.prop.odds}</div>
                </div>

                <!-- Confidence Score -->
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-gray-400">Confidence Score</span>
                        <span class="text-xs text-gray-500">${confidenceIcon}</span>
                    </div>
                    <div class="text-3xl font-bold ${confidenceClass}">${prop.confidence}%</div>
                    <div class="w-full bg-gray-800 rounded-full h-2 mt-2">
                        <div class="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full" 
                             style="width: ${prop.confidence}%"></div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex space-x-3">
                    <button onclick="foodSourceApp.showAnalysis('${prop.id}')" 
                            class="gold-gradient text-black font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all flex-1">
                        View Analysis
                    </button>
                    <button class="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        Add to Watchlist
                    </button>
                </div>
            </div>
        `;
    }

    // Show detailed analysis
    showAnalysis(propId) {
        const prop = this.findPropById(propId);
        if (!prop) return;

        const modal = document.getElementById('analysis-modal');
        const title = document.getElementById('analysis-title');
        const content = document.getElementById('analysis-content');

        title.textContent = `${prop.player.name} - ${prop.prop.market}`;
        
        content.innerHTML = this.createAnalysisContent(prop);
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Create detailed analysis content
    createAnalysisContent(prop) {
        const analysis = prop.analysis;
        const confidenceClass = prop.prop.direction === 'over' ? 'text-green-500' : 'text-red-500';

        return `
            <div class="space-y-6">
                <!-- Overall Confidence -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h4 class="text-lg font-semibold mb-3 text-yellow-500">Overall Assessment</h4>
                    <div class="flex items-center space-x-4">
                        <div class="text-4xl font-bold ${confidenceClass}">${prop.confidence}%</div>
                        <div>
                            <div class="text-sm text-gray-400">Confidence Level</div>
                            <div class="text-xs text-gray-500">
                                ${prop.prop.direction.toUpperCase()} ${prop.prop.line} ${prop.prop.market}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Performance -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h4 class="text-lg font-semibold mb-3 text-yellow-500">Recent Performance Analysis</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div class="text-sm text-gray-400 mb-1">Hit Rate</div>
                            <div class="text-2xl font-bold text-green-500">${(analysis.recentPerformance.hitRate * 100).toFixed(0)}%</div>
                            <div class="text-xs text-gray-500">${analysis.recentPerformance.gamesAnalyzed} games analyzed</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-400 mb-1">Average Performance</div>
                            <div class="text-2xl font-bold text-gray-100">${analysis.recentPerformance.averagePerformance.toFixed(1)}</div>
                            <div class="text-xs text-gray-500">${prop.prop.market} per game</div>
                        </div>
                    </div>
                    <div class="mt-3 text-sm text-gray-300">
                        ${analysis.recentPerformance.reasoning}
                    </div>
                </div>

                <!-- Opponent Matchup -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h4 class="text-lg font-semibold mb-3 text-yellow-500">Opponent Defensive Matchup</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div class="text-sm text-gray-400 mb-1">Defense Rank vs ${prop.player.position}</div>
                            <div class="text-2xl font-bold text-gray-100">${analysis.opponentMatchup.defenseRank}th</div>
                            <div class="text-xs text-gray-500">Out of 32 teams</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-400 mb-1">Yards Allowed</div>
                            <div class="text-2xl font-bold text-gray-100">${analysis.opponentMatchup.yardsAllowed}</div>
                            <div class="text-xs text-gray-500">Per game</div>
                        </div>
                    </div>
                    <div class="mt-3 text-sm text-gray-300">
                        ${analysis.opponentMatchup.reasoning}
                    </div>
                </div>

                <!-- Historical Trends -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h4 class="text-lg font-semibold mb-3 text-yellow-500">Historical Performance</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div class="text-sm text-gray-400 mb-1">Historical Hit Rate</div>
                            <div class="text-2xl font-bold text-green-500">${(analysis.historicalTrends.historicalHitRate * 100).toFixed(0)}%</div>
                            <div class="text-xs text-gray-500">Similar props</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-400 mb-1">Season vs Career</div>
                            <div class="text-2xl font-bold text-gray-100">${(analysis.historicalTrends.seasonVsCareer * 100).toFixed(0)}%</div>
                            <div class="text-xs text-gray-500">Current form</div>
                        </div>
                    </div>
                    <div class="mt-3 text-sm text-gray-300">
                        ${analysis.historicalTrends.reasoning}
                    </div>
                </div>

                <!-- External Factors -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h5 class="text-sm font-semibold mb-2 text-yellow-500">Weather Conditions</h5>
                        <div class="text-xs text-gray-300">${analysis.weatherFactors.reasoning}</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h5 class="text-sm font-semibold mb-2 text-yellow-500">Venue Factors</h5>
                        <div class="text-xs text-gray-300">${analysis.venueFactors.reasoning}</div>
                    </div>
                    <div class="bg-gray-800 rounded-lg p-4">
                        <h5 class="text-sm font-semibold mb-2 text-yellow-500">Market Analysis</h5>
                        <div class="text-xs text-gray-300">${analysis.marketEfficiency.reasoning}</div>
                    </div>
                </div>

                <!-- Risk Assessment -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h4 class="text-lg font-semibold mb-3 text-yellow-500">Risk Assessment</h4>
                    <div class="text-sm text-gray-300">
                        <p class="mb-2"><strong>Confidence Level:</strong> ${prop.confidence}% ${prop.confidence >= 70 ? '(High Confidence)' : prop.confidence >= 55 ? '(Medium Confidence)' : '(Low Confidence)'}</p>
                        <p class="mb-2"><strong>Key Factors:</strong></p>
                        <ul class="list-disc list-inside space-y-1 text-gray-400">
                            <li>Recent performance trend: ${analysis.recentPerformance.trend > 0 ? 'Improving' : 'Declining'}</li>
                            <li>Opponent difficulty: ${analysis.opponentMatchup.defenseRank <= 15 ? 'Tough matchup' : 'Favorable matchup'}</li>
                            <li>Historical success rate: ${(analysis.historicalTrends.historicalHitRate * 100).toFixed(0)}% on similar props</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    // Close analysis modal
    closeAnalysis() {
        const modal = document.getElementById('analysis-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // Find prop by ID
    findPropById(propId) {
        const allProps = [...this.nflProps, ...this.nbaProps];
        return allProps.find(prop => prop.id === propId);
    }

    // Filter NFL props by position
    filterNFLProps() {
        if (this.currentFilter === 'all') return this.nflProps;
        return this.nflProps.filter(prop => prop.player.position === this.currentFilter);
    }

    // Filter NBA props by position
    filterNBAProps() {
        if (this.currentFilter === 'all') return this.nbaProps;
        return this.nbaProps.filter(prop => prop.player.position === this.currentFilter);
    }

    // Handle filter button clicks
    handleFilterClick(button) {
        // Remove active class from all filter buttons in current screen
        const activeScreen = document.querySelector(`#${this.currentScreen} .filter-btn.active`);
        if (activeScreen) {
            activeScreen.classList.remove('active', 'bg-yellow-500', 'text-black');
            activeScreen.classList.add('bg-gray-800', 'text-gray-400');
        }

        // Add active class to clicked button
        button.classList.add('active', 'bg-yellow-500', 'text-black');
        button.classList.remove('bg-gray-800', 'text-gray-400');

        // Update current filter and re-render
        this.currentFilter = button.textContent.includes('All') ? 'all' : button.textContent.split(' ')[0];
        
        if (this.currentScreen === 'nfl-screen') {
            this.renderNFLProps();
        } else if (this.currentScreen === 'nba-screen') {
            this.renderNBAProps();
        }
    }
}

// Global functions for HTML onclick handlers
function showScreen(screenId) {
    if (window.foodSourceApp) {
        window.foodSourceApp.showScreen(screenId);
    }
}

function filterNFL(position) {
    if (window.foodSourceApp) {
        window.foodSourceApp.currentFilter = position;
        window.foodSourceApp.renderNFLProps();
    }
}

function filterNBA(position) {
    if (window.foodSourceApp) {
        window.foodSourceApp.currentFilter = position;
        window.foodSourceApp.renderNBAProps();
    }
}

// Global functions for HTML onclick handlers - defined immediately
function showScreen(screenId) {
    console.log('showScreen called with:', screenId);
    if (window.foodSourceApp) {
        window.foodSourceApp.showScreen(screenId);
    } else {
        console.log('App not ready yet, queuing action...');
        // Try again in 100ms if app not ready
        setTimeout(() => {
            if (window.foodSourceApp) {
                window.foodSourceApp.showScreen(screenId);
            }
        }, 100);
    }
}

function filterNFL(position) {
    console.log('filterNFL called with:', position);
    if (window.foodSourceApp) {
        window.foodSourceApp.currentFilter = position;
        window.foodSourceApp.renderNFLProps();
    }
}

function filterNBA(position) {
    console.log('filterNBA called with:', position);
    if (window.foodSourceApp) {
        window.foodSourceApp.currentFilter = position;
        window.foodSourceApp.renderNBAProps();
    }
}

function closeAnalysis() {
    console.log('closeAnalysis called');
    if (window.foodSourceApp) {
        window.foodSourceApp.closeAnalysis();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Food Source App...');
    window.foodSourceApp = new FoodSourceApp();
    console.log('Food Source App loaded successfully!');
});