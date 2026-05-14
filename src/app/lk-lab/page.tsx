'use client'

import { LiveKitTokenResponse } from "@/app/api/livekit/token/route"
import { useEffect, useMemo, useRef, useState } from "react"
import { LocalAudioTrack, LocalVideoTrack, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, RoomEvent, Track } from "livekit-client"

enum MediaStates {
    IDLE,
    REQUESTING_PERMISSIONS,
    PERMISSIONS_GRANTED,
    PERMISSIONS_DENIED,
    CONNECTING_SIGNALING,
    CONNECTED,
    PUBLISHING_MEDIA,
    IN_SESSION,
    RECONNECTING,
    FAILED,
    ERROR,
}

async function publishPreparedStream(room: Room, stream: MediaStream) {
    const videoTrack = stream.getVideoTracks()[0]
    const audioTrack = stream.getAudioTracks()[0]
    if (videoTrack) {
      await room.localParticipant.publishTrack(new LocalVideoTrack(videoTrack))
    }
    if (audioTrack) {
      await room.localParticipant.publishTrack(new LocalAudioTrack(audioTrack))
    }
    if (!videoTrack && !audioTrack) {
      throw new Error("No audio or video tracks to publish")
    }
}

export default function Lab() {
    const [mediaState, setMediaState] = useState<MediaStates>(MediaStates.IDLE)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [roomName, setRoomName] = useState<string>("demo-room")
    const [identity, setIdentity] = useState<string>("student-1")
    const roomRef = useRef<Room | null>(null)
    const localVideoRef = useRef<HTMLVideoElement | null>(null)
    const remoteMediaRef = useRef<HTMLDivElement | null>(null)

    if (roomRef.current === null) {
        roomRef.current = new Room()
    }

    useEffect(() => {
        const localVideo = localVideoRef.current
        const remoteContainer = remoteMediaRef.current
        const room = roomRef.current;
        if (localVideo) {
            localVideo.srcObject = mediaStream
        }
        if (!room || !remoteContainer) {
            return () => {
                if (localVideo) {
                    localVideo.srcObject = null
                }
            }
        }
        const onTrackSubscribed = (
            track: RemoteTrack,
            _publication: RemoteTrackPublication,
            participant: RemoteParticipant,
        ): void => {
            if (participant.isLocal) {
                return
            }
            const element = track.attach()
            if (track.kind === Track.Kind.Video && element instanceof HTMLVideoElement) {
                element.style.width = "320px"
            }
            remoteContainer.appendChild(element)
        }
        const onTrackUnsubscribed = (
            track: RemoteTrack,
            _publication: RemoteTrackPublication,
            _participant: RemoteParticipant,
        ): void => {
          for (const element of track.detach()) {
            element.remove()
          }
        }
        room.on(RoomEvent.TrackSubscribed, onTrackSubscribed)
        room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
        return () => {
            room.off(RoomEvent.TrackSubscribed, onTrackSubscribed)
            room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
            if (localVideo) {
                localVideo.srcObject = null
            }
            remoteContainer.replaceChildren()
        }
    }, [mediaStream, mediaState])

    const canPublish = useMemo(() => mediaState === MediaStates.CONNECTED && mediaStream !== null, [mediaState, mediaStream])
    const canJoin = useMemo(() => mediaState === MediaStates.PERMISSIONS_GRANTED && roomRef.current !== null, [mediaState])

    return (
        <div>
            <h1>Lab</h1>
            <p>State: {MediaStates[mediaState]}</p>
            <div>
                <p>Please enter your name</p>
                <input type="text" value={identity} onChange={(e) => setIdentity(e.target.value)} />
            </div>
            <button disabled={mediaState !== MediaStates.IDLE} onClick={async () => {
                if(mediaState != MediaStates.REQUESTING_PERMISSIONS) {
                    setMediaState(MediaStates.REQUESTING_PERMISSIONS)
                    setMediaStream(
                        await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                        .then((stream) => {
                            setMediaState(MediaStates.PERMISSIONS_GRANTED)
                            return stream
                        })
                        .catch((err) => {
                            setMediaState(MediaStates.PERMISSIONS_DENIED)
                            console.error(err)
                            return null
                        })
                    )
                }
            }}>Allow Camera + Mic</button>
            <button disabled={!canJoin} onClick={async() => {
                if (!canJoin) {
                    return
                }

                setMediaState(MediaStates.CONNECTING_SIGNALING)
                
                try {
                    const response = await fetch("/api/livekit/token", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            room: roomName,
                            identity,
                        })
                    })

                    const payload = (await response.json()) as LiveKitTokenResponse

                    if (!response.ok) {
                        throw new Error(payload.error ?? "Failed to fetch LiveKit token")
                    }

                    const { token, serverUrl } = payload as LiveKitTokenResponse;
                    if (!token || !serverUrl) {
                        throw new Error("Token response missing token or serverUrl")
                    }

                    const room = roomRef.current
                    if (!room) {
                        throw new Error("Room is not initialized")
                    }
                    await room.connect(serverUrl, token)
                    setMediaState(MediaStates.CONNECTED)
                } catch (error) {
                    console.error(error)
                    setMediaState(MediaStates.FAILED)
                }
            }}>Join Room</button>
            <button disabled={!canPublish} onClick={async() => {
                if (!canPublish) {
                    return
                }

                setMediaState(MediaStates.PUBLISHING_MEDIA)

                try {
                    const room = roomRef.current
                    const stream = mediaStream
                    if (!room || !stream) {
                      throw new Error("Room or media stream is not ready")
                    }

                    await publishPreparedStream(room, stream)
                    setMediaState(MediaStates.IN_SESSION)
                } catch (error) {
                    console.error(error)
                    setMediaState(MediaStates.FAILED)
                }
            }}>Publish Local Tracks</button>
            <section>
                <h2>You</h2>
                <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: 320, background: "#000" }}
                />
                </section>
                <section>
                    <h2>Remote</h2>
                    <div ref={remoteMediaRef} />
                </section>
        </div>
    )
}
