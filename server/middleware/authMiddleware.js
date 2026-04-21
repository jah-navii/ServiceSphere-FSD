import { verifyToken, extractToken } from '../utils/jwtUtils.js';

/**
 * requireAuth(...allowedRoles)
 *
 *   requireAuth()                  → any authenticated user
 *   requireAuth('seeker')          → seekers only
 *   requireAuth('admin','moderator')→ either role
 */
export const requireAuth = (...allowedRoles) =>
  (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
      }

      const decoded = verifyToken(token);

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
      }

      req.user = decoded;
      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
    }
  };

// ── Backward-compat named exports (thin wrappers) ────────────────────────────
export const isAuthenticated  = requireAuth();
export const isAdministrator  = requireAuth('administrator');
export const isModerator      = requireAuth('moderator');
export const isHelper         = requireAuth('helper');
export const isSeeker         = requireAuth('seeker');

// ── Redirect guard for login/signup pages ────────────────────────────────────
export const redirectIfAuthenticated = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const { role, id } = verifyToken(token);
      const redirectTo = {
        administrator: '/administrator/dashboard',
        moderator:     '/moderator/dashboard',
        helper:        `/profile/${id}`,
        seeker:        '/home',
      }[role];
      if (redirectTo) {
        return res.json({ success: false, message: 'Already logged in', redirectTo });
      }
    }
  } catch {
    // Invalid / expired token — allow access to login/signup
  }
  next();
};
