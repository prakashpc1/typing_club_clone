const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initialize users file if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
}

// Helper functions
function readUsers() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

function writeUsers(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// Get all lessons
app.get('/api/lessons', (req, res) => {
    const lessons = [
        { id: 1, title: "Home Row - ASDF", description: "Learn the home row keys starting with A, S, D, F", content: "asdf asdf asdf fdsa fdsa fdsa asdf fdsa" },
        { id: 2, title: "Home Row - JKL;", description: "Learn the home row keys J, K, L, ;", content: "jkl; jkl; jkl; ;lkj ;lkj ;lkj jkl; ;lkj" },
        { id: 3, title: "Home Row Combined", description: "Combine all home row keys", content: "asdf jkl; asdf jkl; fdsa ;lkj asdf jkl; fdsa ;lkj" },
        { id: 4, title: "Top Row - QWERT", description: "Learn the top row keys Q, W, E, R, T", content: "qwert qwert qwert trewq trewq trewq qwert trewq" },
        { id: 5, title: "Top Row - YUIOP", description: "Learn the top row keys Y, U, I, O, P", content: "yuiop yuiop yuiop poiuy poiuy poiuy yuiop poiuy" },
        { id: 6, title: "Bottom Row - ZXCVB", description: "Learn the bottom row keys Z, X, C, V, B", content: "zxcvb zxcvb zxcvb bvcxz bvcxz bvcxz zxcvb bvcxz" },
        { id: 7, title: "Bottom Row - NM,./", description: "Learn the bottom row keys N, M, ,, ., /", content: "nm,./ nm,./ nm,./ ./,mn ./,mn ./,mn nm,./ ./,mn" },
        { id: 8, title: "Common Words", description: "Practice common English words", content: "the and that have for not are but his they this will one has their also from had first been would could year there each its when new how then than her two more these want go see come use find give make many back well need mean old right take only into which year people time day man thing woman life child world school state family program work government company number group problem fact" },
        { id: 9, title: "Sentences Level 1", description: "Simple sentences practice", content: "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly." },
        { id: 10, title: "Advanced Practice", description: "Complex sentences and punctuation", content: "Programming is the art of telling another human what one wants the computer to do. Success is not final, failure is not fatal: it is the courage to continue that counts. In the middle of difficulty lies opportunity. Life is what happens when you're busy making other plans." }
    ];
    res.json(lessons);
});

// Create or update user progress
app.post('/api/progress', (req, res) => {
    const { userId, lessonId, wpm, accuracy, errors, timestamp } = req.body;
    
    if (!userId || !lessonId) {
        return res.status(400).json({ error: 'userId and lessonId are required' });
    }
    
    const data = readUsers();
    let user = data.users.find(u => u.id === userId);
    
    if (!user) {
        user = {
            id: userId,
            createdAt: new Date().toISOString(),
            progress: [],
            stats: {
                totalLessons: 0,
                bestWpm: 0,
                averageAccuracy: 0,
                totalTime: 0
            }
        };
        data.users.push(user);
    }
    
    // Add new progress entry
    user.progress.push({
        lessonId,
        wpm,
        accuracy,
        errors,
        timestamp: timestamp || new Date().toISOString()
    });
    
    // Update stats
    const lessonProgresses = user.progress.filter(p => p.lessonId === lessonId);
    const bestWpmForLesson = Math.max(...lessonProgresses.map(p => p.wpm));
    const overallBestWpm = Math.max(...user.progress.map(p => p.wpm), 0);
    
    const accuracies = user.progress.map(p => p.accuracy);
    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    
    user.stats = {
        totalLessons: user.progress.length,
        bestWpm: overallBestWpm,
        averageAccuracy: avgAccuracy,
        totalTime: user.stats.totalTime + 60 // Assuming each session is ~1 minute
    };
    
    writeUsers(data);
    res.json({ success: true, user });
});

// Get user progress
app.get('/api/progress/:userId', (req, res) => {
    const { userId } = req.params;
    const data = readUsers();
    const user = data.users.find(u => u.id === userId);
    
    if (!user) {
        return res.json({ user: null, progress: [] });
    }
    
    res.json({ user, progress: user.progress });
});

// Get leaderboard (top 10 by best WPM)
app.get('/api/leaderboard', (req, res) => {
    const data = readUsers();
    const leaderboard = data.users
        .map(u => ({
            id: u.id,
            bestWpm: u.stats.bestWpm,
            averageAccuracy: u.stats.averageAccuracy,
            totalLessons: u.stats.totalLessons
        }))
        .sort((a, b) => b.bestWpm - a.bestWpm)
        .slice(0, 10);
    
    res.json(leaderboard);
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`TypeClub server running on http://localhost:${PORT}`);
});
