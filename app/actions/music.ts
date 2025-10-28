import { prisma } from "@/lib/prisma";

// get music list
export const getMusicList = async ( ) => {
  const items = await prisma.music.findMany({
    orderBy: { createdAt: "desc" },


  });
  return items;
};
