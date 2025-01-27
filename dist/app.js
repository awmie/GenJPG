"use strict";
class ImageGenerator {
    constructor() {
        this.apiUrl = 'http://localhost:8000/generate-image';
        this.promptInput = document.getElementById('promptInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.loadingDiv = document.getElementById('loading');
        this.resultDiv = document.getElementById('result');
        this.themeToggle = document.getElementById('themeToggle');
        this.generateBtnText = this.generateBtn.innerHTML;
        this.init();
    }
    init() {
        this.generateBtn.addEventListener('click', () => this.generateImage());
        this.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateImage();
            }
        });
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    updateThemeIcon(theme) {
        const icon = this.themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    async generateImage() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) {
            this.showError('Please enter a description for your image');
            return;
        }
        try {
            this.setLoading(true);
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });
            const data = await response.json();
            if (data.success && data.image_url) {
                this.displayImage(data.image_url);
                this.promptInput.value = '';
            }
            else {
                throw new Error(data.error || 'Failed to generate image');
            }
        }
        catch (error) {
            this.showError(error instanceof Error ? error.message : 'An error occurred');
        }
        finally {
            this.setLoading(false);
        }
    }
    setLoading(isLoading) {
        this.loadingDiv.style.display = isLoading ? 'block' : 'none';
        this.generateBtn.disabled = isLoading;
        this.promptInput.disabled = isLoading;
        this.generateBtn.innerHTML = isLoading ? '<i class="fas fa-spinner fa-spin"></i> Generating...' : this.generateBtnText;
    }
    displayImage(url) {
        this.resultDiv.innerHTML = `<img src="${url}" alt="Generated image">`;
    }
    showError(message) {
        this.resultDiv.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});
