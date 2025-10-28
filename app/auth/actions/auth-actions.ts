import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


import bcrypt from 'bcryptjs';
import { prisma } from "@/lib/prisma";

export const getUserSessionServer = async() => {
  const session = await getServerSession(authOptions);

  return session?.user;
}


