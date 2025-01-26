import { gameManager } from "@/server/gameManager";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { gameCode: string } }
) {
  const gameCode = params.gameCode;
  const exists = gameManager.getGame(gameCode) !== undefined;

  if (!exists) {
    return NextResponse.json({ exists: false }, { status: 404 });
  }

  return NextResponse.json({ exists: true });
}
