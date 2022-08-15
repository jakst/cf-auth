import { parse } from 'cookie'
import sentryPlugin from '@cloudflare/pages-plugin-sentry'

export const auth: PagesFunction = async ({ next, request }) => {
  const cookies = parse(request.headers.get('Cookie') || '')
  const value = cookies['AUTH_COOKIE']

  const url = new URL(request.url)

  if (!value && url.pathname !== '/login') {
    return Response.redirect(url.origin + '/login')
  } else if (value && url.pathname === '/login') {
    return Response.redirect(url.origin)
  }

  return next()
}

export const sentry: PagesFunction<{
  SENTRY_DSN: string
}> = (context) => {
  const { SENTRY_DSN } = context.env
  if (SENTRY_DSN) return sentryPlugin({ dsn: SENTRY_DSN })(context)

  return context.next()
}

export const onRequest = [sentry, auth]
