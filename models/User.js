import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['client', 'freelancer', 'agency'], required: true },
  tokens: { type: Number, default: 0 },
  isSubscribed: { type: Boolean, default: false },
  subscriptionPlan: { type: String },
  profileImage: { type: String },
  skills: [{ type: String }],
  bio: { type: String },
  rating: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  governmentId: { type: String },
  isVerified: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.disburseInitialTokens = function() {
  switch (this.userType) {
    case 'client':
      this.tokens += 50;
      break;
    case 'freelancer':
      this.tokens += 100;
      break;
    case 'agency':
      this.tokens += 200;
      break;
  }
};

const User = mongoose.model('User', userSchema);
export default User;