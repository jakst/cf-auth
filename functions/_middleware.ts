import { parse } from 'cookie'

export const onRequest: PagesFunction = async ({ next, request }) => {
  const cookies = parse(request.headers.get('Cookie') || '')
  const value = cookies['AUTH_COOKIE']

  const url = new URL(request.url)

  if (!value && url.pathname !== '/login') {
    return Response.redirect(url.protocol + url.host + '/login')
  } else if (value && url.pathname === '/login') {
    return Response.redirect(url.protocol + url.host)
  }

  return next()
}
