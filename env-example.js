import http from 'http'
import { h } from 'snabbdom'
import ws from 'ws'


function render() {
  return h('html', [
    h('head', [
      h('meta', {attrs: {charset: "UTF-8"}}),
      h('title', 'Hello!')
    ]),
    h('body', [
      h('h1', 'Hello!'),
      h('script', clientRuntime.toString())
    ])
  ])
}


function clientRuntime()
{
  var wsClient = new WebSocket('ws://localhost:3000')
  wsClient.addEventListener('open', event => {
    wsClient.send('Hello, Server!')
  })
  wsClient.addEventListener('message', event => {
    console.log('Message from server:', event.data)
  })
}


console.dir(render(), {depth: 10})


// const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title></title></head><body><h1>Hello!</h1><script>('+clientRuntime.toString()+')()</script></body></html>'

// const httpServer = http.createServer((request, response) => {
//   response.setHeader('Content-Type', 'text/html')
//   response.writeHead(200)
//   response.end(html)
// })

// const wsServer = new ws.Server({server: httpServer})

// wsServer.on('connection', conn => {
//   conn.on('message', msg => console.log('Message from client:', msg))
//   conn.send('Hello, Client!')
// })

// httpServer.listen(3000, 'localhost')