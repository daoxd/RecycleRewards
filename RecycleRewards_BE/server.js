import { loadEnvFile } from 'node:process';

try {
	loadEnvFile();
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}

const { default: app } = await import('./src/app.js');
const { connectDatabase } = await import('./src/config/db.js');

const PORT = process.env.PORT || 5000;
await connectDatabase();
app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));