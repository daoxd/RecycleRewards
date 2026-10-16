
import { useCallback, useEffect, useState } from 'react';
import { adminSubmissionService } from '../services/adminSubmission.service.js';
import { useToast } from './../components/ToastProvider.jsx';

const PAGE_SIZE = 6;

const STATUS_LABELS = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
};

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function getSubmissionId(item) {
  return item.id || item._id;
}

function SubmissionGallery({ item }) {
  const images = [
    ...(Array.isArray(item.frameUrls) ? item.frameUrls : []),
    ...(item.imageUrl ? [item.imageUrl] : []),
    ...(item.imageDataUrl ? [item.imageDataUrl] : []),
  ].filter((url, index, list) => url && list.indexOf(url) === index);

  if (!images.length && !item.videoUrl) {
    return <p className="submission-no-media">Không có ảnh hoặc video.</p>;
  }

  return (
    <div className="submission-gallery">
      {images.map((url, index) => (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          key={`${url}-${index}`}
          title="Mở ảnh kích thước đầy đủ"
        >
          <img
            src={url}
            alt={`Ảnh minh họa ${index + 1}`}
            loading="lazy"
          />
        </a>
      ))}

      {item.videoUrl && (
        <div className="submission-video">
          <video controls preload="metadata" src={item.videoUrl}>
            Trình duyệt không hỗ trợ phát video.
          </video>
          <a
            className="submission-video-link"
            href={item.videoUrl}
            target="_blank"
            rel="noreferrer"
          >
            Mở video ở tab mới
          </a>
        </div>
      )}
    </div>
  );
}

export default function AdminSubmissions() {
  const { notify } = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');

  const loadSubmissions = useCallback(async () => {
    setLoading(true);

    try {
      const result = await adminSubmissionService.list({
        status,
        page,
        limit: PAGE_SIZE,
      });

      // API có thể trả về mảng trực tiếp hoặc đối tượng phân trang.
      const items = Array.isArray(result)
        ? result
        : result.items || result.submissions || result.data || [];

      setSubmissions(items);
      setTotal(Number(result.total ?? items.length));
      setTotalPages(
        Math.max(
          1,
          Number(
            result.totalPages ??
            Math.ceil(Number(result.total ?? items.length) / PAGE_SIZE)
          )
        )
      );
    } catch (error) {
      notify(error.message || 'Không thể tải danh sách bài nộp.', 'error');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [status, page, notify]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  function changeStatus(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
  }

  async function reviewSubmission(item, action) {
    const id = getSubmissionId(item);

    if (!id) {
      notify('Bài nộp không có mã định danh hợp lệ.', 'error');
      return;
    }

    const actionLabel = action === 'approve' ? 'duyệt' : 'từ chối';

    if (
      !window.confirm(
        `Bạn có chắc muốn ${actionLabel} bài nộp của ${
          item.studentName || item.studentId || 'học sinh này'
        }?`
      )
    ) {
      return;
    }

    setProcessingId(id);

    try {
      if (action === 'approve') {
        await adminSubmissionService.approve(id);
      } else {
        await adminSubmissionService.reject(id);
      }

      notify(
        action === 'approve'
          ? 'Đã duyệt bài nộp thành công.'
          : 'Đã từ chối bài nộp.',
        'success'
      );

      await loadSubmissions();
    } catch (error) {
      notify(error.message || 'Không thể xử lý bài nộp.', 'error');
    } finally {
      setProcessingId('');
    }
  }

  return (
    <main className="admin-submissions-page">
      <header className="page-header">
        <div>
          <em>KHU VỰC QUẢN TRỊ</em>
          <h1>Duyệt bài nộp rác</h1>
          <p>Kiểm tra hình ảnh và xác nhận bài nộp của học sinh.</p>
        </div>

        <button
          type="button"
          className="btn outline"
          onClick={loadSubmissions}
          disabled={loading}
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </header>

      <section className="surface submission-toolbar">
        <div className="submission-filters" aria-label="Lọc trạng thái">
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`btn ${status === value ? 'primary' : 'outline'}`}
              aria-pressed={status === value}
              onClick={() => changeStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="submission-total">
          Tổng số: {total} bài
        </span>
      </section>

      {loading ? (
        <section className="surface dashboard-state" role="status">
          Đang tải danh sách bài nộp...
        </section>
      ) : submissions.length === 0 ? (
        <section className="surface submission-empty">
          <strong>Không có bài nộp</strong>
          <p>Không tìm thấy bài nộp ở trạng thái này.</p>
        </section>
      ) : (
        <section className="submission-list">
          {submissions.map((item) => {
            const id = getSubmissionId(item);
            const busy = processingId === id;

            return (
              <article className="surface submission-card" key={id}>
                <div className="submission-card-header">
                  <div>
                    <h2>{item.studentName || 'Chưa có tên học sinh'}</h2>
                    <p>
                      Mã học sinh: {item.studentId || '—'}
                    </p>
                    <p>
                      Thời gian nộp: {formatDate(item.submittedAt)}
                    </p>
                  </div>

                  <span
                    className={`pill submission-status ${item.status || 'pending'}`}
                  >
                    {STATUS_LABELS[item.status] || item.status || 'Chờ duyệt'}
                  </span>
                </div>

                <div className="submission-details">
                  <div>
                    <span>Loại rác</span>
                    <strong>{item.wasteType || 'Chưa phân loại'}</strong>
                  </div>

                  <div>
                    <span>Khối lượng</span>
                    <strong>
                      {item.weightKg != null ? `${item.weightKg} kg` : '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Độ tin cậy AI</span>
                    <strong>
                      {item.confidence != null
                        ? `${item.confidence}%`
                        : '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Điểm thưởng</span>
                    <strong>{item.points ?? 0} điểm</strong>
                  </div>
                </div>

                <h3>Tư liệu người dùng đã gửi</h3>
                <SubmissionGallery item={item} />

                {item.feedback && (
                  <p className="submission-feedback">
                    Ghi chú: {item.feedback}
                  </p>
                )}

                {item.status === 'pending' && (
                  <div className="submission-actions">
                    <button
                      type="button"
                      className="btn primary"
                      disabled={Boolean(processingId)}
                      onClick={() => reviewSubmission(item, 'approve')}
                    >
                      {busy ? 'Đang xử lý...' : '✓ Approve'}
                    </button>

                    <button
                      type="button"
                      className="btn danger"
                      disabled={Boolean(processingId)}
                      onClick={() => reviewSubmission(item, 'reject')}
                    >
                      {busy ? 'Đang xử lý...' : '✕ Reject'}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      <nav className="submission-pagination" aria-label="Phân trang">
        <button
          type="button"
          className="btn outline"
          disabled={loading || page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          ← Trang trước
        </button>

        <span>
          Trang {page} / {totalPages}
        </span>

        <button
          type="button"
          className="btn outline"
          disabled={loading || page >= totalPages}
          onClick={() =>
            setPage((current) => Math.min(totalPages, current + 1))
          }
        >
          Trang sau →
        </button>
      </nav>
    </main>
  );
}

