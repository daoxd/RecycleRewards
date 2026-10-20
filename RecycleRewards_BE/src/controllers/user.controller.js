export function getCurrentUser(req, res) {
	res.json({ user: req.user.toJSON() });
}

export async function updateCurrentUser(req, res) {
	const name = String(req.body?.name || '').trim();
	if (!name) return res.status(400).json({ message: 'Tên không được để trống.' });
	req.user.name = name;
	await req.user.save();
	res.json({ user: req.user.toJSON() });
}