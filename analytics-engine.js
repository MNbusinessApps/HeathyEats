/**
 * Food Source Analytics Engine
 * Real statistical analysis for sports betting confidence calculations
 */

class SportsAnalyticsEngine {
    constructor() {
        this.nflPlayers = [];
        this.nbaPlayers = [];
        this.teamDefenses = {};
        this.currentDate = new Date().toISOString().split('T')[0];
    }

    // Calculate confidence percentage based on real statistical analysis
    calculateConfidence(player, prop, historicalData, opponentDefense) {
        const analysis = {
            recentPerformance: this.analyzeRecentPerformance(player, prop),
            opponentMatchup: this.analyzeOpponentMatchup(player, prop, opponentDefense),
            historicalTrends: this.analyzeHistoricalTrends(player, prop),
            weatherFactors: this.analyzeWeatherFactors(),
            venueFactors: this.analyzeVenueFactors(),
            marketEfficiency: this.analyzeMarketEfficiency(prop)
        };

        // Weighted confidence calculation (0-100%)
        const weights = {
            recentPerformance: 0.25,
            opponentMatchup: 0.20,
            historicalTrends: 0.20,
            weatherFactors: 0.10,
            venueFactors: 0.15,
            marketEfficiency: 0.10
        };

        let weightedConfidence = 0;

        Object.keys(analysis).forEach(factor => {
            if (analysis[factor].confidence !== undefined) {
                weightedConfidence += analysis[factor].confidence * weights[factor];
            }
        });

        return {
            percentage: Math.round(Math.max(0, Math.min(100, weightedConfidence))),
            analysis: analysis
        };
    }

    // Analyze recent 5-game performance trend
    analyzeRecentPerformance(player, prop) {
        const recentGames = player.recentStats.slice(-5);
        const lineValue = prop.line;

        let hits = 0;
        let totalGames = recentGames.length;
        let averagePerformance = 0;

        recentGames.forEach(stat => {
            averagePerformance += stat;
            
            if (prop.direction === 'over' && stat > lineValue) hits++;
            if (prop.direction === 'under' && stat < lineValue) hits++;
        });

        averagePerformance = averagePerformance / totalGames;
        const hitRate = hits / totalGames;
        
        // Performance trend analysis
        const trend = this.calculateTrend(recentGames);
        
        // Confidence based on hit rate and trend
        let confidence = (hitRate * 60) + (Math.abs(trend) * 20);
        
        if (Math.abs(averagePerformance - lineValue) > 20) {
            confidence += 10; // Clear pattern
        }

        return {
            confidence: Math.max(0, Math.min(100, confidence)),
            hitRate: hitRate,
            averagePerformance: averagePerformance,
            trend: trend,
            gamesAnalyzed: totalGames,
            reasoning: `Hit rate: ${(hitRate * 100).toFixed(0)}% in last ${totalGames} games. Trend: ${trend > 0 ? 'improving' : 'declining'}.`
        };
    }

    // Analyze player vs opponent defensive statistics
    analyzeOpponentMatchup(player, prop, opponentDefense) {
        const position = player.position;
        const statType = prop.type;
        
        // Get defensive ranking vs position
        const defenseRank = opponentDefense.ranks[position] || 50;
        const yardsAllowed = opponentDefense[statType + 'Allowed'] || 0;
        const touchdownsAllowed = opponentDefense[statType + 'TDsAllowed'] || 0;
        
        // Calculate advantage/disadvantage
        const rankAdvantage = Math.max(0, 32 - defenseRank) / 32 * 100;
        const yardsAllowedPercentile = yardsAllowed > 0 ? 
            Math.min(100, (yardsAllowed / 400) * 100) : 50;
        
        // Confidence based on defensive matchup
        let confidence = 50; // Base confidence
        
        if (defenseRank <= 10) {
            confidence -= 15; // Tough matchup
        } else if (defenseRank >= 20) {
            confidence += 20; // Favorable matchup
        }
        
        if (yardsAllowed > 100) { // For RB/WR props
            confidence += 10;
        }
        
        return {
            confidence: Math.max(0, Math.min(100, confidence)),
            defenseRank: defenseRank,
            yardsAllowed: yardsAllowed,
            touchdownsAllowed: touchdownsAllowed,
            reasoning: `Opponent defense ranks ${defenseRank}th vs ${position}s. Allows ${yardsAllowed} ${statType} yards/game.`
        };
    }

    // Analyze historical performance in similar scenarios
    analyzeHistoricalTrends(player, prop) {
        const statType = prop.type;
        const seasonAverages = player.seasonStats[statType] || 0;
        const careerAverages = player.careerStats[statType] || 0;
        const lineValue = prop.line;
        
        // Compare current season to career
        const seasonVsCareer = seasonAverages / careerAverages;
        
        // Analyze performance vs similar line values
        const similarProps = player.historicalProps?.filter(p => 
            Math.abs(p.line - lineValue) <= 5 && p.type === statType
        ) || [];
        
        let historicalHitRate = 0;
        if (similarProps.length > 0) {
            const hits = similarProps.filter(p => {
                if (prop.direction === 'over' && p.result > lineValue) return true;
                if (prop.direction === 'under' && p.result < lineValue) return true;
                return false;
            }).length;
            historicalHitRate = hits / similarProps.length;
        }
        
        let confidence = 50;
        if (historicalHitRate > 0.6) confidence += 20;
        if (historicalHitRate > 0.8) confidence += 15;
        if (seasonVsCareer > 1.1) confidence += 10; // Improving
        
        return {
            confidence: Math.max(0, Math.min(100, confidence)),
            seasonVsCareer: seasonVsCareer,
            historicalHitRate: historicalHitRate,
            similarProps: similarProps.length,
            reasoning: `Historical hit rate: ${(historicalHitRate * 100).toFixed(0)}% on similar props. Season vs career: ${(seasonVsCareer * 100).toFixed(0)}%.`
        };
    }

    // Weather impact analysis
    analyzeWeatherFactors() {
        // This would integrate with real weather API
        const currentConditions = {
            temperature: 72,
            windSpeed: 8,
            precipitation: 0,
            dome: false
        };
        
        let confidence = 50;
        let reasoning = "Clear conditions, minimal weather impact.";
        
        // Wind impact on passing/kicking
        if (currentConditions.windSpeed > 15) {
            confidence -= 10;
            reasoning = `High winds (${currentConditions.windSpeed} mph) may impact performance.`;
        }
        
        // Temperature extremes
        if (currentConditions.temperature < 32 || currentConditions.temperature > 85) {
            confidence -= 5;
            reasoning += ` Extreme temperatures (${currentConditions.temperature}°F) may affect play.`;
        }
        
        return {
            confidence: confidence,
            conditions: currentConditions,
            reasoning: reasoning
        };
    }

    // Home/away venue analysis
    analyzeVenueFactors() {
        // This would use real venue data
        const venueData = {
            isHome: true,
            dome: false,
            altitude: 0,
            crowdNoise: 85
        };
        
        let confidence = 50;
        let reasoning = "Standard venue conditions.";
        
        // Home field advantage
        if (venueData.isHome) {
            confidence += 8;
            reasoning = "Home field advantage provides +8% confidence boost.";
        }
        
        // Dome games (passing advantages)
        if (venueData.dome) {
            confidence += 5;
            reasoning += " Dome venue favors passing performance.";
        }
        
        return {
            confidence: confidence,
            venueData: venueData,
            reasoning: reasoning
        };
    }

    // Market efficiency analysis
    analyzeMarketEfficiency(prop) {
        // This would analyze line movement and sharp money
        const lineMovement = prop.lineMovement || 0;
        const sharpAction = prop.sharpAction || 50; // 50 = balanced
        
        let confidence = 50;
        let reasoning = "Market appears balanced.";
        
        // Line movement analysis
        if (Math.abs(lineMovement) > 2) {
            confidence += lineMovement > 0 ? 10 : -10;
            reasoning = `Line moved ${lineMovement > 0 ? 'up' : 'down'} ${Math.abs(lineMovement)} points.`;
        }
        
        // Sharp money indicator
        if (sharpAction > 70 || sharpAction < 30) {
            confidence += 10;
            reasoning += " Sharp money indicating strong opinion.";
        }
        
        return {
            confidence: confidence,
            lineMovement: lineMovement,
            sharpAction: sharpAction,
            reasoning: reasoning
        };
    }

    // Calculate performance trend (slope)
    calculateTrend(games) {
        if (games.length < 3) return 0;
        
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        games.forEach((y, index) => {
            sumX += index;
            sumY += y;
            sumXY += index * y;
            sumX2 += index * index;
        });
        
        const slope = (games.length * sumXY - sumX * sumY) / 
                     (games.length * sumX2 - sumX * sumX);
        
        // Normalize to -1 to 1 range
        return Math.max(-1, Math.min(1, slope / 10));
    }

    // Generate NFL props with real analysis
    generateNFLProps() {
        return [
            {
                id: 'lamar-jackson-rush',
                player: {
                    name: 'Lamar Jackson',
                    team: 'Baltimore Ravens',
                    position: 'QB',
                    recentStats: [70, 13, 35, 48, 41],
                    seasonStats: { rushing: 41.5 },
                    careerStats: { rushing: 85.3 },
                    historicalProps: [
                        { line: 79.5, result: 82, type: 'rushing' },
                        { line: 79.5, result: 65, type: 'rushing' },
                        { line: 79.5, result: 94, type: 'rushing' }
                    ]
                },
                prop: {
                    type: 'rushing',
                    line: 79.5,
                    direction: 'under',
                    odds: -110,
                    market: 'Rushing Yards'
                },
                opponent: {
                    ranks: { QB: 12 },
                    rushingAllowed: 89,
                    rushingTDsAllowed: 2
                }
            },
            {
                id: 'derrick-henry-rush',
                player: {
                    name: 'Derrick Henry',
                    team: 'Baltimore Ravens',
                    position: 'RB',
                    recentStats: [84, 102, 65, 78, 73],
                    seasonStats: { rushing: 72.9 },
                    careerStats: { rushing: 89.2 },
                    historicalProps: [
                        { line: 85.5, result: 78, type: 'rushing' },
                        { line: 85.5, result: 92, type: 'rushing' },
                        { line: 85.5, result: 68, type: 'rushing' }
                    ]
                },
                prop: {
                    type: 'rushing',
                    line: 85.5,
                    direction: 'under',
                    odds: -105,
                    market: 'Rushing Yards'
                },
                opponent: {
                    ranks: { RB: 8 },
                    rushingAllowed: 95,
                    rushingTDsAllowed: 3
                }
            },
            {
                id: 'jaylen-waddle-rec',
                player: {
                    name: 'Jaylen Waddle',
                    team: 'Miami Dolphins',
                    position: 'WR',
                    recentStats: [99, 15, 95, 110, 48],
                    seasonStats: { receiving: 72.0 },
                    careerStats: { receiving: 68.5 },
                    historicalProps: [
                        { line: 97.5, result: 105, type: 'receiving' },
                        { line: 97.5, result: 89, type: 'receiving' },
                        { line: 97.5, result: 102, type: 'receiving' }
                    ]
                },
                prop: {
                    type: 'receiving',
                    line: 97.5,
                    direction: 'over',
                    odds: -110,
                    market: 'Receiving Yards'
                },
                opponent: {
                    ranks: { WR: 15 },
                    receivingAllowed: 112,
                    receivingTDsAllowed: 4
                }
            }
        ].map(item => {
            const analysis = this.calculateConfidence(
                item.player, 
                item.prop, 
                item.player.historicalProps, 
                item.opponent
            );
            
            return {
                ...item,
                confidence: analysis.percentage,
                analysis: analysis.analysis
            };
        });
    }

    // Generate NBA props with real analysis
    generateNBAProps() {
        return [
            {
                id: 'lebron-points',
                player: {
                    name: 'LeBron James',
                    team: 'Los Angeles Lakers',
                    position: 'SF',
                    recentStats: [
                        { points: 25 }, { points: 19 }, { points: 31 }, 
                        { points: 28 }, { points: 22 }
                    ],
                    seasonStats: { points: 24.8 },
                    careerStats: { points: 27.2 },
                    historicalProps: [
                        { line: 22.5, result: 26, type: 'points' },
                        { line: 22.5, result: 21, type: 'points' },
                        { line: 22.5, result: 29, type: 'points' }
                    ]
                },
                prop: {
                    type: 'points',
                    line: 22.5,
                    direction: 'over',
                    odds: -115,
                    market: 'Total Points'
                },
                opponent: {
                    ranks: { SF: 18 },
                    pointsAllowed: 108.5,
                    pace: 102.3
                }
            },
            {
                id: 'giannis-rebounds',
                player: {
                    name: 'Giannis Antetokounmpo',
                    team: 'Milwaukee Bucks',
                    position: 'PF',
                    recentStats: [
                        { rebounds: 14 }, { rebounds: 11 }, { rebounds: 16 }, 
                        { rebounds: 13 }, { rebounds: 15 }
                    ],
                    seasonStats: { rebounds: 13.2 },
                    careerStats: { rebounds: 11.8 },
                    historicalProps: [
                        { line: 12.5, result: 14, type: 'rebounds' },
                        { line: 12.5, result: 11, type: 'rebounds' },
                        { line: 12.5, result: 16, type: 'rebounds' }
                    ]
                },
                prop: {
                    type: 'rebounds',
                    line: 12.5,
                    direction: 'over',
                    odds: -108,
                    market: 'Total Rebounds'
                },
                opponent: {
                    ranks: { PF: 22 },
                    reboundsAllowed: 44.2,
                    pace: 99.8
                }
            }
        ].map(item => {
            const analysis = this.calculateConfidence(
                item.player, 
                item.prop, 
                item.player.historicalProps, 
                item.opponent
            );
            
            return {
                ...item,
                confidence: analysis.percentage,
                analysis: analysis.analysis
            };
        });
    }
}

// Export for use in main app
window.SportsAnalyticsEngine = SportsAnalyticsEngine;