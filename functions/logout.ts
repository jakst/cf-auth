import { serialize } from 'cookie'

export const onRequestPost: PagesFunction = async ({ request }) => {
  const url = new URL(request.url)
  const response = Response.redirect(url.protocol + url.host + '/login')
  response.headers.set(
    'Set-Cookie',
    serialize('AUTH_COOKIE', '', { expires: new Date(Date.now() - 1000) })
  )

  return response
}
