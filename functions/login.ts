import { serialize } from 'cookie'
import { sign } from '@tsndr/cloudflare-worker-jwt'

let failed: string | null = null
let passed: string | null = null

const html = (wantFailed: boolean) => {
  if (wantFailed && failed) return failed
  if (!wantFailed && passed) return passed

  return `
<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>CF Auth</title>
  </head>

  <body>
    <form method="post">
      <input type="text" name="username" autocomplete="username" autofocus />
      <input type="passowrd" name="password" auto-complete="current-password" />
      <input type="submit" value="Login" />

      ${
        wantFailed
          ? '<br /><span style="color:red;">Wrong username or password</span>'
          : ''
      }
    </form>
  </body>
</html>
`
}

export const onRequestGet: PagesFunction = async () => {
  return new Response(html(false), {
    headers: { ['Content-Type']: 'text/html' },
  })
}

export const onRequestPost: PagesFunction<{ JWT_SECRET: string }> = async ({
  request,
  env,
}) => {
  const formData = await request.formData()

  const username = formData.get('username')
  const password = formData.get('password')

  if (username === 'abc' && password === '123') {
    const jwtString = await sign({ username }, env.JWT_SECRET)
    const [jwtPartHeader, jwtPartBody, jwtPartSignature] = jwtString.split('.')

    const url = new URL(request.url)

    const headers = new Headers({
      Location: url.origin,
      ['Set-Cookie']: [
        serialize('JWT_P1P2', `${jwtPartHeader}.${jwtPartBody}`, {
          sameSite: true,
          secure: true,
          maxAge: 60 * 60 * 24 * 30, // 30 days
        }),
        serialize('JWT_SIG', jwtPartSignature, {
          sameSite: true,
          secure: true,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30, // 30 days
        }),
      ].join(','),
    })

    return new Response(null, {
      status: 302,
      headers,
    })
  }

  const headers = new Headers({ ['Content-Type']: 'text/html' })
  return new Response(html(true), { headers })
}
