import mongoose from 'mongoose';

export async function connectDatabase() {
	const uri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/recycle_rewards');
	if (!uri) throw new Error('Thiếu MONGODB_URI để kết nối MongoDB.');
	try {
		await mongoose.connect(uri);
	} catch (error) {
		throw new Error(`Không thể kết nối MongoDB: ${error.message}`);
	}
	console.log('MongoDB connected');
}

export function databaseState() {
	return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
