import { authService } from './auth.service.js';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

export async function getAdminDashboard() {
  const submissions = await authService.adminSubmissions();
  if (!Array.isArray(submissions)) throw new Error('Dữ liệu thống kê từ máy chủ không hợp lệ.');

  const approved = submissions.filter((item) => item.status === 'approved');
  const countsByDate = new Map();
  const countsByType = new Map();

  approved.forEach((item) => {
    const date = formatDate(item.submittedAt);
    if (date) countsByDate.set(date, (countsByDate.get(date) || 0) + 1);
    const type = String(item.wasteType || '').trim();
    if (type) countsByType.set(type, (countsByType.get(type) || 0) + 1);
  });

  const submitters = new Set(submissions.map((item) => item.studentId).filter(Boolean));
  const issuedPoints = approved.reduce((total, item) => total + (Number(item.points) || 0), 0);

  return {
    totalSubmissions: submissions.length,
    approvedCount: approved.length,
    pendingCount: submissions.filter((item) => item.status === 'pending').length,
    submitterCount: submitters.size,
    issuedPoints,
    dailyApproved: [...countsByDate.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-7),
    approvedByType: [...countsByType.entries()].sort(([, a], [, b]) => b - a),
  };
}
