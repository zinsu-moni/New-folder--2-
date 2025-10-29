// Top Earners Page Integration

document.addEventListener('DOMContentLoaded', async () => {
    await loadTopEarners();
});

async function loadTopEarners() {
    try {
        showLoadingState();
        
        const topEarners = await api.getTopEarners(20);
        renderTopEarners(topEarners);
        
    } catch (error) {
        console.error('Error loading top earners:', error);
        showToast('Failed to load leaderboard', 'error');
        showErrorState();
    }
}

function renderTopEarners(earners) {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (!leaderboardBody) return;
    
    if (earners.length === 0) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px;">
                    <i class="fas fa-trophy" style="font-size: 48px; color: #64748b; margin-bottom: 15px;"></i>
                    <p>No earners yet. Be the first!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    leaderboardBody.innerHTML = earners.map(earner => {
        const rankClass = getRankBadgeClass(earner.rank);
        return `
            <tr>
                <td><span class="rank-badge ${rankClass}">${earner.rank}</span></td>
                <td><span class="user-name">${earner.username}</span></td>
                <td><span class="earnings">${formatCurrency(earner.affiliate_earnings || 0)}</span></td>
                <td><span class="referrals">${earner.referral_count || 0}</span></td>
            </tr>
        `;
    }).join('');
}

function getRankBadgeClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
}

function showLoadingState() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (leaderboardBody) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: var(--primary-color);"></i>
                    <p style="margin-top: 15px;">Loading leaderboard...</p>
                </td>
            </tr>
        `;
    }
}

function showErrorState() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (leaderboardBody) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 15px;"></i>
                    <p>Failed to load leaderboard</p>
                    <button onclick="loadTopEarners()" class="btn-retry" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </td>
            </tr>
        `;
    }
}

// Auto-refresh every 60 seconds
setInterval(async () => {
    await loadTopEarners();
}, 60000);
