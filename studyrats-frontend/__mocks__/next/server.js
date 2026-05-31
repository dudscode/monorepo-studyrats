// Manual mock for next/server — used in Jest tests

class MockCookieJar {
  constructor() {
    this._cookies = {}
  }
  set(name, value, options = {}) {
    this._cookies[name] = { value, ...options }
  }
  get(name) {
    const c = this._cookies[name]
    return c ? { name, value: c.value } : undefined
  }
  getSetCookie() {
    return Object.entries(this._cookies).map(([name, opts]) => {
      let s = `${name}=${opts.value}`
      if (opts.maxAge !== undefined) s += `; Max-Age=${opts.maxAge}`
      if (opts.path) s += `; Path=${opts.path}`
      if (opts.httpOnly) s += `; HttpOnly`
      if (opts.sameSite) s += `; SameSite=${opts.sameSite}`
      if (opts.secure) s += `; Secure`
      return s
    })
  }
}

class MockHeaders {
  constructor(init = {}) {
    this._store = {}
    if (init) Object.entries(init).forEach(([k, v]) => (this._store[k.toLowerCase()] = v))
  }
  get(name) {
    return this._store[name.toLowerCase()] ?? null
  }
  set(name, value) {
    this._store[name.toLowerCase()] = value
  }
  getSetCookie() {
    return this._cookieJar ? this._cookieJar.getSetCookie() : []
  }
}

class NextResponse {
  constructor(body, init = {}) {
    this._body = body
    this.status = init.status ?? 200
    this.headers = new MockHeaders(init.headers ?? {})
    this.cookies = new MockCookieJar()
    this.headers._cookieJar = this.cookies
  }
  async json() {
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
  }
  static json(data, init = {}) {
    const res = new NextResponse(data, init)
    res._body = data
    return res
  }
}

class NextRequest {
  constructor(url, init = {}) {
    this.url = typeof url === 'string' ? url : url.toString()
    this.nextUrl = new URL(this.url)
    this.method = (init.method ?? 'GET').toUpperCase()
    this._body = init.body ?? null
    this._headers = init.headers ?? {}
    this.cookies = { get: () => undefined }
  }
  async json() {
    return JSON.parse(this._body)
  }
}

module.exports = { NextRequest, NextResponse }
