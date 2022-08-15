export const onRequest: PagesFunction = async ({ next }) => {
  console.time('next()')
  const response = await next()
  console.timeEnd('next()')
  return response
}
