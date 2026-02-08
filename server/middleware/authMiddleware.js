/**
 * AUTHENTICATION MIDDLEWARE
 * Protects routes by checking user login status and role
 * Redirects to appropriate login page if not authenticated
 */

/**
 * Check if any user is logged in (any role)
 */
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  // Redirect to general login page
  return res.status(401).json({ 
    success: false, 
    message: 'Authentication required. Please login.',
    redirectTo: '/login'
  });
};

/**
 * Check if user is logged in as Admin
 */
export const isAdmin = (req, res, next) => {
  console.log('🔒 isAdmin check:', {
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    role: req.session?.user?.role,
    sessionID: req.sessionID
  });

  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  // If making API call, return JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required',
      redirectTo: '/login/admin',
      debug: { hasSession: !!req.session, hasUser: !!req.session?.user, role: req.session?.user?.role }
    });
  }
  
  // Otherwise redirect
  return res.redirect('/login/admin');
};

/**
 * Check if user is logged in as Helper
 */
export const isHelper = (req, res, next) => {
  console.log('🔒 isHelper check:', {
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    role: req.session?.user?.role,
    sessionID: req.sessionID
  });

  if (req.session && req.session.user && req.session.user.role === 'helper') {
    return next();
  }
  
  // If making API call, return JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(403).json({ 
      success: false, 
      message: 'Helper access required',
      redirectTo: '/login/helper',
      debug: { hasSession: !!req.session, hasUser: !!req.session?.user, role: req.session?.user?.role }
    });
  }
  
  // Otherwise redirect
  return res.redirect('/login/helper');
};

/**
 * Check if user is logged in as Seeker
 */
export const isSeeker = (req, res, next) => {
  console.log('🔒 isSeeker check:', {
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    role: req.session?.user?.role,
    sessionID: req.sessionID
  });

  if (req.session && req.session.user && req.session.user.role === 'seeker') {
    return next();
  }
  
  // If making API call, return JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(403).json({ 
      success: false, 
      message: 'Seeker access required',
      redirectTo: '/login/seeker',
      debug: { hasSession: !!req.session, hasUser: !!req.session?.user, role: req.session?.user?.role }
    });
  }
  
  // Otherwise redirect
  return res.redirect('/login/seeker');
};

/**
 * Check if user is either Helper or Admin (for helper management routes)
 */
export const isHelperOrAdmin = (req, res, next) => {
  if (req.session && req.session.user) {
    const role = req.session.user.role;
    if (role === 'helper' || role === 'admin') {
      return next();
    }
  }
  
  return res.status(403).json({ 
    success: false, 
    message: 'Helper or Admin access required',
    redirectTo: '/login'
  });
};

/**
 * Redirect if already logged in (for login/signup pages)
 */
export const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    const role = req.session.user.role;
    
    // Redirect to appropriate dashboard based on role
    if (role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (role === 'helper') {
      return res.redirect(`/profile/${req.session.user.id}`);
    } else if (role === 'seeker') {
      return res.redirect('/home');
    }
  }
  
  next();
};
