import { NextResponse } from "next/server";

export function jsendSuccess<T extends object>(data: T, status = 200): NextResponse {
    return NextResponse.json({
        status: "success",
        data
    },
    { status }
)
}
export function jsendFail<T extends object>(data: T, status = 400): NextResponse {
    return NextResponse.json({
        status: "fail",
        data
    },
    { status }
)
}
export function jsendError<T extends object>(message: string, code?: number, data?: T, status = 500): NextResponse {
    return NextResponse.json({
        status: "error",
        message,
        ...(code !== undefined && { code }),
        ...(data !== undefined && { data }),
    },
    { status }
)
}
