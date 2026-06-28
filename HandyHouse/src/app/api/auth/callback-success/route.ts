import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "login";

    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      console.error("No valid Google OAuth session found.");
      return NextResponse.redirect(
        new URL("/login?error=OAuthSessionError", request.url)
      );
    }

    const email = session.user.email;
    const name = session.user.name || "";

    // 1. Check if user already exists
    let dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (mode === "register") {
      // REGISTER FLOW: Reject existing user, otherwise create a new account
      if (dbUser) {
        const errorMessage = "Akun dengan email ini sudah terdaftar. Silakan login.";
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
        );
      }

      // Generate a long random password for OAuth users (they login via Google instead of password)
      const randomPassword =
        Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      // Determine role based on email or default to USER
      const role = email === "admin@tokorumah.com" ? "ADMIN" : "USER";

      dbUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      });
      console.log(`Created new user via Google OAuth register: ${email}`);
    } else {
      // LOGIN FLOW: Reject unregistered user, log in existing user
      if (!dbUser) {
        const errorMessage = "Akun Google ini belum terdaftar. Silakan lakukan registrasi terlebih dahulu.";
        return NextResponse.redirect(
          new URL(`/register?error=${encodeURIComponent(errorMessage)}`, request.url)
        );
      }
      console.log(`Logged in existing user via Google OAuth login: ${email}`);
    }

    // 3. Set the custom native auth-token session cookie
    const payload = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      name: dbUser.name || "",
    };

    const cookieStore = await cookies();
    cookieStore.set("auth-token", JSON.stringify(payload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // 4. Redirect to role-appropriate home dashboard
    const redirectUrl = dbUser.role === "ADMIN" ? "/scm" : "/products";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error: any) {
    console.error("Error in OAuth callback success route:", error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error.message || "OAuthCallbackError"
        )}`,
        request.url
      )
    );
  }
}
