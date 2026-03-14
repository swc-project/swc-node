;(async () => {
  const esmDep = await (0, eval)('import("./esm-dep.mts")')
  console.log(esmDep.value)
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
