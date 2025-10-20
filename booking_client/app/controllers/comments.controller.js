// controllers/comments.controller.js
import asyncHandler from 'express-async-handler';
import Event from '../models/evento.model.js';
import User from '../models/user.model.js';
import Comment from '../models/comments.model.js';

// POST /:slug/comments (requiere verifyJWT tal cual ya lo tienes)
export const createComment = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const commenter = await User.findById(userId).exec();
  if (!commenter) return res.status(401).json({ message: 'User Not Found' });

  const { slug } = req.params;
  const event = await Event.findOne({ slug }).exec();
  if (!event) return res.status(404).json({ message: 'Event Not Found' });

  const body = req.body?.comment?.body?.trim?.();
  if (!body) return res.status(400).json({ message: 'comment.body is required' });

  const newComment = await Comment.create({
    body,
    author: commenter._id,     // 👈 guarda autor
    event: event._id,
  });

  // si tu Event tiene helper:
  if (typeof event.addComment === 'function') await event.addComment(newComment._id);
  else {
    event.comments = event.comments || [];
    event.comments.push(newComment._id);
    await event.save();
  }

  return res.status(201).json({
    // 👈 IMPORTANTE: await
    comment: await newComment.toCommentResponse(commenter),
  });
});

// GET /:slug/comments (déjalo público o con optional que no devuelva 4xx)
export const listComments = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const event = await Event.findOne({ slug }).exec();
  if (!event) return res.status(404).json({ message: 'Event Not Found' });

  // quién mira (para toProfileJSON): opcional
  const viewer = req.userId ? await User.findById(req.userId).exec() : null;

  // Igual que tu otro proyecto: Promise.all sobre cada id
  const comments = await Promise.all(
    (event.comments || []).map(async (commentId) => {
      const c = await Comment.findById(commentId).exec();
      if (!c) return null;
      return await c.toCommentResponse(viewer || false); // 👈 IMPORTANTE: await
    })
  );

  // filtra nulos si hubiera ids huérfanos
  return res.status(200).json({ comments: comments.filter(Boolean) });
});

// DELETE /:slug/comments/:id (requiere verifyJWT tal cual ya lo tienes)
export const deleteComment = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId).exec();
  if (!user) return res.status(401).json({ message: 'User Not Found' });

  const { slug, id } = req.params;

  const event = await Event.findOne({ slug }).exec();
  if (!event) return res.status(404).json({ message: 'Event Not Found' });

  const comment = await Comment.findById(id).exec();
  if (!comment) return res.status(404).json({ message: 'Comment Not Found' });

  // seguridad: pertenece al evento
  if (comment.event.toString() !== event._id.toString()) {
    return res.status(400).json({ message: 'Comment does not belong to this event' });
  }

  // solo autor o admin (si tienes role)
  const isOwner = comment.author?.toString() === user._id.toString();
  const isAdmin = (user.role || 'user') === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Only the author or an admin can delete this comment' });
  }

  if (typeof event.removeComment === 'function') await event.removeComment(comment._id);
  else {
    event.comments = (event.comments || []).filter(cId => cId.toString() !== comment._id.toString());
    await event.save();
  }

  await Comment.deleteOne({ _id: comment._id });
  return res.status(204).send();
});
