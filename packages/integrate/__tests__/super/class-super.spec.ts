import test from 'ava'

class BadRequestError extends Error {
  constructor(public readonly message: string) {
    super(message)
  }
}

test('should handler class super', (t) => {
  const message = 'Bad request'
  const e = new BadRequestError(message)
  t.is(e.message, message)
})
