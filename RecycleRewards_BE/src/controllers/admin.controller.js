import mongoose from 'mongoose';
import { Submission } from '../models/submission.model.js';
import { Transaction } from '../models/transaction.model.js';
import { User } from '../models/user.model.js';

export async function getStatistics(_req, res) {
  const [totalUsers, [summary = {}]] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Submission.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalWasteKg: { $sum: '$weightKg' }, totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  res.json({ totalUsers, totalWasteKg: summary.totalWasteKg || 0, totalPoints: summary.totalPoints || 0 });
}

export async function listSubmissions(req, res) {
  const { status } = req.query;
  const items = await Submission.find(status ? { status } : {}).sort({ submittedAt: -1 });
  res.json(items.map((item) => item.toJSON()));
}

export async function reviewSubmission(req, res) {
  const { status, feedback } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Trạng thái duyệt không hợp lệ.' });
  if (status === 'rejected' && !String(feedback || '').trim()) return res.status(400).json({ message: 'Cần nhập lý do từ chối.' });

  const session = await mongoose.startSession();
  let reviewed;
  try {
    await session.withTransaction(async () => {
      const item = await Submission.findOneAndUpdate(
        { _id: req.params.id, status: 'pending' },
        { $set: { status, feedback: status === 'rejected' ? String(feedback).trim() : '', points: status === 'approved' ? 5 : 0, reviewedAt: new Date(), reviewedBy: req.user._id } },
        { new: true, session },
      );
      if (!item) throw Object.assign(new Error('Không tìm thấy bài nộp hoặc bài đã được xử lý.'), { status: 404 });

      if (status === 'approved') {
        await Transaction.create([{ userId: item.userId, submissionId: item._id, type: 'submission_reward', points: 5, description: 'Điểm thưởng vật phẩm tái chế', createdBy: req.user._id }], { session });
        await User.findByIdAndUpdate(item.userId, { $inc: { pointsBalance: 5 } }, { session });
      }
      reviewed = item;
    });
  } finally {
    await session.endSession();
  }
  res.json(reviewed.toJSON());
}
