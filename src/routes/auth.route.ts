import express from 'express';
const router = express.Router();

import { 
  GetLoginURLController,
  GetGoogleUser,
  AuthenticateGoogleUser,
  RevokeAccountController
} from '../controllers/auth.controller';

router.get('/google/url', GetLoginURLController);
router.get('/google', GetGoogleUser);
router.get('/verify', AuthenticateGoogleUser);
router.patch('/revoke/:user_id', RevokeAccountController);

module.exports = router;