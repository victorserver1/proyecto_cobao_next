'use server'
import { prisma } from "@/lib/prisma";
import { status } from "@prisma/client";
import path from "path";
import fs from 'fs';

export const getAudioList = async ( userId: string, isAdmin : boolean) => {


    if (!userId) throw new Error("userId es requerido");
    if (isAdmin) {
        return prisma.audio.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                author: true,
            },
        });
    }else {

    return prisma.audio.findMany({
        where: { userId: { equals: userId } },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: true,
        },
    });
    }
};

export const toggleBroadcastStatus = async (audioId: number, status: status) => {
 
        await prisma.audio.update({
        where: { id: audioId },
        data: { status: status },
    });




  
    
    // Aquí iría la lógica para iniciar la transmisión en vivo del audio
  
}

export const archiveAudio = async (audioId: number, status: status) => {

    status === 'ARCHIVED' ?
    await prisma.audio.update({
        where: { id: audioId },
        data: { status: 'DRAFT' },
    }) :
    
    await prisma.audio.update({
        where: { id: audioId },
        data: { status: 'ARCHIVED' },
    });
}

export const deleteAudio = async (audioId: number) => {
    // Primero elimina el archivo asociado
    await prisma.audio.findUnique({ where: { id: audioId } }).then(async (audio) => {
        if (audio) {
            const audioUrl = audio.url.split('/')[2]
            const filePath = path.join(process.cwd(), "public", "audio", audioUrl);

            try {
                // Aquí iría la lógica para eliminar el archivo del sistema de archivos
                await fs.promises.unlink(filePath);
                console.log('Archivo eliminado:', filePath);

            } catch (error) {
                console.error('Error al eliminar el archivo:', error);
                return false;
            }
        }
    });

    await prisma.audio.delete({
        where: { id: audioId },
    });

    console.log('Audio eliminado:', audioId);
    return true;
}