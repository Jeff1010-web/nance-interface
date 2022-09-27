export const NANCE_API_URL = (process.env.NODE_ENV !== 'development')
  ? "https://nance-api.up.railway.app/notion/"
  : "http://localhost:3000/notion";

export const SPACES = 
  {
    '0': 'dev',
    '1': 'juicebox'
  };
