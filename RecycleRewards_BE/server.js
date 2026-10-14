import { loadEnvFile } from 'node:process';

try {
	loadEnvFile();
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}

const { default: app } = await import('./src/app.js');

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));
}
exports.api = onRequest(app);