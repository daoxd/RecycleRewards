import { createSubmission, submissions } from '../models/submission.model.js';

const AI_CONFIDENCE_THRESHOLD = 80;

export function listMine(req, res) {
  const { studentId } = req.query;
  res.json(submissions.filter((item) => !studentId || item.studentId === studentId));
}

export function studentDashboard(req, res) {
  const items = submissions.filter((item) => item.studentId === req.params.studentId);
  const approved = items.filter((item) => item.status === 'approved');
  res.json({
    totalPoints: approved.reduce((total, item) => total + item.points, 0),
    totalSubmissions: items.length,
    approvedCount: approved.length,
    pendingCount: items.filter((item) => item.status === 'pending').length,
    recent: [...items].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 4),
  });
}

export function submitWaste(req, res) {
  const { studentName, studentId, wasteType, confidence, weightKg, imageDataUrl } = req.body;
  if (!studentName || !studentId || !wasteType) return res.status(400).json({ message: 'Thiếu thông tin vật phẩm.' });
  const parsedWeightKg = Number(weightKg || 0);
  if (!Number.isFinite(parsedWeightKg) || parsedWeightKg < 0) {
    return res.status(400).json({ message: 'Khối lượng phải là số không âm.' });
  }
  res.status(201).json(createSubmission({
    studentName,
    studentId,
    wasteType,
    confidence: Number(confidence) || 88,
    weightKg: parsedWeightKg,
    imageDataUrl,
  }));
}

export function checkAi(req, res) {
  const confidence = Number(req.body?.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
    return res.status(400).json({ message: 'Confidence phải là số trong khoảng từ 0 đến 100.' });
  }

  if (confidence < AI_CONFIDENCE_THRESHOLD) {
    return res.status(422).json({
      accepted: false,
      confidence,
      threshold: AI_CONFIDENCE_THRESHOLD,
      message: 'Kết quả AI không đạt độ chính xác tối thiểu 80%.',
    });
  }

  return res.json({
    accepted: true,
    confidence,
    threshold: AI_CONFIDENCE_THRESHOLD,
    message: 'Kết quả AI hợp lệ, bài nộp được phép chuyển sang chờ duyệt.',
  });
}
