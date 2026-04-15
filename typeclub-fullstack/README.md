# TypeClub - Full Stack Typing Tutor

A complete full-stack typing tutor application inspired by TypingClub, built with Node.js/Express backend and vanilla JavaScript frontend.

## Features

- **10 Structured Lessons**: From home row to advanced practice
- **Real-time Statistics**: WPM, accuracy, errors, and time tracking
- **Virtual Keyboard**: Visual feedback showing which key to press
- **User Progress Tracking**: Persistent storage of lesson completions
- **Leaderboard**: Compare your performance with other users
- **Free Practice Mode**: Unlimited typing practice
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Easy on the eyes for extended practice sessions

## Project Structure

```
typeclub-fullstack/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Node.js dependencies
│   └── data/              # User data storage (created on first run)
└── frontend/
    └── index.html         # Complete frontend application
```

## Installation & Setup

### 1. Install Dependencies

```bash
cd typeclub-fullstack/backend
npm install
```

### 2. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

- `GET /api/lessons` - Retrieve all typing lessons
- `POST /api/progress` - Save user progress
- `GET /api/progress/:userId` - Get user's progress and statistics
- `GET /api/leaderboard` - Get top 10 users by WPM

## Usage

1. **Enter a Username**: Create or enter your username to track progress
2. **Choose a Lesson**: Select from 10 structured lessons
3. **Start Typing**: Follow the highlighted keys on the virtual keyboard
4. **Complete Lessons**: Finish lessons to save your WPM and accuracy
5. **View Statistics**: Check your progress in the Statistics tab
6. **Compete**: See how you rank on the Leaderboard

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: JSON file-based storage (easily upgradeable to database)
- **No External Dependencies**: Works completely offline after initial setup

## Offline Capability

Once the server is running, the application works entirely locally. All data is stored in `backend/data/users.json`. No internet connection required after initial npm install.

## Customization

- Add more lessons by editing the lessons array in `server.js`
- Modify styling in the `<style>` section of `index.html`
- Change port by setting `PORT` environment variable

## License

MIT License - Free to use and modify
