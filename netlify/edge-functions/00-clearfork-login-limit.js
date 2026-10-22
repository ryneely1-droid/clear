/**
 * Clear Fork login-only rate limiter, v1.0.
 * Deploy BOTH this file and clearfork-access.js.
 * The alphabetical prefix runs this pass-through before the inline access gate.
 * Netlify enforces the limit at the platform, not in this function's memory.
 * The per-IP/domain limit can also affect colleagues using the same public IP.
 * Confirm acceptance in the deploy's post-processing logs. Enforcement can lag.
 */
export default function clearforkLoginLimit() {
  // Continue to the main access gate. This function never grants access itself.
  return;
}
export const config = {
  path: '/__clearfork/login',
  onError: 'fail',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip','domain'] }
};
