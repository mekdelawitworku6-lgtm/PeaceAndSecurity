"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useRouter } from "next/navigation";
import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageThunk,
  setActiveConversation,
  addMessage,
  selectConversations,
  selectMessages,
  selectActiveConversationId,
  selectChatLoading,
  selectMessagesPage,
  selectMessagesTotalPages,
  selectMessagesTotal,
  selectMessagesLoading,
} from "@/lib/store/chatSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  User,
  Users,
  Eye,
  ChevronUp,
  CircleCheck,
  CircleX,
  X,
  ExternalLink,
} from "lucide-react";
import type { Socket } from "socket.io-client";
import { getChatSocket } from "@/lib/socket";
import { chatService } from "@/lib/services/chat-service";
import { cn } from "@/lib/utils";

function getSenderBadgeColor(senderType: string) {
  switch (senderType) {
    case "citizen": return "bg-blue-100 text-blue-800 border-blue-200";
    case "patrol": return "bg-green-100 text-green-800 border-green-200";
    case "admin": return "bg-purple-100 text-purple-800 border-purple-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getSenderLabel(senderType: string) {
  switch (senderType) {
    case "citizen": return "Citizen";
    case "patrol": return "Patrol Officer";
    case "admin": return "Administrator";
    default: return senderType;
  }
}

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const conversations = useAppSelector(selectConversations);
  const messages = useAppSelector(selectMessages);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const loading = useAppSelector(selectChatLoading);
  const messagesPage = useAppSelector(selectMessagesPage);
  const messagesTotalPages = useAppSelector(selectMessagesTotalPages);
  const messagesTotal = useAppSelector(selectMessagesTotal);
  const messagesLoading = useAppSelector(selectMessagesLoading);

  const [messageText, setMessageText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedReadBy, setExpandedReadBy] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const s = getChatSocket(token);

    s.on("connect", () => console.log("Chat socket connected"));
    s.on("chat:message", (msg: any) => {
      if (msg.conversationId === activeConversationId) {
        dispatch(addMessage(msg));
      }
      dispatch(fetchConversations() as any);
    });
    s.on("chat:conversation_created", () => {
      dispatch(fetchConversations() as any);
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    if (activeConversationId) {
      dispatch(fetchMessages({ conversationId: activeConversationId, page: 1, limit: 20 }));
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("fullName") || localStorage.getItem("email") || "Admin";
      chatService.markAsRead(activeConversationId).catch(() => {});
      if (socket) {
        socket.emit("chat:read", { conversationId: activeConversationId, readerId: userId, readerName: userName });
      }
    }
  }, [activeConversationId, dispatch, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socket && activeConversationId) {
      socket.emit("chat:join", { conversationId: activeConversationId });
    }
  }, [socket, activeConversationId]);

  const handleLoadMore = useCallback(() => {
    if (activeConversationId && messagesPage < messagesTotalPages) {
      dispatch(fetchMessages({ conversationId: activeConversationId, page: messagesPage + 1, limit: 20 }));
    }
  }, [activeConversationId, messagesPage, messagesTotalPages, dispatch]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeConversationId) return;
    try {
      await dispatch(sendMessageThunk({
        conversationId: activeConversationId,
        data: { content: messageText },
      })).unwrap();
      setMessageText("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to send");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversations = conversations.filter((conv: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const reportTitle = conv.report?.title || conv.report?.type || "";
    const convId = conv.id?.toLowerCase() || "";
    const lastMsg = conv.lastMessage?.content?.toLowerCase() || "";
    return reportTitle.toLowerCase().includes(q) || convId.includes(q) || lastMsg.includes(q);
  });

  const activeConversation = conversations.find((c: any) => c.id === activeConversationId);

  const participants = useMemo(() => {
    const map = new Map<string, { senderId: string; senderName: string; senderType: string }>();
    messages.forEach((msg: any) => {
      if (!map.has(msg.senderId)) {
        map.set(msg.senderId, {
          senderId: msg.senderId,
          senderName: msg.senderName || msg.senderId?.slice(0, 8),
          senderType: msg.senderType,
        });
      }
    });
    return Array.from(map.values());
  }, [messages]);

  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation List */}
      <Card className="w-96 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Conversations</CardTitle>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-2"
          />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <p className="text-muted-foreground text-sm p-2">Loading...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="text-muted-foreground text-sm p-2">No conversations found</p>
          ) : (
            filteredConversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => dispatch(setActiveConversation(conv.id))}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all border",
                  activeConversationId === conv.id
                    ? "bg-[#0d2d82] text-white border-[#0d2d82] shadow-sm"
                    : "hover:bg-slate-50 border-transparent hover:border-slate-200"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {conv.report?.title || conv.report?.type || `Report ${conv.reportId?.slice(0, 8)}`}
                    </p>
                    <p className="text-xs opacity-70 mt-0.5">
                      {conv.report?.caseId && `Case: ${conv.report.caseId}`}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <div className="mt-2">
                    <p className="text-xs truncate opacity-60">
                      <span className="font-medium">{conv.lastMessage.senderName || conv.lastMessage.senderType}:</span>{" "}
                      {conv.lastMessage.content}
                    </p>
                    <p className="text-xs opacity-50 mt-0.5">
                      {new Date(conv.lastMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {!conv.lastMessage && (
                  <p className="text-xs opacity-50 mt-2">No messages yet</p>
                )}
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/chat/${conv.id}`); }}
                    className={cn(
                      "inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                      activeConversationId === conv.id
                        ? "text-blue-200 hover:text-white"
                        : "text-muted-foreground hover:text-[#0d2d82] hover:bg-slate-100"
                    )}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Details
                  </button>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col">
        {activeConversationId ? (
          <>
            {/* Conversation Header with participants */}
            {activeConversation && (
              <div className="border-b px-6 py-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-[#0d2d82]" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {activeConversation.report?.title || activeConversation.report?.type || `Report ${activeConversation.reportId?.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Case: {activeConversation.report?.caseId || "N/A"} &bull; {messagesTotal} messages &bull; Created {new Date(activeConversation.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {participants.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-xs text-muted-foreground mr-1">Participants:</span>
                    {participants.map((p) => (
                      <span
                        key={p.senderId}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border",
                          getSenderBadgeColor(p.senderType)
                        )}
                      >
                        <User className="h-3 w-3" />
                        {p.senderName}
                        <span className="opacity-60">({getSenderLabel(p.senderType)})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Load More Button */}
              {messagesPage < messagesTotalPages && (
                <div className="text-center py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={messagesLoading}
                    className="text-xs"
                  >
                    {messagesLoading ? (
                      "Loading..."
                    ) : (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Load older messages ({messagesTotalPages - messagesPage} more pages)
                      </>
                    )}
                  </Button>
                </div>
              )}

              {messagesLoading && messages.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">Loading messages...</p>
              )}

              {messages.map((msg: any) => {
                const isOwn = msg.senderId === currentUserId;
                const readByList: Array<{ userId: string; userName?: string; readAt: Date }> = msg.readBy || [];
                const notReadBy = participants.filter(
                  (p) => p.senderId !== msg.senderId && !readByList.some((r: any) => r.userId === p.senderId)
                );

                return (
                  <div key={msg.id} className="flex flex-col">
                    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[70%] rounded-xl px-4 py-3 text-sm shadow-sm", isOwn ? "bg-[#0d2d82] text-white" : "bg-white border border-slate-200")}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", getSenderBadgeColor(msg.senderType))}>
                            {getSenderLabel(msg.senderType)}
                          </span>
                          <span className={cn("text-xs", isOwn ? "text-blue-100" : "text-muted-foreground")}>
                            {msg.senderName || msg.senderId?.slice(0, 8)}
                          </span>
                        </div>

                        <p className={cn(isOwn ? "text-white" : "text-slate-900")}>{msg.content}</p>

                        <div className="flex items-center justify-between mt-2 gap-3">
                          <span className={cn("text-xs", isOwn ? "text-blue-200" : "text-muted-foreground")}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>

                          <button
                            onClick={() => setExpandedReadBy(expandedReadBy === msg.id ? null : msg.id)}
                            className={cn(
                              "flex items-center gap-1 text-xs transition-colors",
                              isOwn ? "text-blue-200 hover:text-white" : "text-muted-foreground hover:text-slate-900"
                            )}
                          >
                            {readByList.length > 0 ? (
                              <>
                                <CheckCheck className="h-3.5 w-3.5" />
                                <span>Read by {readByList.length}</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>{isOwn ? "Delivered" : "No reads yet"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Read/Not-Read Panel */}
                    {expandedReadBy === msg.id && (
                      <div className={cn("mt-1", isOwn ? "mr-4 ml-12" : "ml-4 mr-12")}>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                          <div>
                            <p className="font-medium text-green-700 flex items-center gap-1 mb-1">
                              <CircleCheck className="h-3.5 w-3.5" /> Read by:
                            </p>
                            {readByList.length === 0 ? (
                              <p className="text-slate-400 ml-5">No one has read this yet</p>
                            ) : (
                              readByList.map((reader: any, idx: number) => (
                                <p key={idx} className="text-slate-600 ml-5 flex items-center gap-1">
                                  <Check className="h-3 w-3 text-green-600" />
                                  <span>{reader.userName || reader.userId}</span>
                                  <span className="text-slate-400">&bull; {new Date(reader.readAt).toLocaleString()}</span>
                                </p>
                              ))
                            )}
                          </div>

                          {notReadBy.length > 0 && (
                            <div>
                              <p className="font-medium text-red-600 flex items-center gap-1 mb-1">
                                <CircleX className="h-3.5 w-3.5" /> Not read by:
                              </p>
                              {notReadBy.map((p) => (
                                <p key={p.senderId} className="text-slate-500 ml-5 flex items-center gap-1">
                                  <X className="h-3 w-3 text-red-400" />
                                  {p.senderName}
                                  <span className="text-slate-400">({getSenderLabel(p.senderType)})</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!messageText.trim()} className="bg-[#0d2d82] hover:bg-[#1a3d8f]">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Select a conversation to view messages</p>
              <p className="text-sm mt-1">Choose a conversation from the left panel</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
