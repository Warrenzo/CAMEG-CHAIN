export const config = {
  API_URL: process.env['REACT_APP_API_URL'] || 'http://localhost:8000',
  APP_NAME: 'CAMEG-CHAIN',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  DEBUG: process.env.NODE_ENV === 'development',
};
