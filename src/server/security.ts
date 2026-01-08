/**
 * Security Middleware - Headers, CORS, CSP
 * Production security configuration
 */

export interface SecurityConfig {
  cors: {
    enabled: boolean;
    origins: string[];
    methods: string[];
    headers: string[];
    credentials: boolean;
  };
  csp: {
    enabled: boolean;
    directives: Record<string, string[]>;
  };
  headers: {
    hsts: boolean;
    noSniff: boolean;
    xssProtection: boolean;
    frameOptions: 'DENY' | 'SAMEORIGIN' | false;
  };
}

const defaultConfig: SecurityConfig = {
  cors: {
    enabled: true,
    origins: ['*'], // In production, restrict this!
    methods: ['GET', 'POST', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization'],
    credentials: false
  },
  csp: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"], // Needed for Astro
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"]
    }
  },
  headers: {
    hsts: true,
    noSniff: true,
    xssProtection: true,
    frameOptions: 'DENY'
  }
};

/**
 * Build Content-Security-Policy header value
 */
function buildCSP(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Get security headers for response
 */
export function getSecurityHeaders(config: Partial<SecurityConfig> = {}): Record<string, string> {
  const cfg = {
    ...defaultConfig,
    ...config,
    cors: { ...defaultConfig.cors, ...config.cors },
    csp: { ...defaultConfig.csp, ...config.csp },
    headers: { ...defaultConfig.headers, ...config.headers }
  };

  const headers: Record<string, string> = {};

  // HSTS - HTTP Strict Transport Security
  if (cfg.headers.hsts) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }

  // Prevent MIME type sniffing
  if (cfg.headers.noSniff) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // XSS Protection (legacy but still useful)
  if (cfg.headers.xssProtection) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  // Clickjacking protection
  if (cfg.headers.frameOptions) {
    headers['X-Frame-Options'] = cfg.headers.frameOptions;
  }

  // Content Security Policy
  if (cfg.csp.enabled) {
    headers['Content-Security-Policy'] = buildCSP(cfg.csp.directives);
  }

  // Referrer Policy
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

  // Permissions Policy (formerly Feature-Policy)
  headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';

  return headers;
}

/**
 * Handle CORS preflight and headers
 */
export function handleCORS(
  request: Request,
  config: Partial<SecurityConfig['cors']> = {}
): { headers: Record<string, string>; isPreflight: boolean } {
  const cfg = { ...defaultConfig.cors, ...config };
  const headers: Record<string, string> = {};
  const origin = request.headers.get('origin');

  if (!cfg.enabled) {
    return { headers, isPreflight: false };
  }

  // Check if origin is allowed
  const isAllowed = cfg.origins.includes('*') || 
    (origin && cfg.origins.includes(origin));

  if (isAllowed && origin) {
    headers['Access-Control-Allow-Origin'] = cfg.origins.includes('*') ? '*' : origin;
    
    if (cfg.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  }

  // Handle preflight
  const isPreflight = request.method === 'OPTIONS';
  if (isPreflight) {
    headers['Access-Control-Allow-Methods'] = cfg.methods.join(', ');
    headers['Access-Control-Allow-Headers'] = cfg.headers.join(', ');
    headers['Access-Control-Max-Age'] = '86400'; // 24 hours
  }

  return { headers, isPreflight };
}

/**
 * Create preflight response
 */
export function createPreflightResponse(request: Request): Response {
  const { headers } = handleCORS(request);
  return new Response(null, {
    status: 204,
    headers
  });
}

/**
 * Apply all security headers to a response
 */
export function applySecurityHeaders(
  response: Response,
  request: Request,
  config: Partial<SecurityConfig> = {}
): Response {
  const securityHeaders = getSecurityHeaders(config);
  const { headers: corsHeaders } = handleCORS(request, config.cors);
  
  const allHeaders = { ...securityHeaders, ...corsHeaders };
  
  // Clone response and add headers
  const newHeaders = new Headers(response.headers);
  Object.entries(allHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

/**
 * Sanitize user input - basic XSS prevention
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize slug parameter
 */
export function validateSlug(slug: string): { valid: boolean; sanitized: string; error?: string } {
  // Only allow alphanumeric, hyphens, underscores
  const sanitized = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '');
  
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'Invalid slug: empty after sanitization' };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, sanitized: sanitized.slice(0, 100), error: 'Slug too long' };
  }
  
  if (sanitized !== slug) {
    return { valid: true, sanitized, error: 'Slug was sanitized' };
  }
  
  return { valid: true, sanitized };
}

export { defaultConfig as securityDefaults };
