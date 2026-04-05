import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(request: Request) {
    try {
        // App Router'da body bu şekilde alınır
        const body = await request.json();
        const { email, name, password } = body;

        if (!email || !name || !password) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const existingUser = await prismadb.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 422 });
        }

        // bcrypt.hash kullanmalısın, sadece hash değil
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prismadb.user.create({
            data: {
                email,
                name,
                hashedPassword,
                image: "",
                emailVerified: new Date(),
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("REGISTER_ERROR:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}