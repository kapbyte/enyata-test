import express from 'express';
const router = express.Router();

import { 
  GetLoginURLController,
  GetGoogleUser,
  AuthenticateGoogleUser
} from '../controllers/auth.controller';

router.get('/google/url', GetLoginURLController);
router.get('/google', GetGoogleUser);
router.get('/verify', AuthenticateGoogleUser);

module.exports = router;