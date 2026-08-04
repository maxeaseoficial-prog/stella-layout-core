import { useState } from "react";
import { MessageCircle, Search, UserPlus, Send, X, ChevronLeft, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useChatStore } from "../hooks/useChatStore";
import { useAuth } from "@/features/auth/useAuth";
import { useUsuarios } from "@/features/usuarios/useUsuarios";

export function ChatDrawer() {
  const [open, setOpen] = useState(false);
  const { naoLidasTotais, conversaAtivaId, setConversaAtiva } = useChatStore();
  const { user: currentUser } = useAuth();
  const { usuarios } = useUsuarios();
  const [search, setSearch] = useState("");

  const filteredUsers = usuarios.filter(u => 
    u.id !== currentUser?.id && 
    (u.nome.toLowerCase().includes(search.toLowerCase()) || 
     u.usuario.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          {naoLidasTotais > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {naoLidasTotais > 9 ? "9+" : naoLidasTotais}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen w-full sm:w-[450px] ml-auto rounded-none border-l">
        <div className="flex flex-col h-full">
          {!conversaAtivaId ? (
            <>
              <DrawerHeader className="border-b px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <DrawerTitle className="text-xl font-bold">Chat Interno</DrawerTitle>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Pesquisar usuários ou grupos..." 
                    className="pl-9 bg-surface-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </DrawerHeader>

              <ScrollArea className="flex-1 px-2">
                <div className="py-2">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contatos</p>
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setConversaAtiva(u.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-surface-muted/80 text-left"
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarImage src={u.foto || undefined} />
                          <AvatarFallback className="bg-primary-soft text-primary font-bold">
                            {u.nome.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-foreground truncate">{u.nome}</p>
                          <span className="text-[10px] text-muted-foreground">14:20</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">Clique para iniciar uma conversa</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConversaAtiva(null)}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary-soft text-primary">ST</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">Stella Espaço</p>
                    <p className="text-[10px] text-green-500 font-medium">Online</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-5 w-5" onClick={() => setOpen(false)} />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 p-4 bg-surface-muted/30">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center py-6">
                    <Avatar className="h-20 w-20 mb-3">
                      <AvatarFallback className="bg-primary-soft text-primary text-xl">ST</AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-lg">Início da conversa</p>
                    <p className="text-xs text-muted-foreground">As mensagens são criptografadas e seguras.</p>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-background">
                <div className="flex items-end gap-2 bg-surface-muted rounded-2xl p-2">
                  <Input 
                    placeholder="Digite sua mensagem..." 
                    className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 min-h-[40px]"
                  />
                  <Button size="icon" className="h-9 w-9 rounded-xl shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
