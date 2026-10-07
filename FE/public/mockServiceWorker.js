/* eslint-disable */
/* tslint:disable */

/**
 * Mock Service Worker가 사용하는 서비스 워커
 * @see https://github.com/mswjs/msw
 * - MSW가 자동으로 관리하는 파일이므로 직접 수정 x
 */

const PACKAGE_VERSION = '2.15.0'
const INTEGRITY_CHECKSUM = '03cb67ac84128e63d7cd722a6e5b7f1e'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')
const activeClientIds = new Set()

addEventListener('install', function () {
  self.skipWaiting()
})

addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

addEventListener('message', async function (event) {
  const clientId = Reflect.get(event.source || {}, 'id')

  if (!clientId || !self.clients) {
    return
  }

  const client = await self.clients.get(clientId)

  if (!client) {
    return
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  switch (event.data) {
    case 'KEEPALIVE_REQUEST': {
      sendToClient(client, {
        type: 'KEEPALIVE_RESPONSE',
      })
      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      sendToClient(client, {
        type: 'INTEGRITY_CHECK_RESPONSE',
        payload: {
          packageVersion: PACKAGE_VERSION,
          checksum: INTEGRITY_CHECKSUM,
        },
      })
      break
    }

    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)

      sendToClient(client, {
        type: 'MOCKING_ENABLED',
        payload: {
          client: {
            id: client.id,
            frameType: client.frameType,
          },
        },
      })
      break
    }

    case 'CLIENT_CLOSED': {
      activeClientIds.delete(clientId)

      const remainingClients = allClients.filter((client) => {
        return client.id !== clientId
      })

       //연결된 페이지가 모두 닫히면 서비스 워커도 등록을 해제
      if (remainingClients.length === 0) {
        self.registration.unregister()
      }

      break
    }
  }
})

addEventListener('fetch', function (event) {
  const requestInterceptedAt = Date.now()

  // 페이지 이동 자체는 모킹 대상에서 제외
  if (event.request.mode === 'navigate') {
    return
  }

  // 개발자 도구를 열 때 생기는 "only-if-cached" 요청은 처리할 수 없으므로 그대로 통과
  if (
    event.request.cache === 'only-if-cached' &&
    event.request.mode !== 'same-origin'
  ) {
    return
  }

   // MSW가 연결된 페이지가 없으면 요청을 가로채지 않음
  // 등록 해제 후에도 잠시 남아 있는 서비스 워커가 요청을 처리하지 않도록 하기 위한 검사
  if (activeClientIds.size === 0) {
    return
  }

  const requestId = crypto.randomUUID()
  event.respondWith(handleRequest(event, requestId, requestInterceptedAt))
})

/**
 * @param {FetchEvent} event
 * @param {string} requestId
 * @param {number} requestInterceptedAt
 */
async function handleRequest(event, requestId, requestInterceptedAt) {
  const client = await resolveMainClient(event)
  const requestCloneForEvents = event.request.clone()
  const response = await getResponse(
    event,
    client,
    requestId,
    requestInterceptedAt,
  )

  // "response:*" 이벤트에서 사용할 수 있도록 응답 복사본을 전달
  // 메시지가 계속 대기하지 않도록 MSW가 현재 활성화되어 있는지도 확인
  if (client && activeClientIds.has(client.id)) {
    const serializedRequest = await serializeRequest(requestCloneForEvents)

     // 서버 전송 이벤트(SSE) 응답은 본문을 복제하지 않음
    // 스트림을 복제하면 취소 신호가 원본에 제대로 전달되지 않고,
    // 읽히지 않는 복사본에 데이터가 계속 쌓일 수 있음
    const isEventStreamResponse = response.headers
      .get('content-type')
      ?.toLowerCase()
      .startsWith('text/event-stream')

     // 페이지와 MSW 양쪽에서 읽을 수 있도록 응답을 복제
    const responseClone = isEventStreamResponse ? null : response.clone()

    sendToClient(
      client,
      {
        type: 'RESPONSE',
        payload: {
          isMockedResponse: IS_MOCKED_RESPONSE in response,
          request: {
            id: requestId,
            ...serializedRequest,
          },
          response: {
            type: response.type,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseClone ? responseClone.body : null,
          },
        },
      },
      responseClone && responseClone.body
        ? [serializedRequest.body, responseClone.body]
        : [],
    )
  }

  return response
}

/**
 ** 이 이벤트를 처리할 때 통신할 페이지를 찾음
 * 요청을 보낸 페이지와 서비스 워커를 등록한 페이지가 항상 같지는 않음
 * 응답을 만들 때는 서비스 워커를 등록한 쪽과 통신해야 함
 * @param {FetchEvent} event
 * @returns {Promise<Client | undefined>}
 */
async function resolveMainClient(event) {
  const client = await self.clients.get(event.clientId)

  if (activeClientIds.has(event.clientId)) {
    return client
  }

  if (client?.frameType === 'top-level') {
    return client
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  return allClients
    .filter((client) => {
      // 현재 사용자에게 보이는 페이지만 남김
      return client.visibilityState === 'visible'
    })
    .find((client) => {
      // 그중에서 이 서비스 워커를 등록한 페이지를 찾음
      return activeClientIds.has(client.id)
    })
}

/**
 * @param {FetchEvent} event
 * @param {Client | undefined} client
 * @param {string} requestId
 * @param {number} requestInterceptedAt
 * @returns {Promise<Response>}
 */
async function getResponse(event, client, requestId, requestInterceptedAt) {
  // 요청 본문을 이미 읽었을 수도 있으므로 미리 복사
  const requestClone = event.request.clone()

  function passthrough() {
    // 헤더를 안전하게 수정할 수 있도록 새 Headers 객체로 복사
    const headers = new Headers(requestClone.headers)

     // 통과 요청임을 표시하려고 추가했던 값을 "accept" 헤더에서 제거
    // 실제 서버에는 원래 요청과 같은 형태로 전달되며 CORS 설정도 그대로 적용
    const acceptHeader = headers.get('accept')
    if (acceptHeader) {
      const values = acceptHeader.split(',').map((value) => value.trim())
      const filteredValues = values.filter(
        (value) => value !== 'msw/passthrough',
      )

      if (filteredValues.length > 0) {
        headers.set('accept', filteredValues.join(', '))
      } else {
        headers.delete('accept')
      }
    }

    return fetch(requestClone, { headers })
  }

 // MSW와 연결된 페이지가 아니면 실제 네트워크로 요청 보냄
  if (!client) {
    return passthrough()
  }

  // 처음 페이지를 불러올 때 필요한 정적 파일 요청은 그대로 통과
  // 현재 페이지가 활성 목록에 없다면 아직 "MOCK_ACTIVATE" 처리가 끝나지 않아 MSW가 요청을 받을 준비가 되지 않은 상태
  if (!activeClientIds.has(client.id)) {
    return passthrough()
  }

  // 요청을 가로챘다고 페이지에 알리고 어떤 응답을 돌려줄지 확인
  const serializedRequest = await serializeRequest(event.request)
  const clientMessage = await sendToClient(
    client,
    {
      type: 'REQUEST',
      payload: {
        id: requestId,
        interceptedAt: requestInterceptedAt,
        ...serializedRequest,
      },
    },
    [serializedRequest.body],
  )

  switch (clientMessage.type) {
    case 'MOCK_RESPONSE': {
      return respondWithMock(clientMessage.data)
    }

    case 'PASSTHROUGH': {
      return passthrough()
    }
  }

  return passthrough()
}

/**
 * @param {Client} client
 * @param {any} message
 * @param {Array<Transferable>} transferrables
 * @returns {Promise<any>}
 */
function sendToClient(client, message, transferrables = []) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(event.data.error)
      }

      resolve(event.data)
    }

    client.postMessage(message, [
      channel.port2,
      ...transferrables.filter(Boolean),
    ])
  })
}

/**
 * @param {Response} response
 * @returns {Response}
 */
function respondWithMock(response) {
   // 일반 Response는 상태 코드 0으로 만들 수 없음
  // 반면 "Response.error()"의 상태 코드는 0이므로 오류 응답만 따로 처리
  if (response.status === 0) {
    return Response.error()
  }

  const mockedResponse = new Response(response.body, response)

  Reflect.defineProperty(mockedResponse, IS_MOCKED_RESPONSE, {
    value: true,
    enumerable: true,
  })

  return mockedResponse
}

/**
 * @param {Request} request
 */
async function serializeRequest(request) {
  return {
    url: request.url,
    mode: request.mode,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    cache: request.cache,
    credentials: request.credentials,
    destination: request.destination,
    integrity: request.integrity,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    body: await request.arrayBuffer(),
    keepalive: request.keepalive,
  }
}
