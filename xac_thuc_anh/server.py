import base64
import os
import time
import uuid
from pathlib import Path

import oss2
import requests
from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename


BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

API_BASE = "https://app.dayscamera.com"
TOKEN_URL = f"{API_BASE}/workgroup/v4/oss/token"
CREATE_URL = f"{API_BASE}/next/truthful/create/batch/v1"
QUERY_URL = f"{API_BASE}/next/truthful/query/batch"
DETAIL_URL = f"{API_BASE}/next/truthful/query/batch/detail"
OSS_ENDPOINT = "oss-ap-southeast-1.aliyuncs.com"
OSS_BUCKET = "global-cloud"
OSS_PUBLIC_BASE = "https://global-cloud.dayscamera.com"

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024

app = Flask(__name__, static_folder="static")
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES


class TimemarkError(RuntimeError):
    pass


def post_json(url, payload, timeout=30):
    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            timeout=timeout,
        )
        response.raise_for_status()
        data = response.json()
    except (requests.RequestException, ValueError) as exc:
        raise TimemarkError(f"Không thể kết nối dịch vụ Timemark: {exc}") from exc

    if data.get("code") != 200:
        raise TimemarkError(data.get("msg") or data.get("toast_msg") or "Timemark từ chối yêu cầu")
    return data


def upload_to_timemark_storage(file_path, extension):
    token = post_json(TOKEN_URL, {"device_id": "", "sign": ""})["data"]
    auth = oss2.StsAuth(
        token["AccessKeyId"], token["AccessKeySecret"], token["SecurityToken"]
    )
    bucket = oss2.Bucket(auth, OSS_ENDPOINT, OSS_BUCKET)
    object_key = f"antiImage/{uuid.uuid4()}.{extension}"
    with file_path.open("rb") as image_file:
        result = bucket.put_object(object_key, image_file)
    if result.status not in (200, 201):
        raise TimemarkError(f"Upload ảnh thất bại (HTTP {result.status})")
    return f"{OSS_PUBLIC_BASE}/{object_key}"


def create_task(photo_url):
    data = post_json(CREATE_URL, {"photoInfoList": [{"photoUrl": photo_url}]})
    task_id = (data.get("data") or {}).get("taskID")
    if not task_id:
        raise TimemarkError("Timemark không trả về taskID")
    return str(task_id)


def get_detail(task_id, photo_url):
    return post_json(DETAIL_URL, {"taskID": task_id, "photoUrl": photo_url})["data"]


def wait_for_result(task_id, photo_url, attempts=40, delay=1.5):
    last_message = ""
    for _ in range(attempts):
        try:
            batch = post_json(QUERY_URL, {"taskID": task_id})
            batch_data = batch.get("data") or {}
            last_message = batch_data.get("msg") or last_message
        except TimemarkError:
            pass

        try:
            detail = get_detail(task_id, photo_url)
            ext = detail.get("ext") or {}
            status_code = str(ext.get("status_code", "")).upper()
            if status_code in {"DONE", "SUCCESS", "FAILED"}:
                return detail
            # Some API versions return a final status without status_code.
            if "realStatus" in detail and detail.get("photoApplication"):
                return detail
        except TimemarkError as exc:
            last_message = str(exc)
        time.sleep(delay)
    raise TimemarkError(f"Hết thời gian chờ Timemark xử lý. {last_message}".strip())


def public_result(detail, task_id, photo_url):
    ext = detail.get("ext") or {}
    status = detail.get("status")
    real_status = detail.get("realStatus")
    status_code = str(ext.get("status_code", ""))
    verified = status == 0 and real_status == 0 and status_code.upper() == "DONE"

    location_image = detail.get("location") or ""
    if location_image and not location_image.startswith("data:"):
        location_image = f"data:image/png;base64,{location_image}"

    return {
        "success": True,
        "verified": verified,
        "verdict": "Ảnh Timemark hợp lệ" if verified else "Không thể xác thực là ảnh Timemark hợp lệ",
        "status": status,
        "realStatus": real_status,
        "statusCode": status_code,
        "taskID": task_id,
        "photoUrl": photo_url,
        "photoAddress": detail.get("photoAddress", ""),
        "photoDate": detail.get("photoDate", ""),
        "photoTime": detail.get("photoTime", ""),
        "photoTimeZone": detail.get("photoTimeZone", ""),
        "photoLatLng": detail.get("photoLatLng", ""),
        "photoApplication": detail.get("photoApplication", ""),
        "photoDevice": detail.get("photoDevice", ""),
        "photoAntiFakeCode": detail.get("photoAntiFakeCode", ""),
        "scores": {
            "lbp": ext.get("lbp_similar", ""),
            "medium": ext.get("medium_similar", ""),
            "sobel": ext.get("sobel_similar", ""),
        },
        "md5": ext.get("md5_value", ""),
        "locationMap": location_image,
    }


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.post("/api/verify")
def verify():
    image = request.files.get("image")
    if not image or not image.filename:
        return jsonify(success=False, error="Vui lòng chọn một ảnh."), 400

    safe_name = secure_filename(image.filename)
    extension = Path(safe_name).suffix.lower().lstrip(".")
    if extension not in ALLOWED_EXTENSIONS:
        return jsonify(success=False, error="Chỉ hỗ trợ JPG, PNG hoặc WebP."), 400

    temp_path = UPLOAD_DIR / f"{uuid.uuid4()}.{extension}"
    try:
        image.save(temp_path)
        if temp_path.stat().st_size == 0:
            return jsonify(success=False, error="Tệp ảnh rỗng."), 400
        photo_url = upload_to_timemark_storage(temp_path, extension)
        task_id = create_task(photo_url)
        detail = wait_for_result(task_id, photo_url)
        return jsonify(public_result(detail, task_id, photo_url))
    except TimemarkError as exc:
        return jsonify(success=False, error=str(exc)), 502
    except Exception:
        app.logger.exception("Unexpected verification error")
        return jsonify(success=False, error="Lỗi máy chủ không mong muốn."), 500
    finally:
        temp_path.unlink(missing_ok=True)


@app.errorhandler(413)
def too_large(_error):
    return jsonify(success=False, error="Ảnh vượt quá giới hạn 15 MB."), 413


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
