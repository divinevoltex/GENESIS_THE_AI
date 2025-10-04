# Genesis AI Assistant

A sophisticated AI assistant with voice capabilities, 3D visuals, and an intuitive chat interface. Built with vanilla JavaScript, Three.js, GSAP, and powered by Google Cloud APIs.

## 🌟 Features

- **Intelligent Chat**: Contextual conversations with streaming responses
- **Voice Integration**: Speech-to-Text and Text-to-Speech capabilities
- **3D Visuals**: Interactive animated orb with orbital rings using Three.js
- **Responsive Design**: Mobile-first approach with elegant desktop layout
- **Multi-Media Support**: Dedicated pages for images, video, and music generation
- **Conversation History**: Persistent chat history with search and management
- **Customizable Settings**: Voice controls, themes, and animation preferences
- **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- A Google Cloud account with API access

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Google Cloud APIs:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the following APIs:
     - Cloud Text-to-Speech API
     - Cloud Speech-to-Text API
     - (Optional) Generative AI API
   - Create an API key in "APIs & Services" > "Credentials"

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google API key:
   ```env
   GOOGLE_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
genesis-ai-assistant/
├── server.js                 # Express server with API proxy
├── package.json              # Node.js dependencies
├── .env.example              # Environment variables template
├── README.md                 # This file
└── public/
    ├── index.html            # Main HTML structure
    ├── styles.css            # Complete CSS styling
    └── app.js                # JavaScript application logic
```

## 🔧 How It Works

### API Proxy Architecture

The application uses a secure proxy pattern to protect your Google API key:

```
Client (Browser) → Express Server → Google Cloud APIs
```

- **Client**: Sends requests to local endpoints (`/api/chat`, `/api/tts`, `/api/stt`)
- **Server**: Validates requests and forwards to Google Cloud APIs
- **Security**: API key never exposed to the browser

### Key Endpoints

- `POST /api/chat` - Process chat messages
- `POST /api/tts` - Text-to-Speech conversion
- `POST /api/stt` - Speech-to-Text conversion
- `GET /api/health` - Server status and API configuration

### Special Commands

- **Creator Query**: Ask "who created you" or similar → Returns exact response: "i was create by sai kaarthik"
- **Easter Egg**: Type `genesis:whoami` in chat → Opens credits modal

## 🎨 Customization

### Themes and Colors

The application uses CSS custom properties for easy theming:

```css
:root {
  --accent-primary: #00d4ff;    /* Electric blue */
  --accent-secondary: #7c3aed;  /* Purple */
  --accent-gold: #fbbf24;       /* Gold */
  /* ... more variables */
}
```

### Animation Controls

Animations can be toggled in settings or disabled system-wide for users with motion sensitivity preferences.

## 🛠️ Development

### Adding New Features

1. **Client-side**: Edit `public/app.js` and add methods to the `GenesisAI` class
2. **Server-side**: Add new endpoints in `server.js`
3. **Styling**: Update `public/styles.css` using the existing design system

### Mock Mode

If no Google API key is configured, the application runs in mock mode with simulated responses. Perfect for development and testing.

## 🔒 Security Notes

- **Never** commit your `.env` file with real API keys
- API key is validated server-side only
- CORS is configured for localhost development
- Input validation and error handling throughout

## 🌐 Deployment

### Environment Variables for Production

```env
GOOGLE_API_KEY=your_production_api_key
PORT=8080
NODE_ENV=production
```

### Recommended Platforms

- **Heroku**: Simple deployment with environment variables
- **Vercel**: Excellent for static sites with serverless functions
- **Railway**: Good balance of simplicity and control

## 📱 Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Features**: Web Speech API, ES6+ modules, CSS Grid, WebGL
- **Fallbacks**: Graceful degradation for unsupported features

## 🎯 Example Prompts

Try these prompts to explore Genesis's capabilities:

1. "Tell me about yourself"
2. "What can you help me with today?"
3. "Show me something creative"
4. "Who created you?" (triggers special response)
5. "genesis:whoami" (opens credits modal)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Credits

**Created by**: Sai Kaarthik

**Technologies Used**:
- Three.js for 3D graphics
- GSAP for animations  
- Google Cloud AI APIs
- Web Speech API
- Modern JavaScript (ES6+)

---

**Genesis AI Assistant** - Where artificial intelligence meets beautiful design. 🌌
