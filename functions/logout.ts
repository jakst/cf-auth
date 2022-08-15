import { serialize } from 'cookie'

export const onRequestPost: PagesFunction = async ({ request }) => {
  const url = new URL(request.url)

  const headers = new Headers({
    Location: url.origin,
    ['Set-Cookie']: serialize('AUTH_COOKIE', '', {
      expires: new Date(Date.now() - 1000),
    }),
  })

  return new Response(null, {
    status: 302,
    headers,
  })
}
