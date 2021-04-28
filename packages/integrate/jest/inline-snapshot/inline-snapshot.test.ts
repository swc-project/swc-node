test('should support inlineSnapshot', () => {
  const fixture = Buffer.from('hello')
  expect(fixture.toString('base64')).toMatchInlineSnapshot(`"aGVsbG8="`)
})
