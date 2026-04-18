if (typeof window === 'undefined') {
  global.fetch = fetch
  global.Headers = Headers
  global.Request = Request
  global.Response = Response
}

export {} 