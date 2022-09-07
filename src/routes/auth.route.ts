import express from 'express';
const router = express.Router();

import { 
  GetLoginURLController,
  GetGoogleUser,
  AuthenticateGoogleUser,
  RevokeAccountController,
  AccessPermissionController
} from '../controllers/auth.controller';
import { verifyAuthToken } from '../middlewares/verify.token';

router.get('/google/url', GetLoginURLController);
router.get('/google', GetGoogleUser);
router.get('/verify', AuthenticateGoogleUser);
router.patch('/revoke/:user_id', verifyAuthToken, RevokeAccountController);
router.patch('/access/:user_id', verifyAuthToken, AccessPermissionController);

module.exports = router;