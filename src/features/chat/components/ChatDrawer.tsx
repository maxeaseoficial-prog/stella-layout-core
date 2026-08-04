import { useEffect, useState, useRef } from "react";
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
import { useAuth, TENANT_ID } from "@/features/auth/useAuth";
import { useUsuarios } from "@/features/usuarios/useUsuarios";
import { chatService } from "../services/chatService";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function ChatDrawer() {
  const [open, setOpen] = useState(false);
  const { 
    naoLidasTotais, 
    conversaAtivaId, 
    setConversaAtiva, 
    conversas, 
    mensagens, 
    init, 
    sendMessage,
    startPrivateChat,
    createGroup,
    setMensagens
  } = useChatStore();
  
  const { user: currentUser } = useAuth();
  const { usuarios } = useUsuarios();
  const [search, setSearch] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group creation state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser?.id) {
      init(currentUser.id);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (conversaAtivaId) {
      // Load messages if not already loaded
      if (!mensagens[conversaAtivaId]) {
        chatService.listarMensagens(conversaAtivaId).then(msgs => {
          setMensagens(conversaAtivaId, msgs);
        });
      }
      // Mark as read
      if (currentUser?.id) {
        chatService.marcarComoLida(conversaAtivaId, currentUser.id);
      }
    }
  }, [conversaAtivaId, currentUser?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens, conversaAtivaId]);

  const filteredUsers = usuarios.filter(u => 
    u.id !== currentUser?.id && 
    (u.nome.toLowerCase().includes(search.toLowerCase()) || 
     u.usuario.toLowerCase().includes(search.toLowerCase()))
  );

  const conversaAtiva = conversas.find(c => c.id === conversaAtivaId);
  const currentMessages = conversaAtivaId ? (mensagens[conversaAtivaId] || []) : [];

  const handleUserClick = async (userId: string) => {
    if (!currentUser) return;
    try {
      const convId = await startPrivateChat(TENANT_ID, currentUser.id, userId);
      setConversaAtiva(convId);
    } catch (error) {
      console.error("Erro ao iniciar chat:", error);
      toast.error(`Erro ao iniciar conversa: ${error instanceof Error ? error.message : (typeof error === 'object' ? JSON.stringify(error) : String(error))}`);
    }
  };

  const handleSendMessage = async () => {
    if (!msgInput.trim() || !conversaAtivaId || !currentUser) return;
    const text = msgInput;
    setMsgInput("");
    try {
      await sendMessage(conversaAtivaId, currentUser.id, text);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem.");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0 || !currentUser) {
      toast.error("Preencha o nome e selecione participantes.");
      return;
    }
    try {
      const id = await createGroup(TENANT_ID, groupName, currentUser.id, selectedParticipants);
      setShowGroupModal(false);
      setGroupName("");
      setSelectedParticipants([]);
      setConversaAtiva(id);
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      toast.error("Erro ao criar grupo.");
    }
  };

  const getChatName = (c: any) => chatService.getChatName(c, currentUser, usuarios);

  return (
    <>
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
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowGroupModal(true)}>
                      <UserPlus className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Pesquisar usuários..." 
                      className="pl-9 bg-surface-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </DrawerHeader>

                <ScrollArea className="flex-1 px-2">
                  <div className="py-2">
                    {conversas.length > 0 && (
                        <>
                            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversas</p>
                            {conversas.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setConversaAtiva(c.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-surface-muted/80 text-left"
                                >
                                    <Avatar className="h-12 w-12 border-2 border-background">
                                        {c.tipo === 'grupo' ? (
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                <UsersIcon className="h-6 w-6" />
                                            </AvatarFallback>
                                        ) : (
                                            <>
                                                <AvatarImage src={usuarios.find(u => u.id === c.participantes.find(p => p !== currentUser?.id))?.foto || undefined} />
                                                <AvatarFallback className="bg-primary-soft text-primary font-bold">
                                                    {getChatName(c).substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-foreground truncate">{getChatName(c)}</p>
                                            {c.ultimaMensagem && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(c.ultimaMensagem.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {c.ultimaMensagem ? c.ultimaMensagem.texto : "Inicie uma conversa"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </>
                    )}

                    <p className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contatos</p>
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleUserClick(u.id)}
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
                        {conversaAtiva?.tipo === 'grupo' ? (
                            <AvatarFallback className="bg-primary/10 text-primary">
                                <UsersIcon className="h-5 w-5" />
                            </AvatarFallback>
                        ) : (
                            <>
                                <AvatarImage src={usuarios.find(u => u.id === conversaAtiva?.participantes.find(p => p !== currentUser?.id))?.foto || undefined} />
                                <AvatarFallback className="bg-primary-soft text-primary">
                                    {getChatName(conversaAtiva).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </>
                        )}
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{conversaAtiva ? getChatName(conversaAtiva) : "Chat"}</p>
                      <p className="text-[10px] text-green-500 font-medium">Online</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-5 w-5" onClick={() => setOpen(false)} />
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 p-4 bg-surface-muted/30">
                  <div className="flex flex-col gap-4">
                    {currentMessages.length === 0 && (
                        <div className="flex flex-col items-center py-6 text-center">
                            <Avatar className="h-20 w-20 mb-3">
                            <AvatarFallback className="bg-primary-soft text-primary text-xl">
                                {getChatName(conversaAtiva).substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                            </Avatar>
                            <p className="font-bold text-lg">Início da conversa com {getChatName(conversaAtiva)}</p>
                            <p className="text-xs text-muted-foreground">As mensagens são criptografadas e seguras.</p>
                        </div>
                    )}
                    
                    {currentMessages.map((msg, i) => {
                        const isSelf = msg.remetenteId === currentUser?.id;
                        const remetente = usuarios.find(u => u.id === msg.remetenteId);
                        
                        return (
                            <div key={msg.id} className={cn("flex flex-col gap-1", isSelf ? "items-end" : "items-start")}>
                                {!isSelf && conversaAtiva?.tipo === 'grupo' && (
                                    <span className="text-[10px] text-muted-foreground ml-1">{remetente?.nome}</span>
                                )}
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                                    isSelf ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-background text-foreground border rounded-tl-none shadow-sm"
                                )}>
                                    {msg.texto}
                                    <div className={cn("text-[9px] mt-1 opacity-70 flex justify-end items-center gap-1")}>
                                        {new Date(msg.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background">
                  <div className="flex items-end gap-2 bg-surface-muted rounded-2xl p-2">
                    <Input 
                      placeholder="Digite sua mensagem..." 
                      className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 min-h-[40px]"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                      }}
                    />
                    <Button size="icon" className="h-9 w-9 rounded-xl shrink-0" onClick={handleSendMessage} disabled={!msgInput.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Grupo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Nome do Grupo</label>
              <Input id="name" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Ex: Produção, Vendas..." />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Participantes</label>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {usuarios.filter(u => u.id !== currentUser?.id).map(u => (
                  <div key={u.id} className="flex items-center space-x-2 p-2 hover:bg-surface-muted rounded-md transition-colors">
                    <Checkbox 
                      id={`user-${u.id}`} 
                      checked={selectedParticipants.includes(u.id)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedParticipants([...selectedParticipants, u.id]);
                        else setSelectedParticipants(selectedParticipants.filter(id => id !== u.id));
                      }}
                    />
                    <label htmlFor={`user-${u.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={u.foto || undefined} />
                        <AvatarFallback className="text-[10px]">{u.nome.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      {u.nome}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateGroup}>Criar Grupo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
