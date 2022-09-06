import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 8080;

// Routers
const authRouter = require('./routes/auth.route');

app.use(
  cors({
    // Sets Access-Control-Allow-Origin to the UI URI
    // origin: UI_ROOT_URI,
    // Sets Access-Control-Allow-Credentials to true
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);

// Start server 
const main = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`);
    app.listen(port, () => {
      console.log(`Server listening on port: ${port}`);
    })
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();