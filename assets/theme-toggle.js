// assets/theme-toggle.js

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    updateThemeIcon();
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.add('light');
    }
}

function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
        icon.innerHTML = isDark ? `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        ` : `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
        `;
    }
    // Dispatch event so charts and components can rerender if they depend on theme
    window.dispatchEvent(new Event('themeChanged'));
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Inject floating toggle button
    const btn = document.createElement('button');
    btn.onclick = toggleTheme;
    btn.id = 'theme-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle Dark Mode');
    btn.innerHTML = `<span id="theme-toggle-icon" style="display:flex;align-items:center;justify-content:center;"></span>`;
    
    // Apply styling via JS to avoid polluting stylesheets that don't need it
    btn.style.position = 'fixed';
    btn.style.bottom = '24px';
    btn.style.right = '24px';
    btn.style.width = '48px';
    btn.style.height = '48px';
    btn.style.borderRadius = '50%';
    btn.style.border = '1px solid rgba(128,128,128,0.2)';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
    btn.style.zIndex = '9999';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(btn);
    
    const style = document.createElement('style');
    style.innerHTML = `
        #theme-toggle-btn:hover { transform: scale(1.1); }
        html.dark #theme-toggle-btn { background-color: #1e293b; color: #f8fafc; }
        html.light #theme-toggle-btn { background-color: #ffffff; color: #1e293b; }
        
        /* Utility for SVG styling */
        #theme-toggle-icon svg { width: 24px; height: 24px; }
    `;
    document.head.appendChild(style);
    
    updateThemeIcon();
});

// Run once immediately to prevent flash of unstyled content
initTheme();
