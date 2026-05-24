// MockupShot Main Application Logic

class MockupShot {
    constructor() {
        this.uploadedImages = [];
        this.currentDevice = 'chrome';
        this.currentCategory = 'browsers';
        this.currentBg = 'transparent';
        this.scale = 2;
        this.showShadow = true;
        this.showFrame = true;
        this.deviceColor = 'black';

        // Device frame images — preloaded PNGs with transparent backgrounds
        // Each entry: { src, img, screen: {x, y, w, h} }  (screen coords in the PNG)
        this.deviceFrames = {
            'iphone-17': {
                src: 'images/device-frames/iphone-17.png',
                img: null,
                screen: { x: 50, y: 41, w: 1189, h: 2549 }
            },
            'iphone-17-pro': {
                src: 'images/device-frames/iphone-17-pro.png',
                img: null,
                screen: { x: 49, y: 40, w: 1192, h: 2551 }
            },
            'iphone-17-pro-max': {
                src: 'images/device-frames/iphone-17-pro-max.png',
                img: null,
                screen: { x: 52, y: 39, w: 1302, h: 2789 }
            },
            'macbook-pro-16': {
                src: 'images/device-frames/macbook-pro-16.png',
                img: null,
                screen: { x: 335, y: 14, w: 3439, h: 2327 }
            },
            'imac-24': {
                src: 'images/device-frames/iMac.png',
                img: null,
                screen: { x: 132, y: 138, w: 5771, h: 3251 }
            },
            'ipad-silver': {
                src: 'images/device-frames/iPad-Silver.png',
                img: null,
                screen: { x: 0, y: 147, w: 3255, h: 3936 }
            }
        };

        this.init();
    }

    init() {
        this.preloadDeviceFrames();
        this.setupEventListeners();
        this.setupDragDrop();
        this.setupDeviceSelector();
        this.setupBackgroundSelector();
        this.setupExportControls();
        this.updateDeviceSettingsVisibility();
    }

    preloadDeviceFrames() {
        for (const [key, frame] of Object.entries(this.deviceFrames)) {
            if (frame.src && !frame.img) {
                const img = new Image();
                img.onload = () => { frame.img = img; };
                img.src = frame.src;
            }
        }
    }

    setupEventListeners() {
        const imageInput = document.getElementById('imageInput');
        const uploadArea = document.getElementById('uploadArea');
        const downloadBtn = document.getElementById('downloadBtn');

        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        uploadArea.addEventListener('click', () => imageInput.click());
        downloadBtn.addEventListener('click', () => this.downloadImage());

        // Set up checkbox listeners
        document.getElementById('showShadow').addEventListener('change', (e) => {
            this.showShadow = e.target.checked;
            this.updatePreview();
        });

        document.getElementById('showFrame').addEventListener('change', (e) => {
            this.showFrame = e.target.checked;
            this.updatePreview();
        });
    }

    setupDragDrop() {
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFiles(files);
            }
        });
    }

    setupDeviceSelector() {
        // Setup category tabs
        const categoryTabs = document.querySelectorAll('.device-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                this.currentCategory = tab.dataset.category;

                // Show/hide device categories
                document.querySelectorAll('.device-category').forEach(cat => {
                    cat.classList.remove('active');
                    if (cat.dataset.category === this.currentCategory) {
                        cat.classList.add('active');
                    }
                });

                // Auto-select the first active device button in this category
                const activeCat = document.querySelector('.device-category.active');
                if (activeCat) {
                    const activeBtn = activeCat.querySelector('.browser-btn.active, .phone-btn.active, .laptop-btn.active, .desktop-btn.active');
                    if (activeBtn) {
                        this.currentDevice = activeBtn.dataset.device;
                    }
                }

                this.updateDeviceSettingsVisibility();
                if (this.uploadedImages.length > 0) this.updatePreview();
            });
        });

        // Setup browser buttons
        const browserBtns = document.querySelectorAll('.browser-btn');
        browserBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                browserBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDevice = btn.dataset.device;
                this.updatePreview();
            });
        });

        // Setup phone buttons
        const phoneBtns = document.querySelectorAll('.phone-btn');
        phoneBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                phoneBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDevice = btn.dataset.device;
                this.deviceColor = this.getDefaultColorForDevice(this.currentDevice);
                this.updateColorOptions();
                this.updatePreview();
            });
        });

        // Setup laptop buttons
        const laptopBtns = document.querySelectorAll('.laptop-btn');
        laptopBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                laptopBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDevice = btn.dataset.device;
                this.deviceColor = this.getDefaultColorForDevice(this.currentDevice);
                this.updateColorOptions();
                this.updatePreview();
            });
        });

        // Setup tablet buttons
        const tabletBtns = document.querySelectorAll('.tablet-btn');
        tabletBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabletBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDevice = btn.dataset.device;
                this.deviceColor = this.getDefaultColorForDevice(this.currentDevice);
                this.updateColorOptions();
                this.updatePreview();
            });
        });

        // Setup desktop buttons
        const desktopBtns = document.querySelectorAll('.desktop-btn');
        desktopBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                desktopBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDevice = btn.dataset.device;
                this.deviceColor = this.getDefaultColorForDevice(this.currentDevice);
                this.updateColorOptions();
                this.updatePreview();
            });
        });
    }

    setupBackgroundSelector() {
        const bgBtns = document.querySelectorAll('.bg-btn');
        const customBgOptions = document.getElementById('customBgOptions');
        const customColorRow = document.getElementById('customColorRow');
        const customGradientRow = document.getElementById('customGradientRow');
        const customImageRow = document.getElementById('customImageRow');

        // Stored custom background image
        this.customBgImage = null;

        // Color picker change handlers
        document.getElementById('customColorPicker').addEventListener('input', (e) => {
            if (this.currentBg === 'custom-color') this.updatePreview();
        });

        document.getElementById('customGradientFrom').addEventListener('input', (e) => {
            if (this.currentBg === 'custom-gradient') this.updatePreview();
        });

        document.getElementById('customGradientTo').addEventListener('input', (e) => {
            if (this.currentBg === 'custom-gradient') this.updatePreview();
        });

        // Custom background image upload
        document.getElementById('customBgImageInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                        this.customBgImage = img;
                        if (this.currentBg === 'custom-image') this.updatePreview();
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        bgBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                bgBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentBg = btn.dataset.bg;

                // Toggle checkerboard preview for transparent mode
                const previewContainer = document.getElementById('previewContainer');
                if (this.currentBg === 'transparent') {
                    previewContainer.classList.add('transparent-bg');
                } else {
                    previewContainer.classList.remove('transparent-bg');
                }

                // Show/hide custom background options
                const isCustom = this.currentBg === 'custom-color' || this.currentBg === 'custom-gradient' || this.currentBg === 'custom-image';
                customBgOptions.style.display = isCustom ? 'block' : 'none';
                customColorRow.style.display = this.currentBg === 'custom-color' ? 'flex' : 'none';
                customGradientRow.style.display = this.currentBg === 'custom-gradient' ? 'flex' : 'none';
                customImageRow.style.display = this.currentBg === 'custom-image' ? 'flex' : 'none';

                this.updatePreview();
            });
        });
    }

    setupExportControls() {
        const scaleSelect = document.getElementById('scaleSelect');
        scaleSelect.addEventListener('change', (e) => {
            this.scale = parseInt(e.target.value);
            // Bug fix 1: Scale change should trigger re-render
            if (this.uploadedImages.length > 0) this.updatePreview();
        });
    }

    getDefaultColorForDevice(device) {
        // Phones with real PNG frames don't need deviceColor selection
        // Laptops/desktops still use Canvas rendering and need colors
        const colorMap = {
            'macbook-pro-16': 'silver',
            'imac-24': 'blue'
        };
        return colorMap[device] || 'default';
    }

    getDeviceColors(device) {
        // Only return colors for Canvas-drawn devices (laptop/desktop)
        // Phone devices use real PNG frames, color is baked into the image
        const colors = {
            'macbook-pro-16': [
                { name: 'silver', value: '#e8e8ed' },
                { name: 'space-gray', value: '#55555a' },
                { name: 'black', value: '#1d1d1f' }
            ],
            'imac-24': [
                { name: 'blue', value: '#2176ff' },
                { name: 'green', value: '#54c08a' },
                { name: 'pink', value: '#fa8072' },
                { name: 'silver', value: '#e8e8ed' },
                { name: 'yellow', value: '#f5c542' },
                { name: 'orange', value: '#ff8c42' },
                { name: 'purple', value: '#af6ee8' }
            ]
        };
        return colors[device] || [];
    }

    updateColorOptions() {
        const colorContainer = document.getElementById('colorOptions');
        const colors = this.getDeviceColors(this.currentDevice);

        colorContainer.innerHTML = '';

        colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'color-btn';
            btn.style.backgroundColor = color.value;
            btn.title = color.name;
            btn.dataset.color = color.name;

            if (color.name === this.deviceColor) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.deviceColor = color.name;
                this.updatePreview();
            });

            colorContainer.appendChild(btn);
        });
    }

    updateDeviceSettingsVisibility() {
        const showFrameContainer = document.getElementById('showFrameContainer');
        const colorSelectorContainer = document.getElementById('colorSelectorContainer');

        if (this.currentCategory === 'phones' || this.currentCategory === 'tablets' ||
            this.currentCategory === 'laptops' || this.currentCategory === 'desktop' ||
            this.currentCategory === 'browsers') {
            // All device categories support frame toggle
            showFrameContainer.style.display = 'flex';
            // Color picker only shown for categories that need it (none currently, all use PNG)
            colorSelectorContainer.style.display = 'none';
        } else {
            showFrameContainer.style.display = 'none';
            colorSelectorContainer.style.display = 'none';
        }
    }

    handleImageUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.processFiles(files);
        }
    }

    processFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        this.uploadedImages = [img]; // Keep only the last uploaded image
                        this.updatePreview();
                        this.enableDownload();
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    enableDownload() {
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.disabled = false;
    }

    async updatePreview() {
        if (this.uploadedImages.length === 0) return;

        const canvas = document.getElementById('previewCanvas');
        const ctx = canvas.getContext('2d');
        const img = this.uploadedImages[0];

        // Clear previous state
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Route to appropriate renderer based on device type
        if (this.currentCategory === 'browsers') {
            this.renderBrowserPreview(ctx, img);
        } else if (this.currentCategory === 'phones' || this.currentCategory === 'tablets' ||
                   this.currentCategory === 'laptops' || this.currentCategory === 'desktop') {
            this.renderPngFrameDevice(ctx, img, this.deviceFrames[this.currentDevice]);
        }

        // Show canvas
        canvas.style.display = 'block';
        document.querySelector('.preview-placeholder').style.display = 'none';
    }

    renderBrowserPreview(ctx, img) {
        const padding = 60;
        const frameHeight = 40;
        const maxWidth = Math.min(img.width, 1200);
        const scale = Math.min(1, maxWidth / img.width);

        const displayWidth = img.width * scale;
        const displayHeight = img.height * scale;

        const canvas = ctx.canvas;
        canvas.width = (displayWidth + padding * 2) * this.scale;
        canvas.height = (displayHeight + frameHeight + padding * 2) * this.scale;

        ctx.scale(this.scale, this.scale);

        // Draw background
        this.drawBackground(ctx, displayWidth + padding * 2, displayHeight + frameHeight + padding * 2);

        // Draw shadow
        if (this.showShadow) {
            this.drawShadow(ctx, padding, padding, displayWidth, displayHeight + frameHeight);
        }

        // Draw browser frame (only if showFrame is enabled)
        if (this.showFrame) {
            this.drawBrowserFrame(ctx, padding, padding, displayWidth, displayHeight, frameHeight);
        }

        // Draw screenshot
        this.drawImage(ctx, img, padding, padding + frameHeight, displayWidth, displayHeight);
    }

    renderPngFrameDevice(ctx, img, frame) {
        const frameImg = frame.img;
        const scr = frame.screen;
        const padding = 80;

        // Calculate display size — scale the PNG frame to fit nicely
        // Use the frame image's natural size, scaled to a reasonable display height
        const maxDisplayHeight = 700;
        const displayScale = maxDisplayHeight / frameImg.height;
        const displayW = Math.round(frameImg.width * displayScale);
        const displayH = maxDisplayHeight;

        // Screen rect in display coordinates
        const screenX = scr.x * displayScale;
        const screenY = scr.y * displayScale;
        const screenW = scr.w * displayScale;
        const screenH = scr.h * displayScale;

        const canvasW = displayW + padding * 2;
        const canvasH = displayH + padding * 2;

        const canvas = ctx.canvas;
        canvas.width = canvasW * this.scale;
        canvas.height = canvasH * this.scale;
        ctx.scale(this.scale, this.scale);

        // Draw background
        this.drawBackground(ctx, canvasW, canvasH);

        if (this.showFrame) {
            // Draw shadow behind device
            if (this.showShadow) {
                this.drawShadow(ctx, padding, padding, displayW, displayH);
            }

            // Step 1: Draw user screenshot into screen area (clipped)
            if (img) {
                const imgAspect = img.width / img.height;
                const screenAspect = screenW / screenH;

                let drawW, drawH, drawX, drawY;
                if (imgAspect > screenAspect) {
                    drawW = screenW;
                    drawH = screenW / imgAspect;
                    drawX = padding + screenX;
                    drawY = padding + screenY + (screenH - drawH) / 2;
                } else {
                    drawH = screenH;
                    drawW = screenH * imgAspect;
                    drawX = padding + screenX + (screenW - drawW) / 2;
                    drawY = padding + screenY;
                }

                ctx.save();
                ctx.beginPath();
                // Clip to the screen rectangle with rounded corners
                const clipR = 10 * displayScale;
                this.roundRect(ctx, padding + screenX, padding + screenY, screenW, screenH, clipR);
                ctx.clip();
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Step 2: Overlay the device frame PNG on top
            ctx.drawImage(frameImg, padding, padding, displayW, displayH);
        } else {
            // No frame — just show the screenshot
            if (img) {
                const imgAspect = img.width / img.height;
                const maxW = displayW - 40;
                const maxH = displayH - 40;
                let drawW, drawH;
                if (imgAspect > maxW / maxH) {
                    drawW = maxW;
                    drawH = maxW / imgAspect;
                } else {
                    drawH = maxH;
                    drawW = maxH * imgAspect;
                }
                ctx.drawImage(img, padding + (displayW - drawW) / 2, padding + (displayH - drawH) / 2, drawW, drawH);
            }
        }
    }

    drawBackground(ctx, width, height) {
        // Transparent = skip drawing entirely (Canvas default is transparent)
        if (this.currentBg === 'transparent') return;

        // Custom solid color
        if (this.currentBg === 'custom-color') {
            const color = document.getElementById('customColorPicker').value || '#667eea';
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, width, height);
            return;
        }

        // Custom gradient
        if (this.currentBg === 'custom-gradient') {
            const from = document.getElementById('customGradientFrom').value || '#ff6b6b';
            const to = document.getElementById('customGradientTo').value || '#c084fc';
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, from);
            gradient.addColorStop(1, to);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            return;
        }

        // Custom background image
        if (this.currentBg === 'custom-image' && this.customBgImage) {
            ctx.save();
            ctx.drawImage(this.customBgImage, 0, 0, width, height);
            ctx.restore();
            return;
        }

        const gradients = {
            gradient: ['#667eea', '#764ba2'],
            blue: ['#4facfe', '#00f2fe'],
            green: ['#43e97b', '#38f9d7'],
            solid: ['#f3f4f6', '#f3f4f6']
        };

        const colors = gradients[this.currentBg] || gradients.gradient;
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    drawShadow(ctx, x, y, width, height) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 15;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
        ctx.fillRect(x, y, width, height);
        ctx.restore();
        // Bug fix 3: Actually draw a visible rect with shadow
    }

    drawBrowserFrame(ctx, x, y, width, height, frameHeight) {
        const radius = 12;

        if (this.currentDevice === 'safari') {
            // Safari-style frame: rounded-top toolbar with URL bar, no window border
            this.drawSafariFrame(ctx, x, y, width, height, frameHeight);
            return;
        }

        // Draw window background
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'transparent';
        this.roundRect(ctx, x, y, width, height + frameHeight, radius);
        ctx.fill();

        // Draw window control buttons
        this.drawWindowControls(ctx, x + 16, y + 16);

        // Draw window border
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        this.roundRect(ctx, x, y, width, height + frameHeight, radius);
        ctx.stroke();

        // Draw content area border
        ctx.beginPath();
        ctx.moveTo(x + 1, y + frameHeight);
        ctx.lineTo(x + width - 1, y + frameHeight);
        ctx.stroke();
    }

    drawSafariFrame(ctx, x, y, width, height, frameHeight) {
        // Safari has a distinctive rounded toolbar with unified URL bar
        const radius = 12;

        // Draw Safari window body
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'transparent';
        this.roundRect(ctx, x, y, width, height + frameHeight, radius);
        ctx.fill();

        // Window border
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        this.roundRect(ctx, x, y, width, height + frameHeight, radius);
        ctx.stroke();

        // Draw window control buttons
        this.drawWindowControls(ctx, x + 16, y + 16);

        // Safari-style smart search bar (pill-shaped URL bar)
        const urlBarY = y + 14;
        const urlBarH = 26;
        const urlBarPadding = 100;  // leave space for controls
        const urlBarW = width - urlBarPadding - 14;
        const urlBarX = x + urlBarPadding;

        ctx.fillStyle = '#f2f2f7';
        this.roundRect(ctx, urlBarX, urlBarY, urlBarW, urlBarH, 13);
        ctx.fill();

        // URL text
        ctx.fillStyle = '#8e8e93';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('mockupshot.online', urlBarX + 14, urlBarY + urlBarH / 2);

        // Separator line below toolbar
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 1, y + frameHeight);
        ctx.lineTo(x + width - 1, y + frameHeight);
        ctx.stroke();
    }

    drawWindowControls(ctx, x, y) {
        const buttonSize = 12;
        const gap = 8;

        if (this.currentDevice === 'safari') {
            // Safari-style controls: slightly larger, more spacing
            const safariColors = ['#ff5f57', '#ffbd2e', '#28c940'];
            safariColors.forEach((color, index) => {
                ctx.beginPath();
                ctx.arc(x + index * (buttonSize + gap), y, buttonSize / 2, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });
            return;
        }

        const colors = {
            chrome: ['#ff5f57', '#ffbd2e', '#28c940'],
            firefox: ['#ff5f57', '#ffbd2e', '#28c940'],
            edge: ['#ff5f57', '#ffbd2e', '#28c940']
        };

        const deviceColors = colors[this.currentDevice] || colors.chrome;
        deviceColors.forEach((color, index) => {
            ctx.beginPath();
            ctx.arc(x + index * (buttonSize + gap), y, buttonSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });
    }

    drawImage(ctx, img, x, y, width, height) {
        ctx.drawImage(img, x, y, width, height);
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    downloadImage() {
        const canvas = document.getElementById('previewCanvas');

        // Create download link
        const link = document.createElement('a');
        link.download = `mockupshot-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Show success toast
        this.showToast('Image downloaded successfully!');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10B981;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    new MockupShot();
});


// Theme Toggle
(function() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    
    const stored = localStorage.getItem('mockupshot_theme');
    if (stored) {
        document.documentElement.setAttribute('data-theme', stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('mockupshot_theme', 'dark');
    }
    
    toggle.addEventListener('click', function() {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('mockupshot_theme', next);
    });
})();
