import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    photos: [
      {
        url: { type: String },
        caption: { type: String, default: '' },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Album', albumSchema);
