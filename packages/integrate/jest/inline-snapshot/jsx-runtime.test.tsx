import { renderToString } from 'react-dom/server'

function Component() {
  return <div>Hello</div>
}

test('should read jsx runtime options from tsconfig', () => {
  expect(renderToString(<Component />)).toMatchInlineSnapshot(`"<div>Hello</div>"`)
})
