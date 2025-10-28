export function slugify(input: string): string {
  return input
    .normalize('NFD')                    // separa acentos
    .replace(/[\u0300-\u036f]/g, '')    // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')       // quita símbolos
    .trim()
    .replace(/\s+/g, '-')               // espacios -> guiones
    .replace(/-+/g, '-')                // colapsa guiones
    .slice(0, 160)                      // límite (match con prisma)
}
