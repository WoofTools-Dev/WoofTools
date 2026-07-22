

describe('API Endpoints', () => {
  const BASE_URL = 'http://localhost:8000';

  it('should return hello world on GET /', async () => {
    const res = await fetch(`${BASE_URL}/`);
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text).toBe('Hello World!');
  });

  it('should return dashboard data on GET /api/dashboard/data', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard/data`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('token0Name');
      expect(data[0]).toHaveProperty('token1Name');
      expect(data[0]).toHaveProperty('pairAddress');
      expect(data[0]).toHaveProperty('price');
    }
  });

  it('should return live pairs on GET /api/live-pairs', async () => {
    const res = await fetch(`${BASE_URL}/api/live-pairs`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return swap transactions on GET /api/swaps', async () => {
    const res = await fetch(`${BASE_URL}/api/swaps`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return hot pairs on GET /hotpair/hot-pairs', async () => {
    const res = await fetch(`${BASE_URL}/hotpair/hot-pairs`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return 404 for unknown routes', async () => {
    const res = await fetch(`${BASE_URL}/nonexistent`);
    expect(res.status).toBe(404);
  });
});
