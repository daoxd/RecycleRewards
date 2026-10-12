import { useEffect, useMemo, useState } from 'react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getAdminDashboard } from '../services/adminDashboard.service.js';
import { useToast } from '../components/ToastProvider.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const number = (value) => new Intl.NumberFormat('vi-VN').format(value);
const colors = ['#0b9265', '#63bd91', '#f0b84b', '#7099cf', '#dc8178', '#9a83ca'];
const shortDate = (value) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));

function Header() {
  return <header className="page-header">
    <div><em>KHU VỰC QUẢN TRỊ</em><h1>Tổng quan tái chế</h1><p>Dữ liệu lấy từ API bài nộp; backend hiện trả dữ liệu demo trong bộ nhớ.</p></div>
  </header>;
}

function Stat({ icon, value, label, detail }) {
  return <article className="metric admin-stat">
    <b>{icon}</b><strong>{value}</strong><span>{label}</span><small>{detail}</small>
  </article>;
}

function ChartCard({ title, subtitle, children }) {
  return <section className="surface chart-card">
    <div className="section-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>
    {children}
  </section>;
}

function EmptyChart({ message }) {
  return <div className="chart-empty" role="status"><strong>Chưa có dữ liệu biểu đồ</strong><span>{message}</span></div>;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    getAdminDashboard().then((result) => {
      if (active) {
        setData(result);
        setError('');
      }
    }).catch((requestError) => {
      if (active) {
        setError(requestError.message || 'Không thể tải dữ liệu thống kê.');
        notify(requestError.message || 'Không thể tải dữ liệu thống kê.', 'error');
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [notify]);

  const dailyData = useMemo(() => data && ({
    labels: data.dailyApproved.map(([date]) => shortDate(date)),
    datasets: [{
      label: 'Lượt bài nộp được duyệt',
      data: data.dailyApproved.map(([, count]) => count),
      backgroundColor: '#17a875',
      borderRadius: 6,
      maxBarThickness: 48,
    }],
  }), [data]);

  const typeData = useMemo(() => data && ({
    labels: data.approvedByType.map(([type]) => type),
    datasets: [{
      label: 'Lượt bài nộp được duyệt',
      data: data.approvedByType.map(([, count]) => count),
      backgroundColor: data.approvedByType.map((_, index) => colors[index % colors.length]),
      borderWidth: 0,
    }],
  }), [data]);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Lượt duyệt' } },
    },
  }), []);
  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 18 } } },
  }), []);

  return <>
    <Header />
    {loading ? <section className="surface dashboard-state" role="status">Đang tải thống kê...</section>
      : error ? <section className="surface dashboard-state"><div className="error-state" role="alert">⚠ {error}</div></section>
        : data && <>
          <section className="metric-grid admin-metric-grid" aria-label="Chỉ số tổng quan">
            <Stat icon="♻" value={number(data.totalSubmissions)} label="Tổng lượt gửi" detail="Tất cả trạng thái" />
            <Stat icon="✓" value={number(data.approvedCount)} label="Đã được duyệt" detail="Lượt tái chế đã xác nhận" />
            <Stat icon="◷" value={number(data.pendingCount)} label="Đang chờ duyệt" detail="Cần admin kiểm tra" />
            <Stat icon="♙" value={number(data.submitterCount)} label="Người gửi có hoạt động" detail="Tài khoản có bài nộp" />
            <Stat icon="★" value={number(data.issuedPoints)} label="Điểm đã phát hành" detail="Tổng điểm của bài đã duyệt" />
          </section>
          <p className="dashboard-data-note">Biểu đồ dùng số lượt bài nộp được duyệt; API hiện chưa cung cấp khối lượng rác (kg) hoặc tổng số tài khoản.</p>
          {data.approvedCount === 0
            ? <section className="surface"><EmptyChart message="Biểu đồ sẽ hiển thị khi có bài nộp được duyệt." /></section>
            : <section className="chart-grid">
              <ChartCard title="Lượt tái chế theo ngày" subtitle="Tối đa 7 ngày có dữ liệu · Đơn vị: lượt đã duyệt">
                {data.dailyApproved.length ? <div className="chart-wrap"><Bar data={dailyData} options={barOptions} /></div> : <EmptyChart message="Chưa có ngày hợp lệ trong dữ liệu bài nộp." />}
              </ChartCard>
              <ChartCard title="Cơ cấu theo loại rác" subtitle="Theo số lượt đã duyệt · Đơn vị: lượt">
                {data.approvedByType.length ? <div className="chart-wrap chart-wrap-doughnut"><Doughnut data={typeData} options={doughnutOptions} /></div> : <EmptyChart message="Chưa có phân loại rác được duyệt." />}
              </ChartCard>
            </section>}
        </>}
  </>;
}
