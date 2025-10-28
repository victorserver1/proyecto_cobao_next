import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import path from "path";
import fs from 'fs';


export const runtime = "nodejs"; // o "edge" si solo procesas en memoria

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const userId = form.get("userId") as string || 'no-user';
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ message: "No file" }, { status: 400 });
    }

  
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const readableStream = Readable.from(buffer);

    const format = file.type.split("/")[1];
    const outputFilePath = `/tmp/output.mp3`; // Ruta temporal en servidor

    // crear una ruta para guardar el archivo convertido con fs


    const uploadDir = path.join(process.cwd(), "public", "audio");
    const nameFile = `${Date.now()}.mp3`;

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, nameFile);
 

    if (format !== "mp3") {
        console.log("Converting to mp3...");
        // esperar a que termine la conversión
        await new Promise<void>((resolve, reject) => {
          
        ffmpeg()
          .input(readableStream)
          .toFormat("mp3")
          .on("error", (err) => {
            console.error("Error converting file:", err);
            reject(err);
          })
          .on("end", () => {
            console.log("File converted successfully");
            resolve();
          })
          .saveToFile(filePath);
    }
        );

    // si la conversión fue exitosa, guardar el archivo convertido
    const audio = await prisma.audio.create({
        data: {
            url: `/audio/${nameFile}`,
            userId: userId,
            title: form.get("name") as string || "Audio sin título"
        }
    });

    return NextResponse.json({ message: "Audio recibido y convertido", audio});

    } else {
        console.log("File is already mp3, saving directly.");
      // guardar directamente el archivo si ya es mp3
      fs.writeFileSync(filePath, buffer);
      const audio = await prisma.audio.create({
          data: {
              url: filePath,
              userId: "cmh2xvzgl0000nxkyuu6zifsu",
              title: form.get("name") as string || "Audio sin título"
          }
      });
      return NextResponse.json({ message: "Audio recibido sin conversión", audio });
    }
    // save in the database the path to the file

    
    
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Upload error" }, { status: 500 });
  }
}

