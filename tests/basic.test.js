// Basic test to verify Jest setup
describe('Jest Setup Verification', () => {
  test('Jest is working correctly', () => {
    expect(true).toBe(true);
  });

  test('Math calculations work', () => {
    expect(2 + 2).toBe(4);
    expect(10 * 10).toBe(100);
  });

  test('Array methods work', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
    expect(arr.map(x => x * 2)).toEqual([2, 4, 6]);
  });

  test('Object methods work', () => {
    const obj = { a: 1, b: 2 };
    expect(obj.a).toBe(1);
    expect(Object.keys(obj)).toEqual(['a', 'b']);
    expect(Object.values(obj)).toEqual([1, 2]);
  });

  test('String methods work', () => {
    const str = 'Google Chat';
    expect(str.length).toBe(11);
    expect(str.toUpperCase()).toBe('GOOGLE CHAT');
    expect(str.includes('Google')).toBe(true);
  });
});