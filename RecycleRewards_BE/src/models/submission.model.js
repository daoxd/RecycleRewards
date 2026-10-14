import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
	studentName: { type: String, required: true, trim: true },
	studentId: { type: String, required: true, trim: true, index: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
	wasteType: { type: String, required: true, trim: true },
	confidence: { type: Number, min: 0, max: 100, default: 0 },
	status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
	points: { type: Number, default: 0, min: 0 },
	weightKg: { type: Number, default: 0, min: 0 },
	imageDataUrl: { type: String, default: '' },
	imageUrl: { type: String, default: '' },
	feedback: { type: String, default: '' },
	submittedAt: { type: Date, default: Date.now, index: true },
	reviewedAt: Date,
	reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } } });

submissionSchema.index({ studentId: 1, submittedAt: -1 });
submissionSchema.index({ status: 1, submittedAt: -1 });

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
