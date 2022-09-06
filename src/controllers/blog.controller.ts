import { Request, Response } from 'express';
import { Blog } from '../models/blog';
const blogItems = require("../config/blog.json");

// const FetchBlogPostsController = async (req: Request, res: Response) => {
  // try {
  //   let { page, size } = req.query as any;

    // if (!page) {
    //   page = 1;
    // }

  //   if (!size) {
  //     size = 10;
  //   }

  //   const limit = parseInt(size)
  //   const skipIndex = (page - 1) * size;

  //   const results = await Blog.find()
  //     .limit(limit)
  //     .skip(skipIndex)

  //   // const userQuery = req.query.tags;

  //   res.send({
  //     page,
  //     data: results
  //   });
  // } catch (error) {
  //   console.log(error);
  //   process.exit(1);
  // }
// };

// const FetchPostsByTagsController = async (req: Request, res: Response) => {
//   try {
//     let { tags, page } = req.query as any;
//     console.log('tags -> ', tags);

//     let count = await Blog.countDocuments().exec();
//     console.log('counter => ', count);

//   //   const limit = 10;
//   //   let results = {
//   //     next: {}, previous: {}, results: {}
//   //   };

//   //   const startIndex = (page - 1) * limit
//   //   const endIndex = page * limit;

//   //   if (endIndex < await Blog.countDocuments().exec()) {
//   //     results.next = {
//   //       page: page + 1,
//   //       limit: limit
//   //     }
//   //   }

//   //   if (startIndex > 0) {
//   //     results.previous = {
//   //       page: page - 1,
//   //       limit: limit
//   //     }
//   //   }

//   //   try {
//   //     results.results = await Blog.find().limit(limit).skip(startIndex).exec()
//   //     res.send(results);
//   //   } catch (e) {
//   //     res.status(500).json({ message: e })
//   //   }
//   } catch (error) {
//     res.status(501).json({ message: error });
//   }
// };


const FetchPostsByTagsController = async (req: Request, res: Response) => {
  let { page, tags } = req.query as any;

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