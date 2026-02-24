import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courseVideos, generateBunnyEmbedUrl } from "@/lib/bunny";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to access course videos." },
                { status: 401 }
            );
        }

        // Check course access
        const courseAccess = await prisma.courseAccess.findUnique({
            where: { userId: session.user.id },
        });

        if (!courseAccess || courseAccess.status !== "active") {
            return NextResponse.json(
                { error: "You don't have access to this course. Please purchase to unlock." },
                { status: 403 }
            );
        }

        // Find the requested video
        const { id } = await params;
        const videoId = parseInt(id, 10);

        if (isNaN(videoId)) {
            return NextResponse.json(
                { error: "Invalid video ID" },
                { status: 400 }
            );
        }

        const video = courseVideos.find((v) => v.id === videoId);
        if (!video) {
            return NextResponse.json(
                { error: "Video not found" },
                { status: 404 }
            );
        }

        // Generate the Bunny embed URL
        const embedUrl = generateBunnyEmbedUrl(video.bunnyId);

        return NextResponse.json({
            video: {
                id: video.id,
                title: video.title,
                description: video.description,
                duration: video.duration,
                embedUrl,
                thumbnail: video.thumbnail,
            },
        });
    } catch (error: any) {
        console.error("[API/videos] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
