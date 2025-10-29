// Streaming Page Integration

let currentStream = null;
let audioElement = null;
let progressInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadAudios();
    setupStreamingHandlers();
});

async function loadAudios() {
    try {
        const audios = await api.getAudios();
        renderAudioList(audios);
    } catch (error) {
        console.error('Error loading audios:', error);
        showToast('Failed to load audio tracks', 'error');
    }
}

function renderAudioList(audios) {
    const audioListContainer = document.getElementById('audioList');
    if (!audioListContainer) return;
    
    if (audios.length === 0) {
        audioListContainer.innerHTML = `
            <div class="no-data">
                <i class="fas fa-music" style="font-size: 48px; color: var(--gray); margin-bottom: 15px;"></i>
                <p>No audio tracks available</p>
            </div>
        `;
        return;
    }
    
    audioListContainer.innerHTML = audios.map(audio => `
        <div class="audio-item" data-audio-id="${audio.id}">
            <div class="audio-icon">
                <i class="fas fa-music"></i>
            </div>
            <div class="audio-info">
                <div class="audio-title">${audio.title}</div>
                <div class="audio-artist">${audio.artist || 'Affluence Music'}</div>
                <div class="audio-duration">${formatDuration(audio.duration_seconds)}</div>
            </div>
            <div class="audio-amount">₦${audio.amount}</div>
            <button class="btn-play" data-audio-id="${audio.id}" data-audio-title="${audio.title}" data-audio-duration="${audio.duration_seconds}" data-audio-amount="${audio.amount}">
                <i class="fas fa-play"></i> Play & Earn
            </button>
        </div>
    `).join('');
}

function setupStreamingHandlers() {
    // Play button handler
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.btn-play')) {
            const btn = e.target.closest('.btn-play');
            const audioId = parseInt(btn.dataset.audioId);
            const audioTitle = btn.dataset.audioTitle;
            const audioDuration = parseInt(btn.dataset.audioDuration);
            const audioAmount = parseFloat(btn.dataset.audioAmount);
            
            await startStreaming(audioId, audioTitle, audioDuration, audioAmount);
        }
    });
    
    // Claim button handler
    const claimBtn = document.getElementById('claimStreamReward');
    if (claimBtn) {
        claimBtn.addEventListener('click', handleClaimStreamReward);
    }
    
    // Close streaming button
    const closeBtn = document.getElementById('closeStreaming');
    if (closeBtn) {
        closeBtn.addEventListener('click', stopStreaming);
    }
}

async function startStreaming(audioId, title, duration, amount) {
    try {
        // Start stream session
        const stream = await api.startStream(audioId);
        currentStream = stream;
        
        // Show streaming overlay
        showStreamingOverlay(title, duration, amount);
        
        // Start progress tracking
        startProgressTracking();
        
        showToast('Streaming started! Listen to earn.', 'success');
        
    } catch (error) {
        showToast(error.message || 'Failed to start streaming', 'error');
    }
}

function showStreamingOverlay(title, duration, amount) {
    const overlay = document.getElementById('streamingOverlay');
    if (!overlay) return;
    
    overlay.classList.add('active');
    
    // Update streaming info
    document.getElementById('streamingTitle').textContent = title;
    document.getElementById('streamingDuration').textContent = formatDuration(duration);
    document.getElementById('streamingAmount').textContent = `₦${amount}`;
    
    // Reset progress
    document.getElementById('streamProgress').style.width = '0%';
    document.getElementById('streamProgressText').textContent = '0%';
    
    // Hide claim button initially
    document.getElementById('claimStreamReward').style.display = 'none';
}

function startProgressTracking() {
    let elapsed = 0;
    const totalDuration = parseInt(document.getElementById('streamingDuration').dataset.duration);
    
    progressInterval = setInterval(async () => {
        elapsed += 1;
        
        const progress = (elapsed / totalDuration) * 100;
        updateProgress(progress);
        
        // Update stream progress on backend every 10 seconds
        if (elapsed % 10 === 0 && currentStream) {
            try {
                await api.updateStreamProgress(currentStream.id, elapsed);
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        }
        
        // Stream completed
        if (elapsed >= totalDuration) {
            clearInterval(progressInterval);
            await completeStreaming();
        }
    }, 1000);
}

function updateProgress(progress) {
    const progressBar = document.getElementById('streamProgress');
    const progressText = document.getElementById('streamProgressText');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${Math.round(progress)}%`;
}

async function completeStreaming() {
    try {
        // Final progress update
        if (currentStream) {
            const totalDuration = parseInt(document.getElementById('streamingDuration').dataset.duration);
            await api.updateStreamProgress(currentStream.id, totalDuration);
        }
        
        // Show claim button
        document.getElementById('claimStreamReward').style.display = 'block';
        showToast('Stream completed! Claim your reward.', 'success');
        
    } catch (error) {
        console.error('Error completing stream:', error);
    }
}

async function handleClaimStreamReward() {
    if (!currentStream) return;
    
    const claimBtn = document.getElementById('claimStreamReward');
    const btnText = claimBtn.textContent;
    claimBtn.disabled = true;
    claimBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Claiming...';
    
    try {
        const response = await api.claimStreamReward(currentStream.id);
        
        showToast(`Earned ₦${response.amount_earned}! 🎉`, 'success');
        
        // Close streaming overlay
        stopStreaming();
        
        // Refresh dashboard if function exists
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
        
    } catch (error) {
        showToast(error.message || 'Failed to claim reward', 'error');
        claimBtn.disabled = false;
        claimBtn.textContent = btnText;
    }
}

function stopStreaming() {
    // Clear interval
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    // Hide overlay
    const overlay = document.getElementById('streamingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // Reset current stream
    currentStream = null;
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Prevent page navigation during streaming
window.addEventListener('beforeunload', (e) => {
    if (currentStream && progressInterval) {
        e.preventDefault();
        e.returnValue = 'You are currently streaming. Are you sure you want to leave?';
    }
});
