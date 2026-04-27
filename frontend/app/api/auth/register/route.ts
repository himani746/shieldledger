import { NextResponse } from "next/server";
import { addMockUser, findMockUserByEmail } from "@/lib/mockUsers";

type Body = {
  organisationName?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const organisationName = body.organisationName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!organisationName || !email || password.length < 8 || !email.includes("@")) {
    return NextResponse.json(
      { message: "Invalid registration payload." },
      { status: 400 },
    );
  }

  if (findMockUserByEmail(email)) {
    return NextResponse.json({ message: "User already exists." }, { status: 409 });
  }

  const user = addMockUser({ organisationName, email, password });
  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, organisationName: user.organisationName },
  });
}
