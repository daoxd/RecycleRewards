"""Integration check: upload one local image and print the Timemark API result."""
import json
import sys
from pathlib import Path

from server import create_task, get_detail, upload_to_timemark_storage, wait_for_result

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

image = Path(sys.argv[1] if len(sys.argv) > 1 else "1.jpg").resolve()
if not image.is_file():
    raise SystemExit(f"File not found: {image}")

url = upload_to_timemark_storage(image, image.suffix.lower().lstrip("."))
print(f"Uploaded: {url}")
task_id = create_task(url)
print(f"Task ID: {task_id}")
detail = wait_for_result(task_id, url)
ext = detail.get("ext") or {}
summary = {
    "status": detail.get("status"),
    "realStatus": detail.get("realStatus"),
    "status_code": ext.get("status_code"),
    "photoAddress": detail.get("photoAddress"),
    "photoDate": detail.get("photoDate"),
    "photoTime": detail.get("photoTime"),
    "photoTimeZone": detail.get("photoTimeZone"),
    "photoLatLng": detail.get("photoLatLng"),
    "photoApplication": detail.get("photoApplication"),
    "photoDevice": detail.get("photoDevice"),
    "photoAntiFakeCode": detail.get("photoAntiFakeCode"),
    "lbp_similar": ext.get("lbp_similar"),
    "medium_similar": ext.get("medium_similar"),
    "sobel_similar": ext.get("sobel_similar"),
    "md5_value": ext.get("md5_value"),
}
print(json.dumps(summary, ensure_ascii=False, indent=2))
