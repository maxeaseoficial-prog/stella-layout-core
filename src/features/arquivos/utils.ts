import {
  FileArchive,
  FileCode2,
  FileImage,
  FileText,
  FileType2,
  Layers,
  type LucideIcon,
} from "lucide-react";

import { isImagem } from "./types";

export function iconePorExtensao(ext: string): LucideIcon {
  const e = ext.toLowerCase();
  if (isImagem(e)) return FileImage;
  if (e === "pdf") return FileText;
  if (["dst", "pes", "emb"].includes(e)) return Layers;
  if (["ai", "cdr", "svg"].includes(e)) return FileCode2;
  if (["zip", "rar"].includes(e)) return FileArchive;
  return FileType2;
}

export function extensaoDoNome(nome: string): string {
  return (nome.split(".").pop() ?? "").toLowerCase();
}
