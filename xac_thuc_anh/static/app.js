const form = document.querySelector('#upload-form');
const input = document.querySelector('#image-input');
const dropZone = document.querySelector('#drop-zone');
const preview = document.querySelector('#preview');
const fileMeta = document.querySelector('#file-meta');
const fileName = document.querySelector('#file-name');
const fileSize = document.querySelector('#file-size');
const removeButton = document.querySelector('#remove-file');
const submitButton = document.querySelector('#submit-button');
const emptyResult = document.querySelector('#empty-result');
const loadingResult = document.querySelector('#loading-result');
const result = document.querySelector('#verification-result');
let selectedFile = null;

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const formatBytes = bytes => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

function chooseFile(file) {
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showError('Định dạng không được hỗ trợ. Hãy chọn JPG, PNG hoặc WebP.'); return;
  }
  if (file.size > 15 * 1024 * 1024) { showError('Ảnh vượt quá giới hạn 15 MB.'); return; }
  selectedFile = file;
  preview.src = URL.createObjectURL(file);
  dropZone.classList.add('has-file');
  fileMeta.hidden = false;
  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);
  submitButton.disabled = false;
}

function clearFile() {
  if (preview.src) URL.revokeObjectURL(preview.src);
  selectedFile = null; input.value = ''; preview.src = '';
  dropZone.classList.remove('has-file'); fileMeta.hidden = true; submitButton.disabled = true;
}

function showError(message) {
  emptyResult.hidden = true; loadingResult.hidden = true; result.hidden = false;
  result.innerHTML = `<div class="error-box"><h2>Chưa thể xác thực</h2><p>${escapeHtml(message)}</p></div>`;
}

function detail(label, value) {
  return `<div class="detail"><small>${label}</small><strong>${escapeHtml(value || '—')}</strong></div>`;
}

function showResult(data) {
  const time = [data.photoTime, data.photoDate, data.photoTimeZone].filter(Boolean).join(' · ');
  result.innerHTML = `
    <div class="verdict ${data.verified ? '' : 'fail'}"><small>${escapeHtml(data.statusCode || 'KẾT QUẢ')}</small><h2>${escapeHtml(data.verdict)}</h2></div>
    <div class="details">
      ${detail('Ứng dụng', data.photoApplication)}${detail('Thiết bị', data.photoDevice)}
      ${detail('Thời gian', time)}${detail('Địa điểm', data.photoAddress)}
      ${detail('Tọa độ', data.photoLatLng)}${detail('Mã chống giả', data.photoAntiFakeCode)}
      ${detail('LBP similarity', data.scores?.lbp)}${detail('Medium similarity', data.scores?.medium)}
      ${detail('Sobel similarity', data.scores?.sobel)}${detail('Task ID', data.taskID)}
    </div>`;
  emptyResult.hidden = true; loadingResult.hidden = true; result.hidden = false;
}

input.addEventListener('change', () => chooseFile(input.files[0]));
removeButton.addEventListener('click', clearFile);
['dragenter','dragover'].forEach(event => dropZone.addEventListener(event, e => { e.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave','drop'].forEach(event => dropZone.addEventListener(event, e => { e.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', e => chooseFile(e.dataTransfer.files[0]));

form.addEventListener('submit', async event => {
  event.preventDefault(); if (!selectedFile) return;
  submitButton.disabled = true; submitButton.querySelector('span').textContent = 'Đang xác thực…';
  emptyResult.hidden = true; result.hidden = true; loadingResult.hidden = false;
  const body = new FormData(); body.append('image', selectedFile, selectedFile.name);
  try {
    const response = await fetch('/api/verify', { method:'POST', body });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Yêu cầu thất bại.');
    showResult(data);
  } catch (error) { showError(error.message); }
  finally { submitButton.disabled = false; submitButton.querySelector('span').textContent = 'Xác thực lại'; }
});
