import NextAuth from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
const methodSchema = z.enum(["GET", "POST"]);
methodSchema.parse("GET");
methodSchema.parse("POST");

export { handler as GET, handler as POST };
