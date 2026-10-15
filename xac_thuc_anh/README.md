# TrueFrame – xác thực ảnh Timemark

Web app dùng JavaScript ở giao diện và Flask/Python ở server để gửi ảnh tới hạ tầng mà trang `verify.timemark.com` sử dụng, sau đó đọc kết quả từ API DaysCamera.

## Chạy local

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
```

Mở `http://localhost:5000`. Để kiểm tra trực tiếp bằng ảnh mẫu:

```powershell
python test_timemark_api.py 1.jpg
```

## Luồng API

1. Lấy STS token tại `/workgroup/v4/oss/token`.
2. Upload ảnh vào thư mục `antiImage/` trên OSS.
3. Tạo task tại `/next/truthful/create/batch/v1`.
4. Poll `/next/truthful/query/batch` và gọi `/next/truthful/query/batch/detail`.
5. `status = 0`, `realStatus = 0`, `ext.status_code = DONE` được coi là hợp lệ.

Các endpoint trên không có tài liệu công khai và có thể thay đổi. Khi triển khai production, nên thêm rate limiting, hàng đợi nền và chính sách lưu trữ/quyền riêng tư phù hợp.
