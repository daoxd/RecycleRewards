import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	firebaseUid: { type: String, unique: true, sparse: true, trim: true },
	email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
	name: { type: String, required: true, trim: true },
	studentId: { type: String, unique: true, sparse: true, trim: true },
	school: { type: String, default: 'Không', trim: true },
	role: { type: String, enum: ['student', 'admin'], default: 'student' },
	picture: { type: String, default: '' },
	pointsBalance: { type: Number, default: 0, min: 0 },
}, {
	timestamps: true,
	toJSON: {
		transform: (_doc, ret) => {
			ret.id = ret._id.toString();
			ret.uid = ret.firebaseUid;
			delete ret._id;
			delete ret.__v;
			delete ret.firebaseUid;
			return ret;
		},
	},
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function findOrCreateGoogleUser(profile) {
	const adminEmails = String(process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
	let user = await User.findOne({ firebaseUid: profile.uid });
	if (!user) {
		user = await User.create({
			firebaseUid: profile.uid,
			email: profile.email,
			name: profile.name || profile.email || 'Người dùng Google',
			picture: profile.picture || '',
			studentId: profile.uid,
			role: adminEmails.includes(String(profile.email || '').toLowerCase()) ? 'admin' : 'student',
			school: 'Đại học Công nghệ GTVT',
		});
	} else {
		user.email = profile.email || user.email;
		user.name = profile.name || user.name;
		user.picture = profile.picture || user.picture;
		if (adminEmails.includes(String(user.email || '').toLowerCase())) user.role = 'admin';
		await user.save();
	}
	return user;
}
