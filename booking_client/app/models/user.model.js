import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  favouriteEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  followingUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bio: { type: String, default: '' },
  image: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.plugin(uniqueValidator);

userSchema.pre('save', function (next) {
  if (!this.image || String(this.image).trim() === '') {
    const seed = this.email || this.username || String(this._id);
    this.image = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;
  }
  next();
});

userSchema.methods.toUserResponse = function (jwt_access) {
  return {
    username: this.username,
    email: this.email,
    bio: this.bio,
    image: this.image,
    role: this.role,
    accessToken: jwt_access
  };
};

userSchema.methods.toProfileJSON = function (user) {
  return {
    username: this.username,
    bio: this.bio,
    image: this.image,
    email: this.email,
    following: user ? user.isFollowing(this._id) : false
  };
};

userSchema.methods.isFollowing = function (id) {
  const idStr = id.toString();
  for (const followingUser of this.followingUsers) {
    if (followingUser.toString() === idStr) {
      return true;
    }
  }
  return false;
};

userSchema.methods.follow = function (id) {
  if (this.followingUsers.indexOf(id) === -1) {
    this.followingUsers.push(id);
  }
  return this.save();
};

userSchema.methods.unfollow = function (id) {
  if (this.followingUsers.indexOf(id) !== -1) {
    this.followingUsers.remove(id);
  }
  return this.save();
};

userSchema.methods.isFavourite = function (id) {
  const idStr = id.toString();
  for (const article of this.favouriteEvents) {
    if (article.toString() === idStr) {
      return true;
    }
  }
  return false;
};

userSchema.methods.favorite = function (id) {
  if (this.favouriteEvents.indexOf(id) === -1) {
    this.favouriteEvents.push(id);
  }

  // const event = await Event.findById(id).exec();
  //
  // event.favouritesCount += 1;
  //
  // await event.save();

  return this.save();
}

userSchema.methods.unfavorite = function (id) {
  if (this.favouriteEvents.indexOf(id) !== -1) {
    this.favouriteEvents.remove(id);
  }

  // const event = await Event.findById(id).exec();
  //
  // event.favouritesCount -= 1;
  //
  // await event.save();

  return this.save();
};

export default mongoose.model('User', userSchema);
