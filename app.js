const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

const uri = process.env.MONGO_URI || "mongodb+srv://admin:admin123@movielens.yc209.mongodb.net/?retryWrites=true&w=majority&appName=movielens";
let db;

async function startServer() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        db = client.db('movielens');
        console.log("Connected to MongoDB Atlas");

        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}

startServer();

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Utility functions
function groupMoviesByGenre(movies) {
    const grouped = movies.reduce((result, movie) => {
        const genres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
        genres.forEach(genre => {
            const genreKey = genre.toLowerCase();
            if (!result[genreKey]) result[genreKey] = [];
            result[genreKey].push(movie);
        });
        return result;
    }, {});
    return Object.keys(grouped).sort().reduce((sorted, key) => {
        sorted[key] = grouped[key];
        return sorted;
    }, {});
}

function calculateAverageRating(movie) {
    if (movie.ratings && movie.ratings.length > 0) {
        const totalRating = movie.ratings.reduce((sum, rating) => sum + rating, 0);
        return (totalRating / movie.ratings.length).toFixed(1);
    }
    return 0;
}

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session({
        secret: 'secret-key',
        resave: false,
        saveUninitialized: true
    })
);

app.set('view engine', 'ejs');

function checkAdmin(req, res, next) {
    req.isAdmin = req.session.isAdmin || false;
    next();
}

// Routes
app.get('/', checkAdmin, async (req, res) => {
    try {
        const movies = await db.collection('movies').find().toArray();
        const newlyAddedMovies = movies.slice(-10);
        const groupedMovies = groupMoviesByGenre(movies);
        res.render('index', { movies, newlyAddedMovies, groupedMovies, isAdmin: req.isAdmin });
    } catch (err) {
        console.error('Error fetching movies:', err);
        res.redirect('/');
    }
});

app.get('/search', checkAdmin, async (req, res) => {
    const query = req.query.query ? req.query.query.toLowerCase() : '';
    try {
        const movies = await db.collection('movies').find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { actors: { $regex: query, $options: 'i' } },
                { genre: { $elemMatch: { $regex: query, $options: 'i' } } }
            ]
        }).toArray();

        const groupedMovies = groupMoviesByGenre(movies);
        res.render('index', { movies, groupedMovies, isAdmin: req.isAdmin });
    } catch (err) {
        console.error('Error searching movies:', err);
        res.redirect('/');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/');
    } else {
        res.render('login', { error: 'Invalid credentials. Please try again.' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/');
        res.redirect('/');
    });
});
