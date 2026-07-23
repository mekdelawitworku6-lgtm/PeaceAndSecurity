"use client";

import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
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
} from "@/lib/store/chatSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, MessageSquare } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/api-config";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectConversations);
  const messages = useAppSelector(selectMessages);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const loading = useAppSelector(selectChatLoading);

  const [messageText, setMessageText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const wsUrl = getApiBaseUrl().replace("/api/", "");
    const s = io(wsUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    s.on("connect", () => console.log("Chat socket connected"));
    s.on("newMessage", (msg: any) => {
      if (msg.conversationId === activeConversationId) {
        dispatch(addMessage(msg));
      }
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    if (activeConversationId) {
      dispatch(fetchMessages(activeConversationId));
    }
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socket && activeConversationId) {
      socket.emit("joinConversation", activeConversationId);
    }
  }, [socket, activeConversationId]);

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

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation List */}
      <Card className="w-80 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <p className="text-muted-foreground text-sm p-2">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-muted-foreground text-sm p-2">No conversations</p>
          ) : (
            conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => dispatch(setActiveConversation(conv.id))}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                  activeConversationId === conv.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <p className="font-medium truncate">{conv.title || `Conversation ${conv.id.slice(0, 8)}`}</p>
                {conv.lastMessage && (
                  <p className="text-xs truncate mt-1 opacity-70">{conv.lastMessage.content}</p>
                )}
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col">
        {activeConversationId ? (
          <>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderUserId === localStorage.getItem("userId") ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                      msg.senderUserId === localStorage.getItem("userId")
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {msg.senderUser?.fullName || "Unknown"} • {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="border-t p-4 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!messageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
