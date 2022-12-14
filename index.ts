import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { MONGO_URI } from './src/config/config'

const app = express();
const port = process.env.PORT || 8080;

// Routers
const authRouter = require('./src/routes/auth.route');
const blogRouter = require('./src/routes/blog.route');

app.use(
  cors({
    // Sets Access-Control-Allow-Credentials to true
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/blog', blogRouter);


const main = async () => {
  try {
    await mongoose.connect(`${MONGO_URI}`);
    app.listen(port, () => {
      console.log(`Server listening on port: ${port}`);
    })
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();