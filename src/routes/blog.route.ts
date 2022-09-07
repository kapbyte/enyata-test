import express from 'express';
const router = express.Router();
import { verifyAuthToken } from '../middlewares/verify.token';

import { 
  FetchPostsByTagsController
} from '../controllers/blog.controller';

router.get('/tags', verifyAuthToken, FetchPostsByTagsController);

module.exports = router;