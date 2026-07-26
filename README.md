# Realtime Chat (Yappify)

A modern real-time chat application built with React, Vite, Express, MongoDB, Socket.IO, and AI-powered messaging tools.

## Project Overview

This repository contains a full-stack chat application with:
- secure JWT cookie-based authentication
- real-time messaging and presence via Socket.IO
- user-to-user chat with message replies, media uploads, edits, deletes, reactions, and read receipts
- AI features including conversation summarization, reply suggestions, translation, and code explanation
- WebRTC-based video call signaling support
- Cloudinary media uploads, Resend welcome emails, and Arcjet bot/rate-limit protection
- production-ready SPA serving from the backend

## Tech Stack

- Backend
  - Node.js, Express
  - MongoDB / Mongoose
  - Socket.IO
  - JWT cookies
  - Cloudinary
  - Resend
  - Arcjet
  - Groq / OpenAI-compatible chat models
- Frontend
  - React + Vite
  - React Router
  - Zustand state management
  - Tailwind CSS + DaisyUI
  - Socket.IO Client
  - Axios
  - React Hot Toast

## Repository Structure

- `Backend/` - Express API, socket server, AI controllers, database models, and middleware
- `Frontend/` - React application, chat UI, AI panels, call UI, and frontend state management
- `package.json` - root convenience scripts for installing dependencies and starting the backend

## Prerequisites

- Node.js 18+ / npm
- MongoDB instance or Atlas cluster
- Cloudinary account for image/media uploads
- Resend account for email functionality
- Groq API key for AI features
- Arcjet key for production bot/rate-limit protection

## Setup

1. Clone the repository

   ```bash
   git clone https://github.com/Ayush6950/yappify.git
   cd Realtimechat
   ```

2. Install dependencies

   ```bash
   npm install --prefix Backend
   npm install --prefix Frontend
   ```

3. Create a `.env` file inside `Backend/`

   Example `Backend/.env`:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/realtimechat?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_here
   CLIENT_URL=http://localhost:5173

   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=onboarding@yourdomain.com
   EMAIL_FROM_NAME=Yappify

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   ARCJET_KEY=your_arcjet_key
   ARCJET_ENV=production

   GROQ_API_KEY=your_groq_api_key
   ```

   Notes:
   - `CLIENT_URL` should match the frontend local address (`http://localhost:5173`).
   - `ARCJET_KEY` is used for bot and rate-limit protection on auth routes.
   - `GROQ_API_KEY` enables AI-powered conversation features.

## Running Locally

### Start the Backend

```bash
npm run start --prefix Backend
```

The backend listens on `http://localhost:5000` by default.

### Start the Frontend (development)

```bash
npm run dev --prefix Frontend
```

Open `http://localhost:5173` in your browser.

### Root scripts

From the repository root you can also run:

- `npm run build` - install backend/frontend dependencies and build the frontend
- `npm start` - start the backend server

## Production Build

1. Build the frontend assets:

   ```bash
   npm run build --prefix Frontend
   ```

2. Start the backend with `NODE_ENV=production`:

   ```bash
   NODE_ENV=production npm run start --prefix Backend
   ```

In production mode, the backend serves the built frontend from `Frontend/dist`.

## Key Features

- Email/password sign-up and login
- JWT authentication stored in HTTP-only cookies
- Protected API routes for messages, contacts, and AI operations
- Real-time socket events for:
  - new messages
  - typing indicators
  - online presence
  - read/delivered receipts
  - message edits, deletes, reactions
  - voice/video call signaling and WebRTC offer/answer exchange
- Message attachments with Cloudinary uploads
- AI endpoints for:
  - conversation summaries
  - streaming summaries
  - reply suggestions
  - translation
  - code explanation
  - streaming translation / explanation
- Email onboarding via Resend
- Arcjet security/rate-limit middleware for auth endpoints

## API Endpoints

### Auth
- `POST /api/auth/signup` - create a new user
- `POST /api/auth/login` - login and receive an auth cookie
- `POST /api/auth/logout` - clear auth cookie
- `PUT /api/auth/update-profile` - upload/update profile picture
- `GET /api/auth/check` - validate auth session

### Messages
- `GET /api/messages/contacts` - list other users
- `GET /api/messages/chats` - list chat partners
- `GET /api/messages/:id` - fetch conversation with a partner
- `POST /api/messages/send/:id` - send a new message
- `POST /api/messages/:id/read` - mark a message as read
- `PUT /api/messages/:id` - edit a message
- `DELETE /api/messages/:id` - delete a message
- `POST /api/messages/:id/react` - add/remove a reaction

### AI
- `POST /api/ai/summarize`
- `POST /api/ai/summarize/stream`
- `POST /api/ai/suggest-reply`
- `POST /api/ai/chat`
- `POST /api/ai/translate`
- `POST /api/ai/translate/stream`
- `POST /api/ai/explain-code`
- `POST /api/ai/explain-code/stream`

## Notes

- The frontend uses Axios configured to call `http://localhost:5000/api` during development.
- Socket connections are authenticated using the same JWT cookie used by the API.
- `Backend/` is an ES module project (`type: module`) while the root package is CommonJS.

## License

This project is currently licensed under ISC.
