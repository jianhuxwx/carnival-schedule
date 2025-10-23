import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const BACKEND_URL = process.env.BACKEND_URL || "https://api.carnival.keyfox.xyz"

async function proxy(req: NextRequest, ctx: { params: any }) {
  const p = await ctx.params
  const targetPath = "/" + ((p?.path as string[] | undefined)?.join("/") || "")
  const url = `${BACKEND_URL}${targetPath}`

  const init: RequestInit = {
    method: req.method,
    headers: new Headers(req.headers),
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
    cache: "no-store",
    redirect: "manual",
  }

  // Remove host header to avoid conflicts
  init.headers.delete("host")

  try {
    const res = await fetch(url, init)
    const contentType = res.headers.get("content-type") || ""
    const buffer = await res.arrayBuffer()

    const response = new NextResponse(Buffer.from(buffer), {
      status: res.status,
      headers: res.headers,
    })

    // Ensure same-origin CORS semantics; generally not necessary, but safe
    response.headers.set("Access-Control-Allow-Origin", "*")
    if (contentType) response.headers.set("content-type", contentType)
    return response
  } catch (err: any) {
    return NextResponse.json({ error: "Proxy request failed", details: String(err?.message || err) }, { status: 502 })
  }
}

export function GET(req: NextRequest, ctx: any) {
  return proxy(req, ctx)
}

export function POST(req: NextRequest, ctx: any) {
  return proxy(req, ctx)
}

export function PUT(req: NextRequest, ctx: any) {
  return proxy(req, ctx)
}

export function PATCH(req: NextRequest, ctx: any) {
  return proxy(req, ctx)
}

export function DELETE(req: NextRequest, ctx: any) {
  return proxy(req, ctx)
}

export function OPTIONS(req: NextRequest, ctx: any) {
  return proxy(req, ctx)
}


