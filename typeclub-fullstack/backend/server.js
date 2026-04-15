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

// Get all levels (replacing lessons with levels system)
app.get('/api/levels', (req, res) => {
    const levels = [
        { id: 1, name: "Home Row Foundation", desc: "Master ASDF JKL;", keys: "asdf jkl;", text: "asdf jkl; fads sjl; daf jkl; ask dfj;" },
        { id: 2, name: "Home Row Flow", desc: "Smooth transitions on home row", keys: "asdf jkl;", text: "dad has a sad lad; flask asks; all dads fall;" },
        { id: 3, name: "Top Row Reach", desc: "Introducing E and I", keys: "e i", text: "fee see; die lie; ease idle; feel ill;" },
        { id: 4, name: "Top Row Expansion", desc: "Adding R and U", keys: "r u", text: "rare user; rude rear; rise up; real use;" },
        { id: 5, name: "Top Row Mastery", desc: "Q, W, O, P added", keys: "q w o p", text: "we go; pop up; own power; quiet row;" },
        { id: 6, name: "Bottom Row Basics", desc: "Introducing C and M", keys: "c m", text: "cam mac; calm man; come back; mom can;" },
        { id: 7, name: "Bottom Row Flow", desc: "V, B, N added", keys: "v b n", text: "van ban; never even; big van; men run;" },
        { id: 8, name: "Full Keyboard Basic", desc: "X, Z, and punctuation", keys: "x z . ,", text: "zoo fix; buzz zoom; no x-ray; size zero." },
        { id: 9, name: "Common Words", desc: "Frequent English words", keys: "all", text: "the quick brown fox jumps over the lazy dog." },
        { id: 10, name: "Speed Challenge", desc: "Complex sentences", keys: "all", text: "Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!" }
    ];
    res.json(levels);
});

// Backward compatibility - redirect lessons to levels
app.get('/api/lessons', (req, res) => {
    const levels = [
        { id: 1, title: "Home Row Foundation", description: "Master ASDF JKL;", content: "asdf jkl; fads sjl; daf jkl; ask dfj;" },
        { id: 2, title: "Home Row Flow", description: "Smooth transitions on home row", content: "dad has a sad lad; flask asks; all dads fall;" },
        { id: 3, title: "Top Row Reach", description: "Introducing E and I", content: "fee see; die lie; ease idle; feel ill;" },
        { id: 4, title: "Top Row Expansion", description: "Adding R and U", content: "rare user; rude rear; rise up; real use;" },
        { id: 5, title: "Top Row Mastery", description: "Q, W, O, P added", content: "we go; pop up; own power; quiet row;" },
        { id: 6, title: "Bottom Row Basics", description: "Introducing C and M", content: "cam mac; calm man; come back; mom can;" },
        { id: 7, title: "Bottom Row Flow", description: "V, B, N added", content: "van ban; never even; big van; men run;" },
        { id: 8, title: "Full Keyboard Basic", description: "X, Z, and punctuation", content: "zoo fix; buzz zoom; no x-ray; size zero." },
        { id: 9, title: "Common Words", description: "Frequent English words", content: "the quick brown fox jumps over the lazy dog." },
        { id: 10, title: "Speed Challenge", description: "Complex sentences", content: "Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!" }
    ];
    res.json(levels);
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
