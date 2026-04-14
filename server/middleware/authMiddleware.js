//Auth middleware - JWT-based authentication
//checks if user is logged in and what role they have
//redirects to the appropirate login page if not logged in

import { verifyToken, extractToken } from '../utils/jwtUtils.js';

// checks if anyone is logged in (any role)
export const isAuthenticated = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login.',
        redirectTo: '/login'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded; // Attach user data to request object
    return next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token. Please login again.',
      redirectTo: '/login'
    });
  }
};

/**
 * Check if user is logged in as Administrator
 */
export const isAdministrator = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        redirectTo: '/login/admin'
      });
    }

    const decoded = verifyToken(token);
    
    console.log('isAdministrator check:', {
      hasToken: !!token,
      role: decoded.role,
      userId: decoded.id
    });

    if (decoded.role === 'administrator') {
      req.user = decoded;
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Administrator access required',
      redirectTo: '/login/administrator'
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      redirectTo: '/login/administrator'
    });
  }
};

/**
 * Check if user is logged in as Moderator
 */
export const isModerator = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        redirectTo: '/login/moderator'
      });
    }

    const decoded = verifyToken(token);
    
    console.log('isModerator check:', {
      hasToken: !!token,
      role: decoded.role,
      userId: decoded.id,
      locationId: decoded.locationId
    });

    if (decoded.role === 'moderator') {
      req.user = decoded;
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Moderator access required',
      redirectTo: '/login/moderator'
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      redirectTo: '/login/moderator'
    });
  }
};

/**
 * Check if user is logged in as Helper
 */
export const isHelper = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        redirectTo: '/login/helper'
      });
    }

    const decoded = verifyToken(token);
    
    console.log('isHelper check:', {
      hasToken: !!token,
      role: decoded.role,
      userId: decoded.id
    });

    if (decoded.role === 'helper') {
      req.user = decoded;
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Helper access required',
      redirectTo: '/login/helper'
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      redirectTo: '/login/helper'
    });
  }
};

/**
 * Check if user is logged in as Seeker
 */
export const isSeeker = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        redirectTo: '/login/seeker'
      });
    }

    const decoded = verifyToken(token);
    
    console.log('isSeeker check:', {
      hasToken: !!token,
      role: decoded.role,
      userId: decoded.id
    });

    if (decoded.role === 'seeker') {
      req.user = decoded;
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Seeker access required',
      redirectTo: '/login/seeker'
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      redirectTo: '/login/seeker'
    });
  }
};

/**
 * Redirect if already logged in (for login/signup pages)
 */
export const redirectIfAuthenticated = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = verifyToken(token);
      const role = decoded.role;

      if (role === 'administrator') {
        return res.json({ 
          success: false, 
          message: 'Already logged in',
          redirectTo: '/administrator/dashboard' 
        });
      } else if (role === 'moderator') {
        return res.json({ 
          success: false, 
          message: 'Already logged in',
          redirectTo: '/moderator/dashboard' 
        });
      } else if (role === 'helper') {
        return res.json({ 
          success: false, 
          message: 'Already logged in',
          redirectTo: `/profile/${decoded.id}` 
        });
      } else if (role === 'seeker') {
        return res.json({ 
          success: false, 
          message: 'Already logged in',
          redirectTo: '/home' 
        });
      }
    }
  } catch (error) {
    // Token is invalid/expired, allow access to login/signup pages
  }
  
  next();
};
