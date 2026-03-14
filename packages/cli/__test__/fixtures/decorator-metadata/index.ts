const metadataCalls: Array<[string, unknown]> = []

;(Reflect as { metadata?: (key: string, value: unknown) => () => void }).metadata = (key, value) => {
  metadataCalls.push([key, value])
  return () => undefined
}

function prop(): PropertyDecorator {
  return () => undefined
}

class Example {
  @prop()
  value!: string
}

void Example

const typeMetadata = metadataCalls.find(([key]) => key === 'design:type')
console.log(typeMetadata?.[1] === String ? 'metadata-ok' : 'metadata-missing')
