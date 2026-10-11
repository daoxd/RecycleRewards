import Submission from '../models/Submission.js';

const submissionStatuses = ['pending', 'approved', 'rejected'];

export async function listSubmissions(req, res, next) {
  const { status } = req.query;

  if (status !== undefined && (typeof status !== 'string' || !submissionStatuses.includes(status))) {
    return res.status(400).json({ message: 'Trạng thái bài nộp không hợp lệ.' });
  }

  try {
    const filter = status ? { status } : {};
    const submissions = await Submission.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    return res.json(submissions);
  } catch (error) {
    return next(error);
  }
}
