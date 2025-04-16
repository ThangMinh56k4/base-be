export const USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN'
}

export const PUBLIC_ROUTE_REGEX = [
  /^\/auth\/login(\/)?$/,           // Route /auth/login
  /^\/auth\/facebook(\/)?$/,        // Route /auth/facebook
  /^\/auth\/google(\/)?$/,          // Route /auth/google
  /^\/auth\/register(\/)?$/,        // Route /auth/register
  /^\/auth\/forgot-password(\/)?$/, // Route /auth/forgot-password
  /^\/auth\/reset-password(\/)?$/,  // Route /auth/reset-password
  /^\/auth\/google\/callback(\/)?$/,// Route /auth/google/callback
  /^\/api-docs(\/.*)?$/             // Route /api-docs or child routes
]

export const DEFAULT_PAGE_LIMIT = 20;
export const DEFAULT_PAGE = 1;
