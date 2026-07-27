"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { chatService } from "@/lib/services/chat-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Users, Check, CheckCheck, CircleCheck, CircleX, X, MessageSquare, Clock, Eye } from "lucide-react";
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

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedReadBy, setExpandedReadBy] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [conversationId, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [convRes, msgRes] = await Promise.all([
        chatService.getConversations(),
        chatService.getMessages(conversationId, { page, limit: 20 }),
      ]);

      const convs = convRes.data?.data || convRes.data || [];
      const conv = Array.isArray(convs) ? convs.find((c: any) => c.id === conversationId) : null;
      setConversation(conv);

      const msgData = msgRes.data?.data || msgRes.data;
      if (msgData?.data) {
        setMessages(msgData.data);
        setTotal(msgData.total || 0);
        setTotalPages(msgData.totalPages || 1);
      } else if (Array.isArray(msgData)) {
        setMessages(msgData);
        setTotal(msgData.length);
        setTotalPages(1);
      }
    } catch {
      console.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const participants = useMemo(() => {
    const map = new Map<string, { senderId: string; senderName: string; senderType: string; messageCount: number; lastSeen: Date }>();
    messages.forEach((msg: any) => {
      const existing = map.get(msg.senderId);
      if (existing) {
        existing.messageCount++;
        if (new Date(msg.createdAt) > existing.lastSeen) {
          existing.lastSeen = new Date(msg.createdAt);
        }
      } else {
        map.set(msg.senderId, {
          senderId: msg.senderId,
          senderName: msg.senderName || msg.senderId?.slice(0, 8),
          senderType: msg.senderType,
          messageCount: 1,
          lastSeen: new Date(msg.createdAt),
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  }, [messages]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/chat")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Chat
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#0c2340]">Conversation Detail</h1>
          {conversation && (
            <p className="text-sm text-muted-foreground">
              Report: {conversation.report?.title || conversation.report?.type || conversation.reportId?.slice(0, 8)} &bull; {total} messages
            </p>
          )}
        </div>
      </div>

      {/* Participants Summary */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {participants.map((p) => {
                // Count how many messages each participant has read
                const messagesReadByP = messages.filter(
                  (msg: any) => msg.senderId !== p.senderId && (msg.readBy || []).some((r: any) => r.userId === p.senderId)
                ).length;
                const messagesSentByP = p.messageCount;
                const totalMessagesFromOthers = messages.filter((m: any) => m.senderId !== p.senderId).length;

                return (
                  <div key={p.senderId} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", getSenderBadgeColor(p.senderType))}>
                        {getSenderLabel(p.senderType)}
                      </span>
                      <span className="font-medium text-sm">{p.senderName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Sent {messagesSentByP} messages</p>
                      <p className="flex items-center gap-1"><Eye className="h-3 w-3" /> Read {messagesReadByP} of {totalMessagesFromOthers} messages from others</p>
                      <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last active: {p.lastSeen.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Messages with Full Read Receipts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Messages with Read Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No messages</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg: any) => {
                const readByList: Array<{ userId: string; userName?: string; readAt: Date }> = msg.readBy || [];
                const notReadBy = participants.filter(
                  (p) => p.senderId !== msg.senderId && !readByList.some((r: any) => r.userId === p.senderId)
                );
                const isExpanded = expandedReadBy === msg.id;

                return (
                  <div key={msg.id} className="border rounded-lg overflow-hidden">
                    {/* Message content */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", getSenderBadgeColor(msg.senderType))}>
                          {getSenderLabel(msg.senderType)}
                        </span>
                        <span className="font-medium text-sm">{msg.senderName || msg.senderId?.slice(0, 8)}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>

                      {/* Read receipt summary */}
                      <button
                        onClick={() => setExpandedReadBy(isExpanded ? null : msg.id)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-slate-900 transition-colors mt-1"
                      >
                        {readByList.length > 0 ? (
                          <CheckCheck className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {readByList.length > 0
                            ? `Read by ${readByList.length} of ${participants.length - 1}`
                            : "Not read by anyone yet"}
                        </span>
                        <span className="text-muted-foreground ml-1">{isExpanded ? "▲" : "▼"}</span>
                      </button>
                    </div>

                    {/* Expanded read details */}
                    {isExpanded && (
                      <div className="border-t bg-slate-50 p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Read By */}
                          <div>
                            <p className="font-medium text-green-700 flex items-center gap-1 text-xs mb-1">
                              <CircleCheck className="h-3.5 w-3.5" /> Read by:
                            </p>
                            {readByList.length === 0 ? (
                              <p className="text-slate-400 text-xs ml-5">No one</p>
                            ) : (
                              <div className="space-y-1">
                                {readByList.map((reader: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs ml-5">
                                    <Check className="h-3 w-3 text-green-600 shrink-0" />
                                    <span className="font-medium">{reader.userName || reader.userId}</span>
                                    <span className="text-slate-400">{new Date(reader.readAt).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Not Read By */}
                          <div>
                            <p className="font-medium text-red-600 flex items-center gap-1 text-xs mb-1">
                              <CircleX className="h-3.5 w-3.5" /> Not read by:
                            </p>
                            {notReadBy.length === 0 ? (
                              <p className="text-slate-400 text-xs ml-5">Everyone has read this</p>
                            ) : (
                              <div className="space-y-1">
                                {notReadBy.map((p) => (
                                  <div key={p.senderId} className="flex items-center gap-2 text-xs ml-5">
                                    <X className="h-3 w-3 text-red-400 shrink-0" />
                                    <span className="font-medium">{p.senderName}</span>
                                    <span className="text-slate-400">({getSenderLabel(p.senderType)})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} &bull; {total} total messages
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
