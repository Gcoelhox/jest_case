test('Devo conhecer as principais assertivas do Jest', () => {
  let number = null;
  expect(number).toBeNull();
  number = 12;
  expect(number).not.toBeNull();
  expect(number).toBe(12);
  expect(number).toEqual(12);
  expect(number).toBeGreaterThan(10);
  expect(number).toBeLessThan(13);
});

test('Devo saber trabalhar com objetos', () => {
  const obj = { name: 'John', mail: 'john@mail.com' };
  expect(obj).toHaveProperty('name');
  expect(obj).toHaveProperty('name', 'John');
  expect(obj.name).toBe('John');

  const obj2 = { name: 'John', mail: 'john@mail.com' };
  expect(obj).toEqual(obj2);
});
