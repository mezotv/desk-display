import { createFileRoute } from '@tanstack/react-router'

import { createSpotifyAuthorizationUrl } from '@/utils/spotify-oauth.server'

export const Route = createFileRoute('/api/spotify/login')({
  server: {
    handlers: {
      GET: async () => {
        const authorizationUrl = createSpotifyAuthorizationUrl()

        if (!authorizationUrl) {
          return new Response('Add the Spotify client ID and secret first.', {
            status: 503,
          })
        }

        return Response.redirect(authorizationUrl, 302)
      },
    },
  },
})

