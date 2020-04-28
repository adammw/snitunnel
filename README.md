snitunnel
===

inspired by [sniproxy](https://github.com/dlundquist/sniproxy), proxies HTTP and
HTTPS traffic via a customisable upstream tunnel

By default, all traffic is proxied directly, but can be changed at runtime.
For example to redirect traffic from clients at `127.0.0.1` destined for
`example.com` via a HTTP proxy:

```
curl -X POST \
  http://localhost:3000/api/mappings \
  -H 'Content-Type: application/json' \
  --data '{
    "name": "example",
    "domain": "example.com",
    "tunnel": "http://my.proxy.service:3128",
    "networks": ["127.0.0.1"]
  }'
```