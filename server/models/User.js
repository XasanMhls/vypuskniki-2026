import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    approved: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    quote: { type: String, default: '' },
    dream: { type: String, default: '' },
    phone: { type: String, default: '' },
    socialLinks: {
      vk: { type: String, default: '' },
      telegram: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    achievements: [String],
    nickname: { type: String, default: '' },
    favoriteMemory: { type: String, default: '' },
    favoriteTeacher: { type: String, default: '' },
    favoriteSubject: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
