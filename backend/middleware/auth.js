import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ status: '401', message: 'Missing token' });

    const decoded = verifyAccessToken(token);
    req.user = decoded; // { customers_id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ status: '401', message: 'Invalid or expired token' });
  }
}
