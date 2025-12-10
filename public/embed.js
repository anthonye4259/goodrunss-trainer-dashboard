/**
 * GoodRunss Embed Widget
 * Lightweight script for embedding booking widgets on external websites
 * 
 * Usage:
 * <script src="https://yoursite.com/embed.js" data-trainer-id="TRAINER_ID" data-primary="000000"></script>
 * <div id="goodrunss-booking"></div>
 */
(function () {
    'use strict';

    // Find the script element
    const script = document.currentScript;
    const trainerId = script.getAttribute('data-trainer-id');
    const containerId = script.getAttribute('data-container') || 'goodrunss-booking';
    const primaryColor = script.getAttribute('data-primary') || '000000';
    const accentColor = script.getAttribute('data-accent') || '000000';
    const mode = script.getAttribute('data-mode') || 'inline'; // inline or popup

    if (!trainerId) {
        console.error('GoodRunss Embed: Missing data-trainer-id attribute');
        return;
    }

    // Get base URL from script src
    const scriptSrc = script.src;
    const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    const embedUrl = `${baseUrl.replace('/embed.js', '')}/embed/${trainerId}?primary=${primaryColor}&accent=${accentColor}`;

    // Wait for DOM to be ready
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    // Create iframe
    function createInlineEmbed() {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`GoodRunss Embed: Container #${containerId} not found`);
            return;
        }

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.style.cssText = `
      width: 100%;
      min-height: 600px;
      border: none;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;
        iframe.allow = 'payment';
        iframe.title = 'Book an appointment';

        // Listen for height messages from iframe
        window.addEventListener('message', function (event) {
            if (event.data && event.data.type === 'goodrunss-embed-height') {
                iframe.style.height = event.data.height + 'px';
            }
        });

        container.appendChild(iframe);
    }

    // Create popup embed
    function createPopupEmbed() {
        // Create booking button
        const button = document.createElement('button');
        button.textContent = 'Book Now';
        button.style.cssText = `
      background: #${primaryColor};
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

        button.addEventListener('click', function () {
            openPopup();
        });

        const container = document.getElementById(containerId);
        if (container) {
            container.appendChild(button);
        }
    }

    function openPopup() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

        // Create modal container
        const modal = document.createElement('div');
        modal.style.cssText = `
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
      position: relative;
    `;

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 28px;
      color: #666;
      cursor: pointer;
      z-index: 1;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    `;
        closeBtn.addEventListener('click', function () {
            document.body.removeChild(overlay);
        });

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.style.cssText = `
      width: 100%;
      height: 600px;
      border: none;
    `;
        iframe.allow = 'payment';

        // Listen for height messages
        window.addEventListener('message', function (event) {
            if (event.data && event.data.type === 'goodrunss-embed-height') {
                iframe.style.height = Math.min(event.data.height, window.innerHeight - 100) + 'px';
            }
        });

        // Close on overlay click
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });

        modal.appendChild(closeBtn);
        modal.appendChild(iframe);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // Initialize
    ready(function () {
        if (mode === 'popup') {
            createPopupEmbed();
        } else {
            createInlineEmbed();
        }
    });

    // Expose API for manual control
    window.GoodRunssEmbed = {
        open: openPopup,
        trainerId: trainerId,
        embedUrl: embedUrl
    };
})();
