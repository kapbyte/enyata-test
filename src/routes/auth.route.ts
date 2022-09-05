import express from 'express';
const router = express.Router();

import { 
  userSignupController,
} from '../controllers/auth.controller';

router.post('/signup', userSignupController);

module.exports = router;