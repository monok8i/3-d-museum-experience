"use client"

import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useMuseum } from "@/lib/museum/store"

/**
 * Cinematic camera controller.
 *
 * - Smoothly frames the active room from a gentle standing viewpoint.
 * - Mouse position drives a subtle parallax "look-around" (no jarring orbit).
 * - On room change, the camera eases to the new framing.
 * Mobile fallback uses device-neutral defaults (centered look).
 */
export function CameraController() {
  const { camera, gl } = useThree()
  const roomIndex = useMuseum((s) => s.roomIndex)
  const activeExhibit = useMuseum((s) => s.activeExhibit)

  const mouse = useRef({ x: 0, y: 0 })
  const targetLook = useRef(new THREE.Vector3(0, 2.2, -8))
  const basePos = useRef(new THREE.Vector3(0, 2.6, 7))

  // Per-room camera framing.
  useEffect(() => {
    // Slightly different vantage points keep rooms feeling distinct.
    const frames: Record<number, { pos: [number, number, number]; look: [number, number, number] }> = {
      0: { pos: [0, 2.8, 8], look: [0, 2.4, -8] }, // lobby
      1: { pos: [0, 2.6, 6.5], look: [0, 2.0, -8] }, // origins
      2: { pos: [0, 2.7, 7.5], look: [0, 2.2, -6] }, // lab
      3: { pos: [0, 2.5, 6.5], look: [0, 1.8, -7] }, // lost
      4: { pos: [0, 2.7, 7], look: [0, 2.2, -8] }, // future
      5: { pos: [0, 3, 6], look: [0, 2.6, -10] }, // observatory
      6: { pos: [0, 3, 8], look: [0, 3, -12] }, // constellation
      7: { pos: [0, 2.6, 9], look: [0, 2.6, -10] }, // final
    }
    const f = frames[roomIndex] ?? frames[0]
    basePos.current.set(...f.pos)
    targetLook.current.set(...f.look)
  }, [roomIndex])

  useEffect(() => {
    const el = gl.domElement
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
    }
    el.addEventListener("pointermove", onMove)
    return () => el.removeEventListener("pointermove", onMove)
  }, [gl])

  useFrame(() => {
    // Parallax offset (reduced when an exhibit viewer is open).
    const damp = activeExhibit ? 0.15 : 1
    const offX = mouse.current.x * 1.1 * damp
    const offY = -mouse.current.y * 0.7 * damp

    const desired = new THREE.Vector3(
      basePos.current.x + offX,
      basePos.current.y + offY,
      basePos.current.z,
    )
    camera.position.lerp(desired, 0.045)

    const lookTarget = new THREE.Vector3(
      targetLook.current.x + offX * 0.6,
      targetLook.current.y + offY * 0.4,
      targetLook.current.z,
    )
    // Smoothly orient the camera.
    const m = new THREE.Matrix4()
    m.lookAt(camera.position, lookTarget, camera.up)
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(m)
    camera.quaternion.slerp(targetQuat, 0.06)
  })

  return null
}
