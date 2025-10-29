/**
 * Affluence Admin Panel - Mobile Enhancement Script
 * This script adds additional mobile-specific functionality to the admin panel
 * beyond the basic responsive CSS.
 */

// Main initialization function for mobile enhancements
function initMobileEnhancements() {
    console.log('Initializing mobile enhancements...');
    
    // Add features when on mobile
    if (isMobileView()) {
        setupTableResponsiveness();
        enhanceFormFields();
        setupPullToRefresh();
        addDataSavingOptions();
        setupOfflineIndicator();
    }
    
    // Features that run regardless of screen size
    setupOrientationHandling();
    registerSwipeEvents();
    setupMobileBackButton();
    
    console.log('Mobile enhancements initialized');
}

// Helper to check if current view is mobile-sized
function isMobileView() {
    return window.matchMedia('(max-width: 768px)').matches;
}

/**
 * Makes tables more responsive by allowing horizontal scrolling
 * and adding data attributes for identifying columns on small screens
 */
function setupTableResponsiveness() {
    const tables = document.querySelectorAll('.table-container:not(.enhanced)');
    
    tables.forEach(tableContainer => {
        // Mark as enhanced to prevent duplicate processing
        tableContainer.classList.add('enhanced');
        
        const table = tableContainer.querySelector('table');
        if (!table) return;
        
        // Add horizontal scrolling wrapper if not already present
        if (!tableContainer.querySelector('.table-scroll')) {
            const scrollWrapper = document.createElement('div');
            scrollWrapper.className = 'table-scroll';
            
            // Move the table inside the scroll wrapper
            tableContainer.appendChild(scrollWrapper);
            scrollWrapper.appendChild(table);
        }
        
        // Add data attributes to each cell based on column headers
        const headerCells = Array.from(table.querySelectorAll('thead th'));
        const headerLabels = headerCells.map(th => th.textContent.trim());
        
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headerLabels[index]) {
                    cell.setAttribute('data-label', headerLabels[index]);
                }
            });
        });
        
        console.log(`Enhanced table with ${rows.length} rows for mobile view`);
    });
}

/**
 * Enhances form fields for mobile with larger touch targets
 * and better input handling
 */
function enhanceFormFields() {
    // Enhance select dropdowns
    document.querySelectorAll('select:not(.mobile-enhanced)').forEach(select => {
        select.classList.add('mobile-enhanced');
        select.style.height = '42px'; // Larger touch target
    });
    
    // Enhance input fields
    document.querySelectorAll('input[type="text"]:not(.mobile-enhanced), input[type="number"]:not(.mobile-enhanced)').forEach(input => {
        input.classList.add('mobile-enhanced');
        
        // Add input type for better mobile keyboard
        if (input.classList.contains('currency-input') && input.type !== 'number') {
            input.type = 'number';
            input.step = '0.01';
        }
        
        // Auto-zoom prevention for iOS
        if (input.type === 'text' || input.type === 'email') {
            input.style.fontSize = '16px'; // Prevents auto-zoom on iOS
        }
    });
    
    // Add date pickers where needed
    document.querySelectorAll('input.date-input:not(.mobile-enhanced)').forEach(input => {
        input.classList.add('mobile-enhanced');
        input.type = 'date'; // Use native date picker on mobile
    });
    
    console.log('Form fields enhanced for mobile');
}

/**
 * Implements pull-to-refresh functionality for mobile devices
 */
function setupPullToRefresh() {
    let touchStartY = 0;
    let touchEndY = 0;
    const minSwipeDistance = 80;
    let isRefreshing = false;
    
    document.addEventListener('touchstart', function(event) {
        touchStartY = event.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(event) {
        if (isRefreshing) return;
        
        // Only enable pull-to-refresh at top of page
        if (window.scrollY === 0) {
            touchEndY = event.touches[0].clientY;
            const distance = touchEndY - touchStartY;
            
            if (distance > 30 && distance < 150) {
                // Create or update pull indicator
                let indicator = document.getElementById('pull-to-refresh-indicator');
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.id = 'pull-to-refresh-indicator';
                    indicator.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: ${distance}px;
                        background: rgba(59, 130, 246, 0.2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                    `;
                    indicator.innerHTML = '<div>Pull down to refresh</div>';
                    document.body.appendChild(indicator);
                } else {
                    indicator.style.height = `${distance}px`;
                    
                    // Change message when pulled far enough
                    if (distance > minSwipeDistance) {
                        indicator.innerHTML = '<div>Release to refresh</div>';
                    } else {
                        indicator.innerHTML = '<div>Pull down to refresh</div>';
                    }
                }
            }
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function() {
        if (isRefreshing) return;
        
        const distance = touchEndY - touchStartY;
        const indicator = document.getElementById('pull-to-refresh-indicator');
        
        if (indicator) {
            indicator.remove();
            
            // If pulled far enough, refresh the page
            if (distance > minSwipeDistance && window.scrollY === 0) {
                isRefreshing = true;
                showToast('Refreshing...', 'info');
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        }
        
        touchStartY = 0;
        touchEndY = 0;
    }, { passive: true });
    
    console.log('Pull-to-refresh initialized');
}

/**
 * Adds data saving options for mobile users with limited data plans
 */
function addDataSavingOptions() {
    // Check if data saving mode is enabled in localStorage
    const dataSavingEnabled = localStorage.getItem('affluence_data_saving_mode') === 'true';
    
    // Create data saving toggle in profile/settings menu if it exists
    const settingsMenu = document.querySelector('.user-dropdown-menu, .settings-menu');
    if (settingsMenu) {
        const dataSavingOption = document.createElement('div');
        dataSavingOption.className = 'dropdown-item data-saving-toggle';
        dataSavingOption.innerHTML = `
            <label class="toggle-switch">
                <input type="checkbox" ${dataSavingEnabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
                Data Saving Mode
            </label>
        `;
        
        // Add the option to the menu
        settingsMenu.appendChild(dataSavingOption);
        
        // Handle toggle changes
        const checkbox = dataSavingOption.querySelector('input');
        checkbox.addEventListener('change', function() {
            localStorage.setItem('affluence_data_saving_mode', this.checked);
            showToast(`Data saving mode ${this.checked ? 'enabled' : 'disabled'}`, 'info');
            
            // Apply data saving mode immediately
            applyDataSavingMode(this.checked);
        });
        
        // Apply current setting
        applyDataSavingMode(dataSavingEnabled);
    }
    
    console.log('Data saving options added');
}

/**
 * Applies data saving mode settings
 */
function applyDataSavingMode(enabled) {
    // Modify page behavior based on data saving preference
    if (enabled) {
        // Reduce image quality
        document.querySelectorAll('img').forEach(img => {
            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src;
                
                // Replace with lower quality version if available
                if (img.src.includes('high-res')) {
                    img.src = img.src.replace('high-res', 'low-res');
                }
            }
        });
        
        // Disable auto-refresh features
        window.AFFLUENCE_DISABLE_AUTO_REFRESH = true;
    } else {
        // Restore original images
        document.querySelectorAll('img[data-original-src]').forEach(img => {
            img.src = img.dataset.originalSrc;
        });
        
        // Re-enable auto-refresh
        window.AFFLUENCE_DISABLE_AUTO_REFRESH = false;
    }
}

/**
 * Sets up an indicator that shows when the device is offline
 */
function setupOfflineIndicator() {
    const updateOnlineStatus = () => {
        let offlineIndicator = document.getElementById('offline-indicator');
        
        if (!navigator.onLine) {
            // Create indicator if it doesn't exist
            if (!offlineIndicator) {
                offlineIndicator = document.createElement('div');
                offlineIndicator.id = 'offline-indicator';
                offlineIndicator.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: #ef4444;
                    color: white;
                    padding: 8px;
                    text-align: center;
                    z-index: 9999;
                `;
                offlineIndicator.textContent = 'You are currently offline. Some features may be unavailable.';
                document.body.appendChild(offlineIndicator);
            }
        } else if (offlineIndicator) {
            // Remove indicator if online
            offlineIndicator.remove();
            showToast('You are back online', 'success');
        }
    };
    
    // Initial check
    updateOnlineStatus();
    
    // Listen for changes
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    console.log('Offline indicator initialized');
}

/**
 * Handles device orientation changes
 */
function setupOrientationHandling() {
    const handleOrientationChange = () => {
        // Get current orientation
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;
        
        // Add class to body for CSS targeting
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);
        
        // Adjust tables and layouts
        if (isLandscape && isMobileView()) {
            // Optimize landscape view on mobile
            document.querySelectorAll('.card-grid').forEach(grid => {
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            });
        }
    };
    
    // Initial check
    handleOrientationChange();
    
    // Listen for changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.matchMedia('(orientation: landscape)').addEventListener('change', handleOrientationChange);
    
    console.log('Orientation handling initialized');
}

/**
 * Registers swipe events for mobile navigation
 */
function registerSwipeEvents() {
    let touchStartX = 0;
    let touchEndX = 0;
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    document.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
    }, { passive: true });
    
    document.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].clientX;
        handleSwipeGesture();
    }, { passive: true });
    
    function handleSwipeGesture() {
        const swipeDistance = touchEndX - touchStartX;
        
        // Detect right swipe (open menu)
        if (swipeDistance > 100 && touchStartX < 30) {
            if (sidebar && !sidebar.classList.contains('active')) {
                sidebar.classList.add('active');
                if (mobileOverlay) mobileOverlay.classList.add('active');
            }
        }
        
        // Detect left swipe (close menu)
        if (swipeDistance < -50 && sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            if (mobileOverlay) mobileOverlay.classList.remove('active');
        }
    }
    
    console.log('Swipe events registered');
}

/**
 * Adds back button functionality for deep pages on mobile
 */
function setupMobileBackButton() {
    // Only add if we're not on a top-level page
    const isTopLevelPage = [
        'admin-dashboard.html',
        'admin-login.html'
    ].some(page => window.location.pathname.endsWith(page));
    
    if (!isTopLevelPage && isMobileView()) {
        const header = document.querySelector('.content-header h1');
        if (header) {
            // Create back button
            const backButton = document.createElement('button');
            backButton.className = 'mobile-back-btn';
            backButton.innerHTML = '&larr;';
            backButton.style.cssText = `
                margin-right: 10px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-dark);
            `;
            
            // Insert before header text
            header.parentNode.insertBefore(backButton, header);
            
            // Set click handler
            backButton.addEventListener('click', () => {
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // Fallback to dashboard if history is empty
                    window.location.href = 'admin-dashboard.html';
                }
            });
        }
    }
    
    console.log('Mobile back button setup complete');
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initMobileEnhancements);

// Re-initialize on window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        if (isMobileView()) {
            setupTableResponsiveness();
            enhanceFormFields();
        }
    }, 250);
});