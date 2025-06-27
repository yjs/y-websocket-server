#!/usr/bin/env node

import WebSocket from 'ws'
import http from 'http'
import * as number from 'lib0/number'
import { setupWSConnection } from './utils.js'
import { handleAuthentication, isAuthConfigured } from './auth.js'

const wss = new WebSocket.Server({ noServer: true })
const host = process.env.HOST || '0.0.0.0'
const port = number.parseInt(process.env.PORT || '1234')

const server = http.createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

wss.on('connection', setupWSConnection)

server.on('upgrade', async (request, socket, head) => {
  const isAuthorized = await handleAuthentication(request, socket)
  
  if (isAuthorized) {
    wss.handleUpgrade(request, socket, head, /** @param {any} ws */ ws => {
      wss.emit('connection', ws, request)
    })
  }
})

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`)
  if (!isAuthConfigured()) {
    console.warn('Warning: AWS AppSync endpoint not found. Authentication will fail.')
  }
})
