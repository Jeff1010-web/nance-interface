export const SNAPSHOT_HUB = 'https://hub.snapshot.org';
export const SNAPSHOT_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.NEXT_PUBLIC_SNAPSHOT_API_KEY || '',
};
