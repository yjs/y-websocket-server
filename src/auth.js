import { PERMISSION_DELIVERABLE_QUERY } from './queries.js'

const APPSYNC_ENDPOINT = process.env.APPSYNC_ENDPOINT

export function isAuthConfigured() {
  return !!APPSYNC_ENDPOINT
}

export async function handleAuthentication(request, socket) {
  try {
    const { deliverableId, jwtToken } = extractAuthParams(request)
    
    if (!deliverableId || !jwtToken) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n')
      socket.destroy()
      return false
    }
    
    const isAuthorized = await checkUserPermissions(deliverableId, jwtToken)
    
    if (!isAuthorized) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return false
    }

    return true
    
  } catch (error) {
    console.error('Error during authentication:', error)
    socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
    socket.destroy()
    return false
  }
}

function extractAuthParams(request) {
  const url = new URL(request.url, `http://${request.headers.host}`)
  const deliverableId = url.searchParams.get('deliverableId')
  const jwtToken = url.searchParams.get('JWT')
  
  return { deliverableId, jwtToken }
}

async function checkUserPermissions(deliverableId, jwtToken) {
  if (!APPSYNC_ENDPOINT) {
    return false
  }

  if (!jwtToken) {
    return false
  }

  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        query: PERMISSION_DELIVERABLE_QUERY,
        variables: {
          deliverableId
        }
      })
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    
    if (data.errors) {
      return false
    }

    const result = data.data && data.data.permissionDeliverable
    
    if (!result || (result.errors && result.errors.length > 0)) {
      return false
    }

    if (!result.success) {
      return false
    }

    const hasReadPermission = result.success.permissions && result.success.permissions.includes('DELIVERABLE_READ')
    
    return hasReadPermission

  } catch (error) {
    return false
  }
}