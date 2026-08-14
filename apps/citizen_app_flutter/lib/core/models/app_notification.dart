class AppNotification {
  final String id;
  final String title;
  final String message;
  final String type;
  final Map<String, dynamic>? data;
  final bool isRead;
  final String? createdAt;

  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    this.type = 'GENERAL',
    this.data,
    this.isRead = false,
    this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      AppNotification(
        id: json['id'] as String,
        title: json['title'] as String? ?? '',
        message: json['message'] as String? ?? '',
        type: json['type'] as String? ?? 'GENERAL',
        data: json['data'] is Map<String, dynamic>
            ? (json['data'] as Map<String, dynamic>)
            : null,
        isRead: json['isRead'] as bool? ?? false,
        createdAt: json['createdAt'] as String?,
      );

  AppNotification copyWith({bool? isRead}) => AppNotification(
        id: id,
        title: title,
        message: message,
        type: type,
        data: data,
        isRead: isRead ?? this.isRead,
        createdAt: createdAt,
      );
}