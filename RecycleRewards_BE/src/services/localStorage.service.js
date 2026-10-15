import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const uploadDirectory = path.resolve(process.cwd(), 'uploads', 'submissions');
const videoDirectory = path.resolve(uploadDirectory, 'videos');
export async function saveSubmissionFrames(frames, requestBaseUrl = '') {
  await mkdir(uploadDirectory, { recursive: true });
  const publicBaseUrl = String(process.env.PUBLIC_API_URL || requestBaseUrl).replace(/\/$/, '');
  return Promise.all(frames.map(async (frame) => {
    const match = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i.exec(String(frame || ''));
    if (!match) throw Object.assign(new Error('Frame phải là ảnh base64 hợp lệ.'), { status: 400 });
    const extension = match[1].toLowerCase() === 'jpeg' || match[1].toLowerCase() === 'jpg' ? 'jpg' : match[1].toLowerCase();
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDirectory, filename), Buffer.from(match[2], 'base64'));
    return `${publicBaseUrl}/uploads/submissions/${filename}`;
  }));
}

export async function saveSubmissionVideo(file, requestBaseUrl = '') {
  await mkdir(videoDirectory, { recursive: true });
  const extension = file.mimetype === 'video/webm' ? 'webm' : 'mp4';
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(videoDirectory, filename), file.buffer);
  const publicBaseUrl = String(process.env.PUBLIC_API_URL || requestBaseUrl).replace(/\/$/, '');
  return `${publicBaseUrl}/uploads/submissions/videos/${filename}`;
}
