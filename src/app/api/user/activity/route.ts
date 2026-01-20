import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { action, metadata } = await req.json();

    const activity = await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action,
        metadata: metadata || {},
      }
    });

    return NextResponse.json({ success: true, activity });

  } catch (error) {
    console.error("Activity tracking error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}