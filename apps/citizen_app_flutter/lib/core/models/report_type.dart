class ReportType {
  final String id;
  final String name;
  final String? description;
  final bool? isActive;
  final double? residentialDecibelThreshold;
  final double? commercialDecibelThreshold;

  const ReportType({
    required this.id,
    required this.name,
    this.description,
    this.isActive,
    this.residentialDecibelThreshold,
    this.commercialDecibelThreshold,
  });

  factory ReportType.fromJson(Map<String, dynamic> json) => ReportType(
        id: json['id'] as String,
        name: json['name'] as String? ?? '',
        description: json['description'] as String?,
        isActive: json['isActive'] as bool?,
        residentialDecibelThreshold:
            (json['residentialDecibelThreshold'] as num?)?.toDouble(),
        commercialDecibelThreshold:
            (json['commercialDecibelThreshold'] as num?)?.toDouble(),
      );
}