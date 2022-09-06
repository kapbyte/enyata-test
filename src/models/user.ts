

import mongoose from 'mongoose';

// An interface that describes the properties required to create a new User
interface UserAttrs {
  email: string;
  name: string;
  token: string;
}

// An interface that describes the properties that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  name: string;
  token: string;
}

const userSchema = new mongoose.Schema({
  email: { type: String },
  name: { type: String },
  token: { type: String },
  subscription: { type: String, default: 'freemium' }
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };