// SauceDemo publishes these accounts on its login page. All share one password.
// Override with TEST_USERNAME / TEST_PASSWORD in .env. Note: not USERNAME, which
// Windows already sets to the logged-in OS user.
export const PASSWORD = process.env.TEST_PASSWORD || 'secret_sauce';

export const USERS = {
  standard: process.env.TEST_USERNAME || 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;
