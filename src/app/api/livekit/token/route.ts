import { AccessToken } from "livekit-server-sdk"
import { NextResponse } from "next/server"

type LiveKitTokenRequest = {
    room: string
    identity: string
}

export type LiveKitTokenResponse = {
    token?: string
    serverUrl?: string
    error?: string
}

export async function POST(request: Request) {
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const serverUrl = process.env.LIVEKIT_URL

    if(!apiKey || !apiSecret || !serverUrl) {
        return NextResponse.json(
            { error: "LiveKit server is not configured" },
            { status: 500 },
        )
    }

    let body: LiveKitTokenRequest
    try {
        body = await request.json() as LiveKitTokenRequest
    } catch (error) {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 },
        )
    }

    const room = body.room?.trim() ?? ""
    const identity = body.identity?.trim() ?? ""

    if(!room || !identity) {
        return NextResponse.json(
            { error: "room and identity are required" },
            { status: 400 },
        )
    }

    const token = new AccessToken(apiKey, apiSecret, {
        identity,
        ttl: "1h",
    })

    token.addGrant({
        room,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
    })

    const response: LiveKitTokenResponse = {
        token: await token.toJwt(),
        serverUrl,
    }

    return NextResponse.json(response)
}