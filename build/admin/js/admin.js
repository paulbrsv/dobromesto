/**
 * Admin Panel JavaScript
 */

// Toast notification system
const Toast = {
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    show: function(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;

        // Add toast to container
        toastContainer.appendChild(toast);

        // Set up close button
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        });

        // Auto-hide after duration
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toast.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            }
        }, duration);
    }
};

// Modal system
const Modal = {
    /**
     * Create a modal
     * @param {Object} options - Modal options
     * @param {string} options.title - Modal title
     * @param {string|HTMLElement} options.content - Modal content (HTML string or element)
     * @param {Array} options.buttons - Modal buttons array
     * @param {boolean} options.closable - Whether modal can be closed by clicking outside or ESC key
     * @param {Function} options.onOpen - Callback when modal opens
     * @param {Function} options.onClose - Callback when modal closes
     * @returns {Object} Modal object with open and close methods
     */
    create: function(options) {
        const defaults = {
            title: 'Modal',
            content: '',
            buttons: [
                {
                    text: 'Close',
                    type: 'secondary',
                    handler: null
                }
            ],
            closable: true,
            onOpen: null,
            onClose: null
        };

        const settings = {...defaults, ...options};

        // Create modal elements
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h3 class="modal-title">${settings.title}</h3>
            <button class="modal-close">&times;</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';
        if (typeof settings.content === 'string') {
            body.innerHTML = settings.content;
        } else {
            body.appendChild(settings.content);
        }

        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        settings.buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `btn btn-${button.type || 'secondary'}`;
            btn.textContent = button.text;

            if (button.handler) {
                btn.addEventListener('click', (e) => {
                    button.handler(e, modalObj);
                });
            } else {
                btn.addEventListener('click', () => {
                    modalObj.close();
                });
            }

            footer.appendChild(btn);
        });

        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);
        overlay.appendChild(modal);

        // Modal object with methods
        const modalObj = {
            overlay: overlay,
            modal: modal,
            open: function() {
                document.body.appendChild(overlay);
                setTimeout(() => {
                    overlay.classList.add('active');
                }, 10);

                if (settings.onOpen && typeof settings.onOpen === 'function') {
                    settings.onOpen(modalObj);
                }
            },
            close: function() {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (overlay.parentNode) {
                        document.body.removeChild(overlay);
                    }
                }, 300);

                if (settings.onClose && typeof settings.onClose === 'function') {
                    settings.onClose(modalObj);
                }
            }
        };

        // Set up close button
        const closeButton = header.querySelector('.modal-close');
        closeButton.addEventListener('click', () => {
            modalObj.close();
        });

        // Set up closable behavior if enabled
        if (settings.closable) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    modalObj.close();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && overlay.classList.contains('active')) {
                    modalObj.close();
                }
            });
        }

        return modalObj;
    }
};

// Confirmation modal
function confirmModal(message, onConfirm, onCancel = null) {
    const modal = Modal.create({
        title: 'Confirm Action',
        content: `<p>${message}</p>`,
        buttons: [
            {
                text: 'Cancel',
                type: 'light',
                handler: (e, modal) => {
                    modal.close();
                    if (onCancel && typeof onCancel === 'function') {
                        onCancel();
                    }
                }
            },
            {
                text: 'Confirm',
                type: 'danger',
                handler: (e, modal) => {
                    modal.close();
                    if (onConfirm && typeof onConfirm === 'function') {
                        onConfirm();
                    }
                }
            }
        ]
    });

    modal.open();
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Document ready helper
function documentReady(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

// AJAX helpers
const Ajax = {
    /**
     * Send a request with fetch API
     * @param {string} url - The URL to send the request to
     * @param {Object} options - Fetch options
     * @returns {Promise} - Fetch promise
     */
    request: async function(url, options = {}) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return await response.text();
        } catch (error) {
            console.error('AJAX request failed:', error);
            throw error;
        }
    },

    /**
     * Send a GET request
     * @param {string} url - The URL to send the request to
     * @param {Object} params - URL parameters
     * @returns {Promise} - Fetch promise
     */
    get: function(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        return this.request(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    /**
     * Send a POST request with JSON data
     * @param {string} url - The URL to send the request to
     * @param {Object} data - Data to send
     * @returns {Promise} - Fetch promise
     */
    post: function(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    },

    /**
     * Send form data with POST request
     * @param {string} url - The URL to send the request to
     * @param {FormData} formData - FormData object
     * @returns {Promise} - Fetch promise
     */
    postForm: function(url, formData) {
        return this.request(url, {
            method: 'POST',
            body: formData
        });
    }
};

// Set up logout confirmation
documentReady(() => {
    const logoutLink = document.querySelector('a[href="logout.php"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            confirmModal('Are you sure you want to logout?', () => {
                window.location.href = 'logout.php';
            });
        });
    }
});
