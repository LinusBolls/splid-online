import { NextRequest, NextResponse } from "next/server";

const HOSTNAME_WHITELIST = ["splid.herokuapp.com"];

export async function POST(req: NextRequest) {
  const body: { url: string; init: RequestInit } = await req.json();

  const { url: rawUrl, init } = body;

  const url = new URL(rawUrl);

  if (url.protocol !== "https:" || !HOSTNAME_WHITELIST.includes(url.hostname)) {
    return NextResponse.json(
      {
        message: `invalid url: must start with one of ${HOSTNAME_WHITELIST.map(
          (i) => "'https://" + i + "'"
        ).join(", ")}`,
      },
      { status: 400 }
    );
  }

  // @ts-expect-error
  if (init && !init?.headers?.Cookie) {
    if (!init.headers) {
      init.headers = {};
    }
    // @ts-expect-error
    init.headers.Cookie = req.headers.get("Cookie");
  }

  try {
    const fetchRes = await fetch(url, init);

    const data = await fetchRes.json();

    const res = NextResponse.json(data, {
      status: fetchRes.status,
      headers: {
        "Set-Cookie": fetchRes.headers.getSetCookie().join("; "),
      },
    });

    return res;
  } catch (err) {
    try {
      console.error(
        `[http-proxy] failed to fetch:`,
        // @ts-ignore
        JSON.parse(init.body),
        init.headers
      );
    } catch (err) {
      console.error(`[http-proxy] failed to fetch:`, init);
    }
    throw new Error("Failed to fetch");
  }
}
