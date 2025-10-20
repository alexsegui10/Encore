// models/comments.model.js
import mongoose from 'mongoose';
import User from './user.model.js';

const commentSchema = new mongoose.Schema(
  {
    body:   { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event:  { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  },
  { timestamps: true }
);

commentSchema.methods.toCommentResponse = async function (viewerUser) {
  const authorDoc = await User.findById(this.author).exec();

  // Usa toProfileJSON si existe, pero SIEMPRE añade id
  const base =
    authorDoc?.toProfileJSON
      ? authorDoc.toProfileJSON(viewerUser)
      : {
          username: authorDoc?.username ?? null,
          image: authorDoc?.image ?? null,
          bio: authorDoc?.bio ?? null,
          email: authorDoc?.email ?? null,
        };

  const author = {
    id: authorDoc?._id?.toString?.() ?? this.author?.toString?.() ?? null, 
    ...base,
  };

  return {
    id: this._id.toString(),
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    author,
  };
};

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
