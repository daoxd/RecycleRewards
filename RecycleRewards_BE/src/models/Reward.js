import mongoose from 'mongoose';

const { Schema } = mongoose;

const rewardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

rewardSchema.index({ pointsRequired: 1, quantity: -1 });

const Reward = mongoose.model('Reward', rewardSchema);

export default Reward;
