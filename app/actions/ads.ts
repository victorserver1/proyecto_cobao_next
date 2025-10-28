import { prisma } from "@/lib/prisma";

// get ads list
export const getAdsList = async ( ) => {
  const items = await prisma.ads.findMany({
    orderBy: { createdAt: "desc" },


  });
  return items;
};
