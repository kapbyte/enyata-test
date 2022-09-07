import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Blog } from '../models/blog';
const blogItems = require("../config/blog.json");
import { 
  JWT_SECRET,
  PREMIUM,
  FREEMIUM
} from '../config/config';


const FetchPostsByTagsController = async (req: Request, res: Response) => {
  let { page, tags } = req.query as any;

  // check if tags is invalid, then prompt user to enter valid tag (premium | freemium)
  if (tags !== PREMIUM && tags !== FREEMIUM) {
    return res.status(400).json({
      message: 'Please enter the correct permission access (premium | freemium)'
    });
  }

  // fetch token and check if this user has permission to view premium contents.
  const authHeader = req.headers;
  const userToken = authHeader['token'] as string;
  
  const decoded = jwt.verify(userToken, `${JWT_SECRET}`) as jwt.JwtPayload;
  const { access } = decoded;

  if (access === FREEMIUM && tags === PREMIUM) {
    return res.status(403).json({
      message: 'You cannot access premium content. Pls update your subscription and try again.'
    });
  }

  if (!page) {
    page = 1;
  };

  let limit = 10;

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results = {
    next: {}, previous: {}
  }

  if (endIndex < await Blog.countDocuments().exec()) {
    results.next = {
      page: parseInt(page) + 1,
      limit: limit
    }
  }

  if (startIndex > 0) {
    results.previous = {
      page: parseInt(page) - 1,
      limit: limit
    }
  }

  try {
    const data = await Blog.find({ tags: tags }).limit(limit).skip(startIndex).exec()
    res.json({
      navigation: results,
      data: data
    })
  } catch (e) {
    res.status(500).json({ message: e })
  }
};


const insertBlogPosts = async () => {
  try {
    const docs = await Blog.insertMany(blogItems);
    return Promise.resolve(docs);
  } catch (err) {
    return Promise.reject(err);
  }
};

insertBlogPosts()
  .then((docs) => console.log(docs))
  .catch((err) => console.log(err))


export {
  FetchPostsByTagsController
}