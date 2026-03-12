"use server";

/**
 * Server Action: Upload Avatar
 *
 * Uploads a profile photo to Supabase Storage (avatars bucket)
 * and saves the public URL to the User record.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AvatarUploadResult = {
    success: boolean;
    message: string;
    avatarUrl?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadAvatar(formData: FormData): Promise<AvatarUploadResult> {
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
        return { success: false, message: "No file provided" };
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { success: false, message: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image." };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        return { success: false, message: "File too large. Maximum size is 5MB." };
    }

    // Authenticate user
    const supabase = await createClient();

    if (!supabase) {
        return { success: false, message: "Authentication service unavailable" };
    }

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
        return { success: false, message: "You must be logged in to upload an avatar" };
    }

    try {
        // Generate unique file path
        const timestamp = Date.now();
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `${authUser.id}/${timestamp}.${ext}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            console.error("[Avatar] Upload error:", uploadError);
            return { success: false, message: "Failed to upload image. Please try again." };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        const avatarUrl = urlData.publicUrl;

        // Update user record in database
        await prisma.user.update({
            where: { id: authUser.id },
            data: { avatar_url: avatarUrl },
        });

        // Revalidate to reflect changes across the app
        revalidatePath("/", "layout");

        return {
            success: true,
            message: "Profile photo updated successfully",
            avatarUrl,
        };
    } catch (error) {
        console.error("[Avatar] Error:", error);
        return { success: false, message: "Failed to update profile photo. Please try again." };
    }
}
