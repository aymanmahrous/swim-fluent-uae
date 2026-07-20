const BASE_URL = (process.env.PRODUCTION_BASE_URL || 'https://www.relaxfixuae.com').replace(/\/$/, '')
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 15000)

const checks = [
  {
    path: '/',
    type: 'html',
    required: [
      '<html lang="ar" dir="rtl">',
      '<link rel="canonical" href="https://www.relaxfixuae.com/"',
      'property="og:title"',
      'name="twitter:card"',
      'id="pricing"',
      'id="locations"',
    ],
  },
  {
    path: '/en',
    type: 'html',
    required: [
      '<html lang="en" dir="ltr">',
      '<link rel="canonical" href="https://www.relaxfixuae.com/en"',
      'property="og:title"',
      'name="twitter:card"',
      'id="pricing"',
      'id="locations"',
    ],
  },
  { path: '/robots.txt', type: 'text', required: ['Sitemap:'] },
  { path: '/sitemap.xml', type: 'xml', required: ['<urlset', 'https://www.relaxfixuae.com/'] },
]

const requiredHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
}

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'relaxfix-production-smoke/1.0' },
    })
  } finally {
    clearTimeout(timer)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

let passed = 0

for (const check of checks) {
  const url = `${BASE_URL}${check.path}`
  const startedAt = Date.now()
  const response = await fetchWithTimeout(url)
  const body = await response.text()
  const elapsed = Date.now() - startedAt

  assert(response.ok, `${check.path}: expected 2xx, received ${response.status}`)
  assert(response.status < 500, `${check.path}: server error ${response.status}`)
  assert(body.length > 20, `${check.path}: response body is unexpectedly empty`)

  for (const token of check.required) {
    assert(body.includes(token), `${check.path}: missing required token ${JSON.stringify(token)}`)
  }

  if (check.type === 'html') {
    for (const [header, expected] of Object.entries(requiredHeaders)) {
      const actual = response.headers.get(header)
      assert(actual === expected, `${check.path}: ${header} expected ${expected}, received ${actual}`)
    }

    const contentType = response.headers.get('content-type') || ''
    assert(contentType.includes('text/html'), `${check.path}: unexpected content-type ${contentType}`)
  }

  console.log(`PASS ${check.path} ${response.status} ${elapsed}ms`)
  passed += 1
}

console.log(`Production smoke check passed: ${passed}/${checks.length} endpoints on ${BASE_URL}`)
