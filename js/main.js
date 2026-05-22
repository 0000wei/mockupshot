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

        if (this.currentCategory === 'phones' || this.currentCategory === 'tablets') {
            // Phones/Tablets use real PNG frames — show frame toggle, hide color picker
            showFrameContainer.style.display = 'flex';
            colorSelectorContainer.style.display = 'none';
        } else if (this.currentCategory === 'laptops' || this.currentCategory === 'desktop') {
            // Canvas-drawn devices — show both frame toggle and color picker
            showFrameContainer.style.display = 'flex';
            colorSelectorContainer.style.display = 'block';
            this.updateColorOptions();
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
        } else if (this.currentCategory === 'phones') {
            this.renderPhonePreview(ctx, img);
        } else if (this.currentCategory === 'tablets') {
            this.renderPhonePreview(ctx, img);
        } else if (this.currentCategory === 'laptops') {
            const frame = this.deviceFrames[this.currentDevice];
            if (frame && frame.img && frame.screen) {
                this.renderPngFrameDevice(ctx, img, frame);
            } else {
                this.renderLaptopPreview(ctx, img);
            }
        } else if (this.currentCategory === 'desktop') {
            const frame = this.deviceFrames[this.currentDevice];
            if (frame && frame.img && frame.screen) {
                this.renderPngFrameDevice(ctx, img, frame);
            } else {
                this.renderDesktopPreview(ctx, img);
            }
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

        // Draw browser frame
        this.drawBrowserFrame(ctx, padding, padding, displayWidth, displayHeight, frameHeight);

        // Draw screenshot
        this.drawImage(ctx, img, padding, padding + frameHeight, displayWidth, displayHeight);
    }

    renderPhonePreview(ctx, img) {
        const frame = this.deviceFrames[this.currentDevice];

        // If we have a real PNG frame, use it
        if (frame && frame.img && frame.screen) {
            this.renderPngFrameDevice(ctx, img, frame);
        } else {
            // Fallback: old Canvas-drawn phone
            this.renderCanvasPhone(ctx, img);
        }
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

    renderCanvasPhone(ctx, img) {
        const padding = 80;
        const phoneHeight = 700;
        const phoneAspectRatio = 0.48;
        const phoneWidth = phoneHeight * phoneAspectRatio;

        const canvas = ctx.canvas;
        canvas.width = (phoneWidth + padding * 2) * this.scale;
        canvas.height = (phoneHeight + padding * 2) * this.scale;

        ctx.scale(this.scale, this.scale);

        // Draw background
        this.drawBackground(ctx, phoneWidth + padding * 2, phoneHeight + padding * 2);

        // Draw phone frame
        this.drawPhoneFrame(ctx, padding, padding, phoneWidth, phoneHeight, img);
    }

    renderComingSoonPreview(ctx) {
        const canvas = ctx.canvas;
        canvas.width = 800 * this.scale;
        canvas.height = 600 * this.scale;

        ctx.scale(this.scale, this.scale);

        // Draw background
        this.drawBackground(ctx, 800, 600);

        // Draw coming soon message
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Coming Soon', 400, 280);

        ctx.fillStyle = '#6b7280';
        ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('This device category is not yet available', 400, 320);
    }

    renderLaptopPreview(ctx, img) {
        const padding = 80;
        const lidHeight = 380;     // Lid (screen portion)
        const baseHeight = 80;      // Keyboard base
        const lidWidth = lidHeight * 1.6; // 16:10 screen ratio
        const frameBezel = 18;       // Screen bezel thickness

        const fullWidth = lidWidth + padding * 2;
        const fullHeight = lidHeight + baseHeight + padding * 2 + 40;

        const canvas = ctx.canvas;
        canvas.width = fullWidth * this.scale;
        canvas.height = fullHeight * this.scale;

        ctx.scale(this.scale, this.scale);

        // Draw background
        this.drawBackground(ctx, fullWidth, fullHeight);

        // Draw shadow
        if (this.showShadow) {
            this.drawShadow(ctx, padding, padding, lidWidth, lidHeight + baseHeight + 20);
        }

        if (this.showFrame) {
            // Draw laptop base (keyboard deck)
            const baseX = padding + lidWidth * 0.05;
            const baseY = padding + lidHeight + 10;
            const baseW = lidWidth * 0.9;
            const baseH = baseHeight;

            // Base bottom surface (dark gray)
            ctx.fillStyle = '#2c2c2e';
            this.roundRect(ctx, baseX, baseY, baseW, baseH, 8);
            ctx.fill();

            // Base top surface (keyboard deck)
            const deckY = baseY - 3;
            const deckH = baseHeight * 0.35;
            ctx.fillStyle = '#3d3d40';
            this.roundRect(ctx, baseX + 10, deckY, baseW - 20, deckH, 4);
            ctx.fill();

            // Keyboard keys (simplified as rows of small rects)
            ctx.fillStyle = '#1c1c1e';
            const keyRows = 4;
            const keysPerRow = 12;
            const keyboardLeft = baseX + baseW * 0.12;
            const keyboardWidth = baseW * 0.76;
            const keyboardTop = deckY + 8;
            const keyboardHeight = deckH - 16;
            const keyGapX = 3;
            const keyGapY = 3;
            const keyW = (keyboardWidth - keyGapX * (keysPerRow - 1)) / keysPerRow;
            const keyH = (keyboardHeight - keyGapY * (keyRows - 1)) / keyRows;

            for (let row = 0; row < keyRows; row++) {
                const numKeys = row === keyRows - 1 ? keysPerRow - 3 : keysPerRow; // space bar gap
                const offsetKeys = keysPerRow - numKeys;
                for (let k = 0; k < numKeys; k++) {
                    const kx = keyboardLeft + (k + offsetKeys * 0.5) * (keyW + keyGapX);
                    const ky = keyboardTop + row * (keyH + keyGapY);
                    ctx.fillRect(kx, ky, row === keyRows - 1 && k === numKeys - 4 ? keyW * 3 : keyW, keyH);
                }
            }

            // Trackpad
            const trackpadW = 80;
            const trackpadH = 30;
            const trackpadX = baseX + (baseW - trackpadW) / 2;
            const trackpadY = baseY + baseH - trackpadH - 8;
            ctx.fillStyle = '#4a4a4d';
            this.roundRect(ctx, trackpadX, trackpadY, trackpadW, trackpadH, 4);
            ctx.fill();

            // Draw lid (screen bezel)
            const bezelColor = this.getDeviceColors(this.currentDevice).find(c => c.name === this.deviceColor)?.value || '#e8e8ed';
            ctx.fillStyle = bezelColor;
            this.roundRect(ctx, padding, padding, lidWidth, lidHeight, 12);
            ctx.fill();

            // Screen area (the actual display)
            const screenX = padding + frameBezel;
            const screenY = padding + frameBezel;
            const screenW = lidWidth - frameBezel * 2;
            const screenH = lidHeight - frameBezel * 2;

            ctx.fillStyle = '#000000';
            this.roundRect(ctx, screenX, screenY, screenW, screenH, 6);
            ctx.fill();

            // Draw screenshot inside screen
            if (img) {
                const imgAspect = img.width / img.height;
                const screenAspect = screenW / screenH;
                let drawW, drawH, drawX, drawY;

                if (imgAspect > screenAspect) {
                    drawW = screenW;
                    drawH = screenW / imgAspect;
                    drawX = screenX;
                    drawY = screenY + (screenH - drawH) / 2;
                } else {
                    drawH = screenH;
                    drawW = screenH * imgAspect;
                    drawX = screenX + (screenW - drawW) / 2;
                    drawY = screenY;
                }

                ctx.save();
                this.roundRect(ctx, screenX, screenY, screenW, screenH, 6);
                ctx.clip();
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Lid bottom hinge highlight
            ctx.fillStyle = '#1a1a1c';
            ctx.fillRect(padding + lidWidth * 0.3, padding + lidHeight - 4, lidWidth * 0.4, 4);
        } else {
            // No frame — just show the image centered
            if (img) {
                const imgW = Math.min(img.width, lidWidth - 60);
                const imgH = imgW / (img.width / img.height);
                const imgX = padding + (lidWidth - imgW) / 2;
                const imgY = padding + (lidHeight - imgH) / 2;
                ctx.drawImage(img, imgX, imgY, imgW, imgH);
            }
        }
    }

    renderDesktopPreview(ctx, img) {
        const padding = 90;
        const screenWidth = 500;
        const screenHeight = 320;  // ~16:10
        const standNeckH = 60;
        const standBaseW = 180;
        const standBaseH = 18;
        const bezel = 16;

        const fullWidth = screenWidth + padding * 2;
        const fullHeight = screenHeight + standNeckH + standBaseH + padding * 2 + 30;

        const canvas = ctx.canvas;
        canvas.width = fullWidth * this.scale;
        canvas.height = fullHeight * this.scale;

        ctx.scale(this.scale, this.scale);

        // Draw background
        this.drawBackground(ctx, fullWidth, fullHeight);

        // Draw shadow for the whole iMac
        if (this.showShadow) {
            this.drawShadow(ctx, padding, padding - 10, screenWidth, screenHeight + standNeckH + standBaseH + 20);
        }

        if (this.showFrame) {
            // Draw stand base
            const baseX = padding + (screenWidth - standBaseW) / 2;
            const baseY = padding + screenHeight + standNeckH;
            ctx.fillStyle = '#1a1a1c';
            this.roundRect(ctx, baseX, baseY, standBaseW, standBaseH, 4);
            ctx.fill();

            // Draw stand neck
            const neckW = 20;
            const neckX = padding + (screenWidth - neckW) / 2;
            const neckY = padding + screenHeight;
            ctx.fillStyle = '#2c2c2e';
            ctx.fillRect(neckX, neckY, neckW, standNeckH);

            // Draw chin (iMac chin below screen)
            const chinH = 20;
            const chinY = padding + screenHeight - chinH;
            const bezelColor = this.getDeviceColors(this.currentDevice).find(c => c.name === this.deviceColor)?.value || '#2176ff';

            // Main screen bezel
            ctx.fillStyle = '#1a1a1c';
            this.roundRect(ctx, padding, padding, screenWidth, screenHeight, 10);
            ctx.fill();

            // Color accent on chin
            ctx.fillStyle = bezelColor;
            ctx.fillRect(padding + 2, chinY, screenWidth - 4, chinH);

            // Screen area
            const screenX = padding + bezel;
            const screenY = padding + 10;
            const screenW = screenWidth - bezel * 2;
            const screenH = screenHeight - bezel - 10;

            ctx.fillStyle = '#000000';
            this.roundRect(ctx, screenX, screenY, screenW, screenH, 4);
            ctx.fill();

            // Draw screenshot inside screen
            if (img) {
                const imgAspect = img.width / img.height;
                const screenAspect = screenW / screenH;
                let drawW, drawH, drawX, drawY;

                if (imgAspect > screenAspect) {
                    drawW = screenW;
                    drawH = screenW / imgAspect;
                    drawX = screenX;
                    drawY = screenY + (screenH - drawH) / 2;
                } else {
                    drawH = screenH;
                    drawW = screenH * imgAspect;
                    drawX = screenX + (screenW - drawW) / 2;
                    drawY = screenY;
                }

                ctx.save();
                this.roundRect(ctx, screenX, screenY, screenW, screenH, 4);
                ctx.clip();
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Power LED on chin
            ctx.fillStyle = '#30d158';
            ctx.beginPath();
            ctx.arc(padding + screenWidth / 2, chinY + chinH / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // No frame — just show the image centered
            if (img) {
                const imgW = Math.min(img.width, screenWidth - 40);
                const imgH = imgW / (img.width / img.height);
                const imgX = padding + (screenWidth - imgW) / 2;
                const imgY = padding + (screenHeight - imgH) / 2;
                ctx.drawImage(img, imgX, imgY, imgW, imgH);
            }
        }
    }

    drawBackground(ctx, width, height) {
        // Transparent = skip drawing entirely (Canvas default is transparent)
        if (this.currentBg === 'transparent') return;

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

        // Draw window background
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'transparent';        // Reset shadow
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

    drawWindowControls(ctx, x, y) {
        const buttonColors = {
            chrome: ['#ff5f57', '#ffbd2e', '#28c940'],
            safari: ['#ff5f57', '#ffbd2e', '#28c940'],
            firefox: ['#ff5f57', '#ffbd2e', '#28c940'],
            edge: ['#ff5f57', '#ffbd2e', '#28c940']
        };

        const colors = buttonColors[this.currentDevice] || buttonColors.chrome;
        const buttonSize = 12;
        const gap = 8;

        colors.forEach((color, index) => {
            ctx.beginPath();
            ctx.arc(x + index * (buttonSize + gap), y, buttonSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });
    }

    drawImage(ctx, img, x, y, width, height) {
        ctx.drawImage(img, x, y, width, height);
    }

    drawPhoneFrame(ctx, x, y, width, height, img) {
        const colors = this.getDeviceColors(this.currentDevice);
        const frameColor = colors.find(c => c.name === this.deviceColor)?.value || '#1d1d1f';

        // Draw shadow
        if (this.showShadow) {
            this.drawShadow(ctx, x, y, width, height);
        }

        // Draw phone frame
        if (this.showFrame) {
            ctx.fillStyle = frameColor;
            this.roundRect(ctx, x, y, width, height, 40);
            ctx.fill();

            // Draw screen area
            const screenMargin = 15;
            const screenX = x + screenMargin;
            const screenY = y + screenMargin;
            const screenWidth = width - screenMargin * 2;
            const screenHeight = height - screenMargin * 2;

            ctx.fillStyle = '#000000';
            this.roundRect(ctx, screenX, screenY, screenWidth, screenHeight, 30);
            ctx.fill();

            // Draw phone-specific features
            this.drawPhoneFeatures(ctx, screenX, screenY, screenWidth, screenHeight);

            // Draw user image inside screen
            if (img) {
                const imgAspectRatio = img.width / img.height;
                const screenAspectRatio = screenWidth / screenHeight;

                let drawWidth, drawHeight, drawX, drawY;

                if (imgAspectRatio > screenAspectRatio) {
                    drawWidth = screenWidth;
                    drawHeight = screenWidth / imgAspectRatio;
                    drawX = screenX;
                    drawY = screenY + (screenHeight - drawHeight) / 2;
                } else {
                    drawHeight = screenHeight;
                    drawWidth = screenHeight * imgAspectRatio;
                    drawX = screenX + (screenWidth - drawWidth) / 2;
                    drawY = screenY;
                }

                ctx.save();
                this.roundRect(ctx, screenX, screenY, screenWidth, screenHeight, 30);
                ctx.clip();
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                ctx.restore();
            }
        } else {
            // No frame, just show the image
            if (img) {
                const imgAspectRatio = img.width / img.height;
                const screenAspectRatio = width / height;

                let drawWidth, drawHeight, drawX, drawY;

                if (imgAspectRatio > screenAspectRatio) {
                    drawWidth = width;
                    drawHeight = width / imgAspectRatio;
                    drawX = x;
                    drawY = y + (height - drawHeight) / 2;
                } else {
                    drawHeight = height;
                    drawWidth = height * imgAspectRatio;
                    drawX = x + (width - drawWidth) / 2;
                    drawY = y;
                }

                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            }
        }
    }

    drawPhoneFeatures(ctx, screenX, screenY, screenWidth, screenHeight) {
        if (this.currentDevice === 'iphone-17' || this.currentDevice === 'iphone-17-pro') {
            // Dynamic Island (pill-shaped notch)
            const islandWidth = 120;
            const islandHeight = 35;
            const islandX = screenX + (screenWidth - islandWidth) / 2;
            const islandY = screenY + 15;

            ctx.fillStyle = '#000000';
            this.roundRect(ctx, islandX, islandY, islandWidth, islandHeight, 17);
            ctx.fill();

            // Side buttons
            if (this.currentDevice === 'iphone-17') {
                // Mute switch
                ctx.fillStyle = '#3a3a3c';
                ctx.fillRect(screenX - 8, screenY + 150, 6, 30);

                // Volume buttons
                ctx.fillRect(screenX - 8, screenY + 200, 6, 50);
                ctx.fillRect(screenX - 8, screenY + 260, 6, 50);

                // Power button
                ctx.fillRect(screenX + screenWidth + 2, screenY + 200, 6, 80);
            } else if (this.currentDevice === 'iphone-17-pro') {
                // Action button (replaces mute switch)
                ctx.fillStyle = '#3a3a3c';
                ctx.fillRect(screenX - 8, screenY + 150, 6, 30);

                // Volume buttons
                ctx.fillRect(screenX - 8, screenY + 200, 6, 50);
                ctx.fillRect(screenX - 8, screenY + 260, 6, 50);

                // Power button
                ctx.fillRect(screenX + screenWidth + 2, screenY + 200, 6, 80);

                // Camera bar hint at bottom (Pro feature)
                ctx.fillStyle = '#2a2a2c';
                ctx.fillRect(screenX + screenWidth / 2 - 80, screenY + screenHeight - 8, 160, 4);
            }

            // Home indicator
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.6;
            const homeIndicatorWidth = 140;
            const homeIndicatorHeight = 5;
            const homeIndicatorX = screenX + (screenWidth - homeIndicatorWidth) / 2;
            const homeIndicatorY = screenY + screenHeight - 20;
            this.roundRect(ctx, homeIndicatorX, homeIndicatorY, homeIndicatorWidth, homeIndicatorHeight, 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

        } else if (this.currentDevice === 'galaxy-s24') {
            // Center punch-hole camera
            const cameraHoleRadius = 8;
            const cameraX = screenX + screenWidth / 2;
            const cameraY = screenY + 20;

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(cameraX, cameraY, cameraHoleRadius, 0, Math.PI * 2);
            ctx.fill();

            // Side buttons (power + volume on right side)
            ctx.fillStyle = '#3a3a3c';
            ctx.fillRect(screenX + screenWidth + 2, screenY + 180, 6, 70);
            ctx.fillRect(screenX + screenWidth + 2, screenY + 260, 6, 70);

            // Home indicator
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.6;
            const homeIndicatorWidth = 140;
            const homeIndicatorHeight = 5;
            const homeIndicatorX = screenX + (screenWidth - homeIndicatorWidth) / 2;
            const homeIndicatorY = screenY + screenHeight - 20;
            this.roundRect(ctx, homeIndicatorX, homeIndicatorY, homeIndicatorWidth, homeIndicatorHeight, 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
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