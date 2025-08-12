require('dotenv').config();
const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const multer = require('multer');

// Load models
const User = require('./models/User');
const Camper = require('./models/Camper');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  })
}));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Helper middleware to expose user to views
app.use(async (req, res, next) => {
  if (req.session.userId) {
    res.locals.currentUser = await User.findById(req.session.userId);
  } else {
    res.locals.currentUser = null;
  }
  next();
});

// Authentication middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/campers');
});

app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    req.session.userId = user._id;
    res.redirect('/campers');
  } catch (err) {
    res.render('signup', { error: 'Error creating account: ' + err.message });
  }
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.render('login', { error: 'Invalid credentials' });
  }
  const match = await user.comparePassword(password);
  if (!match) {
    return res.render('login', { error: 'Invalid credentials' });
  }
  req.session.userId = user._id;
  res.redirect('/campers');
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Camper listing
app.get('/campers', async (req, res) => {
  const campers = await Camper.find();
  res.render('index', { campers, title: 'All Campers' });
});

// New camper form
app.get('/campers/new', requireLogin, (req, res) => {
  res.render('campers/new', { title: 'List Your Camper' });
});

// Create new camper
app.post('/campers', requireLogin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, pricePerDay } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';
    const camper = new Camper({
      title,
      description,
      pricePerDay,
      image,
      owner: req.session.userId,
      bookings: []
    });
    await camper.save();
    res.redirect('/campers');
  } catch (err) {
    res.render('campers/new', { error: 'Error creating camper: ' + err.message });
  }
});

// Show camper details
app.get('/campers/:id', async (req, res) => {
  const camper = await Camper.findById(req.params.id).populate('owner');
  if (!camper) {
    return res.redirect('/campers');
  }
  res.render('campers/show', { camper, error: null, success: null, title: camper.title });
});

// Book a camper
app.post('/campers/:id/book', requireLogin, async (req, res) => {
  const camper = await Camper.findById(req.params.id);
  if (!camper) {
    return res.redirect('/campers');
  }
  const { startDate, endDate } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return res.render('campers/show', { camper, error: 'Invalid booking dates.', success: null, title: camper.title });
  }
  // Check for overlap
  const overlap = camper.bookings.some(booking => {
    const existingStart = new Date(booking.startDate);
    const existingEnd = new Date(booking.endDate);
    return start <= existingEnd && end >= existingStart;
  });
  if (overlap) {
    return res.render('campers/show', { camper, error: 'These dates are already booked.', success: null, title: camper.title });
  }
  camper.bookings.push({ user: req.session.userId, startDate: start, endDate: end });
  await camper.save();
  res.render('campers/show', { camper, error: null, success: 'Booking created!', title: camper.title });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
