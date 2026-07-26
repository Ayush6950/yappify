# 💬 Yappify – Real-Time Chat Powered by AI

> *Where conversations meet intelligence. A full-stack chat app that listens, learns, and helps you communicate smarter.*

---

## ✨ What is Yappify?

Forget boring chat apps. **Yappify** is a modern, feature-rich real-time messaging platform that brings together the best of modern web development and AI-powered intelligence. Whether you're chatting with a friend or collaborating with a team, Yappify makes every conversation smoother, smarter, and more connected.

### 🎯 Why Yappify?

- 🚀 **Lightning-fast** real-time messaging with Socket.IO
- 🔐 **Fort Knox security** with JWT authentication and HTTP-only cookies
- 🤖 **AI superpowers** – summarize chats, get smart replies, translate instantly, explain code
- 🎨 **Beautiful UI** built with React, Vite, Tailwind, and DaisyUI
- 📹 **Video call ready** with WebRTC signaling
- 🛡️ **Battle-tested** with Arcjet bot protection and rate limiting
- 🌩️ **Scalable backend** powered by Node.js, Express, and MongoDB
- 📸 **Media magic** – seamless image uploads via Cloudinary

---

## 🏗️ The Tech Stack

### Backend Powerhouse
```
Node.js + Express        → API & Real-time server
MongoDB + Mongoose       → Data persistence
Socket.IO               → WebSocket magic
JWT Cookies             → Secure authentication
Groq / OpenAI API       → AI brains
Cloudinary              → Media hosting
Resend                  → Email delivery
Arcjet                  → Security & rate limiting
```

### Frontend Beauty
```
React + Vite            → Lightning-fast development
React Router            → Smooth navigation
Zustand                 → Lightweight state management
Tailwind + DaisyUI      → Gorgeous UI components
Socket.IO Client        → Real-time connections
Axios                   → HTTP requests
React Hot Toast         → Silky smooth notifications
```

---

## 📂 Project Structure

```
Yappify/
├── Backend/              # Express API & Socket server
│   ├── models/          # MongoDB schemas
│   ├── controllers/      # Business logic & AI features
│   ├── middleware/       # Auth & protection layers
│   └── routes/          # API endpoints
├── Frontend/             # React application
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks
│   └── store/           # Zustand state
└── package.json         # Root scripts & config
```

---

## 🚀 Getting Started

### Prerequisites

Before you dive in, grab these essentials:

- **Node.js 18+** – [Download here](https://nodejs.org/)
- **MongoDB** – [Atlas free tier](https://www.mongodb.com/cloud/atlas) or local instance
- **Cloudinary** – Free account for media uploads
- **Resend** – For email magic
- **Groq API Key** – AI features require this (or OpenAI-compatible endpoint)
- **Arcjet Key** – Optional but recommended for production

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/Ayush6950/yappify.git
   cd yappify
   ```

2. **Install dependencies**
   ```bash
   npm install --prefix Backend
   npm install --prefix Frontend
   ```

3. **Set up environment variables**

   Create `Backend/.env`:
   ```env
   # 🔧 Core
   NODE_ENV=development
   PORT=5000
   
   # 🗄️ Database
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/realtimechat
   
   # 🔐 Security
   JWT_SECRET=your_super_secret_jwt_key_here
   ARCJET_KEY=your_arcjet_key
   ARCJET_ENV=production
   
   # 🌐 Frontend
   CLIENT_URL=http://localhost:5173
   
   # 📧 Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=onboarding@yourdomain.com
   EMAIL_FROM_NAME=Yappify
   
   # 🖼️ Media (Cloudinary)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # 🤖 AI (Groq or OpenAI-compatible)
   GROQ_API_KEY=your_groq_api_key
   ```

---

## 🎮 Running Locally

### Quick Start (3 terminals)

**Terminal 1: Backend**
```bash
npm run start --prefix Backend
# Backend running on http://localhost:5000
```

**Terminal 2: Frontend**
```bash
npm run dev --prefix Frontend
# Frontend running on http://localhost:5173
```

**Terminal 3: Watch & Debug** (optional)
```bash
npm run dev --prefix Backend
# For development with hot reload
```

Then open [http://localhost:5173](http://localhost:5173) in your browser and start chatting!

---

## 🏭 Production Build

Ready to go live?

```bash
# 1. Build frontend
npm run build --prefix Frontend

# 2. Start backend in production mode
NODE_ENV=production npm run start --prefix Backend
```

The backend automatically serves the optimized frontend from `Frontend/dist`. Just point your domain and you're live! 🚀

---

## 🌟 Features That Make Yappify Special

### 💌 Messaging
- ✉️ Send & receive messages in real-time
- 📎 Attach photos and media files
- ✏️ Edit messages after sending
- 🗑️ Delete messages from chat
- 👍 React with emojis
- ✅ Read receipts & delivery indicators
- ↩️ Reply to specific messages
- ⌨️ See who's typing

### 🤖 AI Superpowers
- 📝 **Summarize** entire conversations
- 💡 **Smart Replies** – AI-suggested responses
- 🌍 **Translate** messages instantly
- 💻 **Explain Code** – break down snippets
- 🎙️ **Streaming responses** for faster perceived performance

### 🔐 Security & Auth
- 🔑 JWT-based authentication
- 🍪 HTTP-only cookies (CSRF protection)
- 🛡️ Arcjet bot & rate-limit protection
- ✅ Protected API routes
- 🔒 Session validation

### 👥 Social Features
- 👤 User profiles with avatars
- 🟢 Online/offline presence
- 📱 Contact list & chat history
- 🎬 Video call signaling (WebRTC ready)

---

## 📡 API Reference

### Authentication Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login & receive auth cookie |
| POST | `/api/auth/logout` | Clear session |
| PUT | `/api/auth/update-profile` | Update profile picture |
| GET | `/api/auth/check` | Validate session |

### Messages Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/messages/contacts` | List all users |
| GET | `/api/messages/chats` | Get chat partners |
| GET | `/api/messages/:id` | Fetch chat history |
| POST | `/api/messages/send/:id` | Send message |
| PUT | `/api/messages/:id` | Edit message |
| DELETE | `/api/messages/:id` | Delete message |
| POST | `/api/messages/:id/read` | Mark as read |
| POST | `/api/messages/:id/react` | Add/remove reaction |

### AI Routes
| Endpoint | Purpose |
|----------|---------|
| `POST /api/ai/summarize` | Summarize conversation |
| `POST /api/ai/summarize/stream` | Stream summary |
| `POST /api/ai/suggest-reply` | Get AI reply suggestions |
| `POST /api/ai/chat` | General AI chat |
| `POST /api/ai/translate` | Translate message |
| `POST /api/ai/translate/stream` | Stream translation |
| `POST /api/ai/explain-code` | Explain code snippet |
| `POST /api/ai/explain-code/stream` | Stream code explanation |

---

## 🎯 Real-Time Events (Socket.IO)

Yappify uses WebSocket events for instant updates:

```javascript
// Client sends
socket.emit('send_message', { recipientId, content });
socket.emit('typing', { recipientId });
socket.emit('stop_typing', { recipientId });

// Server broadcasts
socket.on('receive_message', handler);
socket.on('user_typing', handler);
socket.on('user_online', handler);
socket.on('user_offline', handler);
socket.on('message_read', handler);
socket.on('message_delivered', handler);
```

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Clear node_modules and reinstall
rm -rf Backend/node_modules
npm install --prefix Backend
```

### Socket connection failing?
- Ensure `CLIENT_URL` matches your frontend address
- Check that both frontend and backend are running
- Verify firewall isn't blocking WebSocket connections

### AI features not working?
- Verify `GROQ_API_KEY` is set and valid
- Check API rate limits on Groq dashboard
- Ensure backend can reach Groq API

### MongoDB connection issues?
- Test your `MONGO_URI` string
- Ensure IP is whitelisted in MongoDB Atlas
- Check network connectivity

---

## 🚢 Deployment Guide (Quick Tips)

### Recommended Services
- **Backend**: Heroku, Railway, Render, or DigitalOcean
- **Database**: MongoDB Atlas (free tier available)
- **Storage**: Cloudinary (free tier for ~10GB/month)
- **Email**: Resend (free tier for ~100 emails/day)

### Environment Variables
Don't forget to set all `.env` variables in your hosting platform's dashboard!

---

## 📚 Key Technologies Explained

| Tech | Why We Chose It |
|------|-----------------|
| **Socket.IO** | Real-time messaging without polling |
| **React + Vite** | Fast development, instant HMR, optimized builds |
| **Zustand** | Lightweight state, no boilerplate |
| **MongoDB** | Flexible schema, easy scaling |
| **JWT Cookies** | Secure, stateless authentication |
| **Groq API** | Fast inference for AI features |

---

## 🤝 Contributing

Found a bug? Have an idea? We'd love your contribution!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC License – Feel free to use this in your projects!

---

## 🎉 Let's Connect!

Have questions? Found a bug? Want to chat about features?

- 🐙 [GitHub Issues](https://github.com/Ayush6950/yappify/issues)
- 💌 Reach out on [Twitter](https://twitter.com/yourhandle)
- 🌟 Star the repo if you love it!

---

<div align="center">

**Built with ❤️ by developers who actually enjoy chatting**

*Yappify – Because conversations should be smarter*

</div>