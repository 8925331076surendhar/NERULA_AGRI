/**
 * ErrorService
 * Handles reporting of client-side errors to the Admin via LocalStorage.
 */
class ErrorService {
    static STORAGE_KEY = 'agrisense_error_reports';

    /**
     * Report an error to the system.
     * @param {string} type - Category of error (e.g., 'AI_ERROR', 'SYSTEM_ERROR', 'NETWORK_ERROR')
     * @param {string} message - Brief error message
     * @param {string} details - Detailed stack trace or context
     */
    static report(type, message, details = '') {
        try {
            const currentUser = sessionStorage.getItem('agrisense_user') || 'Guest';
            const timestamp = new Date().toISOString();
            const errorId = 'ERR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            const newError = {
                id: errorId,
                user: currentUser,
                type: type,
                message: message,
                details: details,
                timestamp: timestamp,
                read: false,
                resolved: false
            };

            // Get existing errors
            const existingErrors = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');

            // Add new error to the top
            existingErrors.unshift(newError);

            // Limit storage to last 50 errors to prevent overflow
            if (existingErrors.length > 50) {
                existingErrors.pop();
            }

            // Save back
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingErrors));

            console.error(`[ErrorService] Reported: ${type} - ${message}`, newError);

            // Optional: Show toast to user
            this.showUserToast();

        } catch (e) {
            console.error("[ErrorService] Failed to report error:", e);
        }
    }

    static showUserToast() {
        // Create a simple toast if one doesn't exist
        let toast = document.getElementById('error-toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'error-toast-notification';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 9999;
                font-family: 'Outfit', sans-serif;
                font-size: 0.9rem;
                display: none;
                animation: slideIn 0.3s ease-out;
            `;
            // Add animation keyframes
            const style = document.createElement('style');
            style.innerHTML = `@keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
            document.head.appendChild(style);
            document.body.appendChild(toast);
        }

        toast.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> &nbsp; Issue reported to Admin automatically.`;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 4000);
    }

    /**
     * Get all errors (for Admin Dashboard)
     */
    static getErrors() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    }

    /**
     * Mark an error as read/resolved
     */
    static markAsRead(errorId) {
        const errors = this.getErrors();
        const error = errors.find(e => e.id === errorId);
        if (error) {
            error.read = true;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(errors));
            return true;
        }
        return false;
    }

    static clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

// Expose globally
window.ErrorService = ErrorService;

// Global Runtime Error Handler
window.addEventListener('error', function (event) {
    if (window.ErrorService) {
        // Ignore benign errors to prevent spamming the admin
        if (event.message.includes('ResizeObserver')) return;
        if (event.message.includes('Script error')) return; // Cross-origin noise

        window.ErrorService.report(
            'RUNTIME_ERROR',
            event.message,
            `File: ${event.filename}\nLine: ${event.lineno}:${event.colno}\nError: ${event.error ? event.error.stack : 'N/A'}`
        );
    }
});
