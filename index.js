const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connect = require('./db/connect.js');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes.js');
const postRoutes = require('./routes/postRoutes.js');

dotenv.config();
connect();

const app = express();
const PORT = process.env.PORT || 5001;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
  return res.send('@hasangkz');
});

app.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}`)
);
