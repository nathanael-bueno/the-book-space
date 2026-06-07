import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import type { ChannelAuthorizationCallback } from 'pusher-js'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

let echoInstance: Echo<'reverb'> | null = null

function getToken(): string {
  return localStorage.getItem('book-space.token') ?? ''
}

export function getEcho(): Echo<'reverb'> {
  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY as string,
      wsHost: import.meta.env.VITE_REVERB_HOST as string,
      wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
      wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      authorizer: (channel: { name: string }) => ({
        authorize: (
          socketId: string,
          callback: ChannelAuthorizationCallback
        ) => {
          const apiBase =
            (import.meta.env.VITE_API_URL as string | undefined)?.replace(
              /\/$/,
              ''
            ) ?? 'http://localhost:8000/api'

          fetch(`${apiBase}/broadcasting/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error(
                  'Não foi possível autorizar o canal em tempo real.'
                )
              }

              return response.json()
            })
            .then((data) => callback(null, data))
            .catch((error: unknown) => {
              callback(
                error instanceof Error
                  ? error
                  : new Error(
                      'Não foi possível autorizar o canal em tempo real.'
                    ),
                null
              )
            })
        },
      }),
    })
  }
  return echoInstance
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}
