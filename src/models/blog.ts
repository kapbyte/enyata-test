import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  name: {type: String, required: true},
  year: {type: Number, required: true},
  tags: {type: String, required: true},
  read_count: {type: Number, required: true},
  comments: {type: [String], required: true},
  likes: {type: Number, required: true},
  shares: {type: Number, required: true}
});

const Blog = mongoose.model("blog", blogSchema);

export { Blog };