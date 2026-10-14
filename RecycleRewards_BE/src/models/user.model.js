export const studentProfile = { name: 'Nguyễn Minh Anh', studentId: 'HS-2024-018', school: 'THCS Nguyễn Du', role: 'student' };
export const adminProfile = { name: 'Cô Thu Hà', studentId: 'GV-003', school: 'THCS Nguyễn Du', role: 'admin' };

const googleUsers = new Map();

export function findOrCreateGoogleUser(profile) {
	const existingUser = googleUsers.get(profile.uid);
	const user = {
		...(existingUser || {}),
		uid: profile.uid,
		email: profile.email || existingUser?.email || '',
		name: profile.name || existingUser?.name || profile.email || 'Người dùng Google',
		picture: profile.picture || existingUser?.picture || '',
		role: existingUser?.role || 'student',
		studentId: existingUser?.studentId || profile.uid,
		school: existingUser?.school || 'THCS Nguyễn Du',
	};
	googleUsers.set(profile.uid, user);
	return user;
}
