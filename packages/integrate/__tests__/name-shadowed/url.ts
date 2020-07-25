export function queryString(object: any) {
  return Object.entries(object)
    .reduce((acc, [key, value]) => {
      acc.push(`${key}=${value}`)
      return acc
    }, [] as string[])
    .join('&')
}
