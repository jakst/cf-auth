import { serialize } from 'cookie'

const html = (failed: boolean) => `
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
        failed
          ? '<br /><span style="color:red;">Wrong username or password</span>'
          : ''
      }
    </form>
  </body>
</html>
`

const failed = html(true)
const passed = html(false)

export const onRequestGet: PagesFunction = async () => {
  return new Response(passed, { headers: { ['Content-Type']: 'text/html' } })
}

export const onRequestPost: PagesFunction = async ({ request }) => {
  const formData = await request.formData()

  const username = formData.get('username')
  const password = formData.get('password')

  if (username === 'abc' && password === '123') {
    const url = new URL(request.url)
    const response = Response.redirect(url.origin).clone()

    response.headers.set(
      'Set-Cookie',
      serialize('AUTH_COOKIE', 'abc123', {
        httpOnly: true,
        sameSite: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    )

    return response
  }

  return new Response(failed, { headers: { ['Content-Type']: 'text/html' } })
}
