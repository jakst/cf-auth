import { parse } from 'cookie'
import sentryPlugin from '@cloudflare/pages-plugin-sentry'
import { decode, JwtPayload, verify } from '@tsndr/cloudflare-worker-jwt'

interface AuthPayload {
  username?: string
}

type JwtAuthPayload = JwtPayload & AuthPayload

export const auth: PagesFunction<{ JWT_SECRET: string }> = async ({
  env,
  next,
  request,
}) => {
  const url = new URL(request.url)

  if (url.pathname === '/login' || url.pathname === '/favicon.ico')
    return next()

  const loginRedirect = Response.redirect(url.origin + '/login')

  const { JWT_P1P2, JWT_SIG } = parse(request.headers.get('Cookie') || '')

  if (!JWT_P1P2 || !JWT_SIG) return loginRedirect
  const fullToken = `${JWT_P1P2}.${JWT_SIG}`

  try {
    const tokenIsValid = await verify(fullToken, env['JWT_SECRET'])
    if (!tokenIsValid) return loginRedirect

    const { username } = decode(fullToken).payload as JwtAuthPayload
    if (!username) return loginRedirect

    if (url.pathname === '/login') return Response.redirect(url.origin)
    return next()
  } catch {
    return loginRedirect
  }
}

export const sentry: PagesFunction<{
  SENTRY_DSN: string
}> = (context) => {
  const { SENTRY_DSN } = context.env
  if (SENTRY_DSN) return sentryPlugin({ dsn: SENTRY_DSN })(context)

  return context.next()
}

export const onRequest = [sentry, auth]
