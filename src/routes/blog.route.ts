import express from 'express';
const router = express.Router();

import { 
  FetchPostsByTagsController
} from '../controllers/blog.controller';

router.get('/tags', FetchPostsByTagsController);

module.exports = router;