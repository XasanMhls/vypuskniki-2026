import mongoose from 'mongoose';

const awardSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '🏆' },
    nominees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      },
    ],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Award', awardSchema);
