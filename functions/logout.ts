import { serialize } from 'cookie'

const ONE_DAY = 1000 * 60 * 60 * 24

export const onRequestPost: PagesFunction = async ({ request }) => {
  const url = new URL(request.url)

  const headers = new Headers({
    Location: url.origin + '/login',
    ['Set-Cookie']: serialize('AUTH_COOKIE', '', {
      expires: new Date(Date.now() - ONE_DAY),
    }),
  })

  return new Response(null, {
    status: 302,
    headers,
  })
}
