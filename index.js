const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connect = require('./db/connect.js');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes.js');
const postRoutes = require('./routes/postRoutes.js');
const messageRoutes = require('./routes/messageRoutes.js');
const cloudinary = require('cloudinary').v2;

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
//middl

dotenv.config();
const PORT = process.env.PORT || 5001;
const app = express();
connect();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//middlewares
// app.use((req, res, next) => {
//   res.header(
//     'Access-Control-Allow-Origin',
//     'https://fbucks-frontend.onrender.com'
//   );
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );
//   next();
// });
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

//routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  return res.send('@hasangkz');
});

app.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}`)
);
