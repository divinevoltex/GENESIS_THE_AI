// app.js - Main Application JavaScript

class GenesisApp {
    constructor() {
        this.currentPage = 'chat';
        this.chatHistory = [];
        this.isListening = false;
        this.recognition = null;
        this.synth = window.speechSynthesis;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initThreeJS();
        this.initSpeechRecognition();
        this.showLoadingScreen();
        
        // Simulate loading completion
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 2000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) {
                    this.switchPage(page);
                }
            });
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showModal('settingsModal');
        });

        // Close buttons for modals
        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.hideModal('settingsModal');
        });

        document.getElementById('closeHistoryBtn').addEventListener('click', () => {
            this.hideModal('historyModal');
        });

        document.getElementById('closeCreditsBtn').addEventListener('click', () => {
            this.hideModal('creditsModal');
        });

        // History button
        document.getElementById('historyBtn').addEventListener('click', () => {
            this.showHistory();
        });

        // Clear history
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        // Chat input
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const voiceBtn = document.getElementById('voiceBtn');

        chatInput.addEventListener('input', this.autoResizeTextarea.bind(this));
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());
        voiceBtn.addEventListener('click', () => this.toggleVoiceInput());

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.currentTarget.dataset.prompt;
                chatInput.value = prompt;
                this.sendMessage();
            });
        });

        // Generate buttons for other pages
        this.setupGenerateButtons();

        // Settings controls
        this.setupSettingsControls();
    }

    setupSettingsControls() {
        // Speech rate
        const speechRate = document.getElementById('speechRate');
        const speechRateValue = document.getElementById('speechRateValue');
        
        speechRate.addEventListener('input', () => {
            speechRateValue.textContent = `${speechRate.value}x`;
        });

        // Voice pitch
        const voicePitch = document.getElementById('voicePitch');
        const voicePitchValue = document.getElementById('voicePitchValue');
        
        voicePitch.addEventListener('input', () => {
            voicePitchValue.textContent = voicePitch.value;
        });
    }

    setupGenerateButtons() {
        // Image generation
        const imageGenerateBtn = document.querySelector('#imagesPage .cta-btn');
        if (imageGenerateBtn) {
            imageGenerateBtn.addEventListener('click', () => {
                this.showGenerateModal('image');
            });
        }

        // Video generation
        const videoGenerateBtn = document.querySelector('#videoPage .cta-btn');
        if (videoGenerateBtn) {
            videoGenerateBtn.addEventListener('click', () => {
                this.showGenerateModal('video');
            });
        }

        // Music generation
        const musicGenerateBtn = document.querySelector('#musicPage .cta-btn');
        if (musicGenerateBtn) {
            musicGenerateBtn.addEventListener('click', () => {
                this.showGenerateModal('music');
            });
        }
    }

    showGenerateModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${this.getModalTitle(type)}</h3>
                    <button class="close-btn">✕</button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label for="generatePrompt">Describe what you want to create:</label>
                        <textarea id="generatePrompt" placeholder="${this.getPlaceholder(type)}" rows="4"></textarea>
                    </div>
                    ${type === 'music' || type === 'video' ? this.getAdditionalOptions(type) : ''}
                </div>
                <div class="modal-actions">
                    <button class="secondary-btn cancel-btn">Cancel</button>
                    <button class="primary-btn generate-submit-btn">Generate</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners for the modal
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.generate-submit-btn').addEventListener('click', () => {
            const prompt = modal.querySelector('#generatePrompt').value.trim();
            if (prompt) {
                this.generateContent(type, prompt, modal);
            }
        });
    }

    getModalTitle(type) {
        const titles = {
            image: '🎨 Generate Image Description',
            video: '🎬 Create Video Concept',
            music: '🎵 Compose Music'
        };
        return titles[type] || 'Generate Content';
    }

    getPlaceholder(type) {
        const placeholders = {
            image: 'Example: A beautiful sunset over mountains with vibrant colors and a serene lake...',
            video: 'Example: A sci-fi adventure through a futuristic city with flying cars...',
            music: 'Example: An epic orchestral piece for a space battle with dramatic strings...'
        };
        return placeholders[type] || 'Describe what you want to create...';
    }

    getAdditionalOptions(type) {
        if (type === 'music') {
            return `
                <div class="form-row">
                    <div class="input-group">
                        <label for="musicGenre">Genre:</label>
                        <select id="musicGenre">
                            <option value="electronic">Electronic</option>
                            <option value="orchestral">Orchestral</option>
                            <option value="rock">Rock</option>
                            <option value="jazz">Jazz</option>
                            <option value="pop">Pop</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="musicDuration">Duration (seconds):</label>
                        <input type="number" id="musicDuration" value="30" min="10" max="300">
                    </div>
                </div>
            `;
        } else if (type === 'video') {
            return `
                <div class="form-row">
                    <div class="input-group">
                        <label for="videoStyle">Style:</label>
                        <select id="videoStyle">
                            <option value="cinematic">Cinematic</option>
                            <option value="documentary">Documentary</option>
                            <option value="animation">Animation</option>
                            <option value="sci-fi">Sci-Fi</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="videoDuration">Duration (seconds):</label>
                        <input type="number" id="videoDuration" value="30" min="5" max="180">
                    </div>
                </div>
            `;
        }
        return '';
    }

    async generateContent(type, prompt, modal) {
        const generateBtn = modal.querySelector('.generate-submit-btn');
        const originalText = generateBtn.textContent;
        
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        try {
            let endpoint = '';
            let body = { prompt };

            // Add additional parameters based on type
            if (type === 'music') {
                endpoint = '/api/generate-music';
                body.genre = modal.querySelector('#musicGenre').value;
                body.duration = modal.querySelector('#musicDuration').value;
            } else if (type === 'video') {
                endpoint = '/api/generate-video';
                body.style = modal.querySelector('#videoStyle').value;
                body.duration = modal.querySelector('#videoDuration').value;
            } else if (type === 'image') {
                endpoint = '/api/generate-image';
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            // Show success and display result
            this.showGenerationResult(type, prompt, data);
            modal.remove();

        } catch (error) {
            console.error('Generation error:', error);
            alert(`Sorry, generation failed: ${error.message}`);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = originalText;
        }
    }

    showGenerationResult(type, prompt, data) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        const content = data.description || data.output || 'No content generated';
        
        modal.innerHTML = `
            <div class="modal-content result-modal">
                <div class="modal-header">
                    <h3>${this.getResultTitle(type)}</h3>
                    <button class="close-btn">✕</button>
                </div>
                <div class="modal-body">
                    <div class="result-content">
                        <div class="result-text">${content}</div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="secondary-btn close-result-btn">Close</button>
                    <button class="primary-btn copy-result-btn">Copy Text</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-result-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.copy-result-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(content);
            this.showToast('Text copied to clipboard!');
        });
    }

    getResultTitle(type) {
        const titles = {
            image: '🎨 Your Image Description',
            video: '🎬 Your Video Concept',
            music: '🎵 Your Music Composition'
        };
        return titles[type] || 'Generation Result';
    }

    switchPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Activate corresponding nav button
        const activeBtn = document.querySelector(`[data-page="${page}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentPage = page;
    }

    autoResizeTextarea() {
        const textarea = document.getElementById('chatInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';
        this.autoResizeTextarea();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Chat failed');
            }

            // Remove typing indicator and add bot response
            this.removeTypingIndicator();
            this.addMessage(data.response, 'bot');

            // Add to history
            this.addToHistory(message, data.response);

            // Speak response if voice is enabled
            if (document.getElementById('voiceEnabled').checked) {
                this.speakResponse(data.response);
            }

        } catch (error) {
            console.error('Chat error:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again!', 'bot');
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-avatar">${sender === 'bot' ? '🌌' : '👤'}</div>
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('messagesContainer');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.id = 'typingIndicator';

        typingDiv.innerHTML = `
            <div class="message-avatar">🌌</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.showVoiceIndicator();
            };

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');

                document.getElementById('chatInput').value = transcript;
                this.autoResizeTextarea();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.hideVoiceIndicator();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.hideVoiceIndicator();
            };
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    showVoiceIndicator() {
        document.getElementById('voiceIndicator').classList.remove('hidden');
    }

    hideVoiceIndicator() {
        document.getElementById('voiceIndicator').classList.add('hidden');
    }

    speakResponse(text) {
        if (this.synth.speaking) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = parseFloat(document.getElementById('speechRate').value);
        utterance.pitch = 1 + (parseInt(document.getElementById('voicePitch').value) / 10);

        this.synth.speak(utterance);
    }

    showHistory() {
        const historyContainer = document.getElementById('historyContainer');
        
        if (this.chatHistory.length === 0) {
            historyContainer.innerHTML = '<p class="empty-state">No conversation history yet</p>';
        } else {
            historyContainer.innerHTML = this.chatHistory.map((chat, index) => `
                <div class="history-item">
                    <div class="history-question">${chat.question}</div>
                    <div class="history-answer">${chat.answer}</div>
                    <div class="history-time">${chat.time}</div>
                </div>
            `).join('');
        }

        this.showModal('historyModal');
    }

    addToHistory(question, answer) {
        this.chatHistory.unshift({
            question,
            answer,
            time: new Date().toLocaleString()
        });

        // Keep only last 50 conversations
        if (this.chatHistory.length > 50) {
            this.chatHistory = this.chatHistory.slice(0, 50);
        }
    }

    clearHistory() {
        this.chatHistory = [];
        this.showHistory();
        this.showToast('History cleared');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    initThreeJS() {
        // Simple 3D background animation
        const canvas = document.getElementById('threeCanvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        renderer.setClearColor(0x000000, 0);
        canvas.appendChild(renderer.domElement);

        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1000;
        
        const posArray = new Float32Array(particlesCount * 3);
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 5;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        
        camera.position.z = 2;

        function animate() {
            requestAnimationFrame(animate);
            
            particlesMesh.rotation.x += 0.001;
            particlesMesh.rotation.y += 0.002;
            
            renderer.render(scene, camera);
        }
        
        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GenesisApp();
});