import 'report_type.dart';
class Message {
  final String id;
  final String conversationId;
  final String? senderId;
  final String? senderType;
  final String? senderName;
  final String content;
  final bool isRead;
  final String? createdAt;

  const Message({
    required this.id,
    required this.conversationId,
    this.senderId,
    this.senderType,
    this.senderName,
    required this.content,
    this.isRead = false,
    this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) => Message(
        id: json['id'] as String,
        conversationId: json['conversationId'] as String? ?? '',
        senderId: json['senderId'] as String?,
        senderType: json['senderType'] as String?,
        senderName: json['senderName'] as String?,
        content: json['content'] as String? ?? '',
        isRead: json['isRead'] as bool? ?? false,
        createdAt: json['createdAt'] as String?,
      );
}

class Conversation {
  final String id;
  final String reportId;
  final ReportRef? report;
  final String? createdAt;
  final String? updatedAt;
  final Message? lastMessage;
  final int unreadCount;

  const Conversation({
    required this.id,
    required this.reportId,
    this.report,
    this.createdAt,
    this.updatedAt,
    this.lastMessage,
    this.unreadCount = 0,
  });

  String get title =>
      report?.caseId ?? report?.typeLabel ?? 'Conversation';

  factory Conversation.fromJson(Map<String, dynamic> json) => Conversation(
        id: json['id'] as String,
        reportId: json['reportId'] as String? ?? '',
        report: json['report'] != null
            ? ReportRef.fromJson(json['report'] as Map<String, dynamic>)
            : null,
        createdAt: json['createdAt'] as String?,
        updatedAt: json['updatedAt'] as String?,
        lastMessage: json['lastMessage'] != null
            ? Message.fromJson(json['lastMessage'] as Map<String, dynamic>)
            : null,
        unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
      );

  Conversation copyWith({int? unreadCount, Message? lastMessage, String? updatedAt}) =>
      Conversation(
        id: id,
        reportId: reportId,
        report: report,
        createdAt: createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        lastMessage: lastMessage ?? this.lastMessage,
        unreadCount: unreadCount ?? this.unreadCount,
      );
}

class ReportRef {
  final String? id;
  final String? caseId;
  final String? violationType;
  final ReportType? reportType;
  final String? reportDescription;
  final String? status;

  const ReportRef({
    this.id,
    this.caseId,
    this.violationType,
    this.reportType,
    this.reportDescription,
    this.status,
  });

  String get typeLabel =>
      reportType?.name ?? violationType ?? 'Report';

  factory ReportRef.fromJson(Map<String, dynamic> json) => ReportRef(
        id: json['id'] as String?,
        caseId: json['caseId'] as String?,
        violationType: json['violationType'] as String?,
        reportType: json['reportType'] != null
            ? ReportType.fromJson(json['reportType'] as Map<String, dynamic>)
            : null,
        reportDescription: json['reportDescription'] as String?,
        status: json['status'] as String?,
      );
}

class MessagesPage {
  final List<Message> data;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  const MessagesPage({
    this.data = const [],
    this.total = 0,
    this.page = 1,
    this.limit = 50,
    this.totalPages = 0,
  });

  factory MessagesPage.fromJson(Map<String, dynamic> json) => MessagesPage(
        data: (json['data'] as List? ?? [])
            .whereType<Map<String, dynamic>>()
            .map(Message.fromJson)
            .toList(),
        total: json['total'] as int? ?? 0,
        page: json['page'] as int? ?? 1,
        limit: json['limit'] as int? ?? 50,
        totalPages: json['totalPages'] as int? ?? 0,
      );
}