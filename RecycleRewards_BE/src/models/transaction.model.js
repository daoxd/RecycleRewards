import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
	type: { type: String, enum: ['submission_reward', 'adjustment', 'reversal'], required: true },
	points: { type: Number, required: true },
	description: { type: String, default: '' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

transactionSchema.index({ submissionId: 1, type: 1 }, { unique: true });
transactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
