import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      index: 'text'
    },
    embedding: {
      type: [Number],
      required: true
    },
    metadata: {
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
      },
      slug: String,
      title: String,
      category: String,
      price: Number,
      currency: String,
      date: Date,
      location: String
    }
  },
  { timestamps: true }
);

DocumentSchema.index({ text: 'text' });

export default mongoose.model('Document', DocumentSchema);
