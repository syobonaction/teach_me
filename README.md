This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Local LiveKit (Docker)

The prototype uses a self-hosted [LiveKit](https://livekit.io/) server for WebRTC rooms. Run it locally with Docker before using the in-app connection lab or other clients.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running on your machine

### Pull the server image

```bash
docker pull livekit/livekit-server:latest
```

### Start the server

Run LiveKit in the foreground in a dedicated terminal. The server needs an API key and secret; use a local dev pair and reuse the same values in your app configuration.

```bash
docker run --rm -it --pull always \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -p 50000-50100:50000-50100/udp \
  livekit/livekit-server:latest \
  --dev \
  --keys "devkey: devsecret"
```

Replace `devkey` and `devsecret` with your own values if you prefer. Do not commit real secrets.

Leave this terminal running while you develop or test calls. Clients should use `ws://127.0.0.1:7880` as the WebSocket URL.

### Smoke test

In another terminal:

```bash
curl -i http://127.0.0.1:7880/ | head -n 8
```

You should see `HTTP/1.1 200 OK` and a short `OK` body.

### Troubleshooting

- **`one of key-file or keys must be provided`:** pass `--keys "apikey: apisecret"` when starting the container, as in the start command above.
- **WebRTC issues on macOS with Docker Desktop:** UDP port mapping through Docker can be unreliable; widening the published UDP range or running LiveKit on Linux may help if media fails after the server is up.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
