import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/models/report.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/incident_map.dart';
import '../../../reports/presentation/bloc/reports_bloc.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

enum _Filter { all, crime, illegal, threat }

class _MapScreenState extends State<MapScreen> {
  _Filter _activeFilter = _Filter.all;
  Report? _selectedReport;
  final _search = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ReportsBloc>().add(const ReportsFetchNearbyRequested());
      }
    });
  }

  List<Report> _filtered(List<Report> reports) {
    return reports.where((r) {
      final type = (r.violationType ?? '').toUpperCase();
      switch (_activeFilter) {
        case _Filter.crime:
          return type.contains('CRIME') ||
              type.contains('ROBBERY') ||
              r.isEmergency;
        case _Filter.illegal:
          return type.contains('ILLEGAL') || type.contains('VANDALISM');
        case _Filter.threat:
          return type.contains('THREAT') || type.contains('WEAPON');
        case _Filter.all:
          return true;
      }
    }).toList();
  }

  Color _pinColor(Map<String, dynamic> m) {
    final type = '${m['type']}'.toUpperCase();
    final emergency = m['emergency'] == true;
    if (emergency || type.contains('CRIME') || type.contains('ROBBERY')) {
      return AppColors.danger;
    }
    if (type.contains('ILLEGAL') || type.contains('VANDALISM')) {
      return AppColors.accent;
    }
    return AppColors.info;
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<ReportsBloc>().state;
    final nearby = state.nearbyReports;
    final items = _filtered(nearby);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(t('viewIncidentMap'), style: AppTypography.h2),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _search,
                    decoration: InputDecoration(
                      hintText: t('searchLocation'),
                      prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
                      isDense: true,
                      filled: true,
                      fillColor: AppColors.card,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.tune, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _FilterChip2(
                  label: t('all'),
                  active: _activeFilter == _Filter.all,
                  onTap: () => setState(() => _activeFilter = _Filter.all),
                ),
                _FilterChip2(
                  label: t('emergency'),
                  dotColor: AppColors.danger,
                  active: _activeFilter == _Filter.crime,
                  onTap: () => setState(() => _activeFilter = _Filter.crime),
                ),
                _FilterChip2(
                  label: t('illegalActivity'),
                  dotColor: AppColors.accent,
                  active: _activeFilter == _Filter.illegal,
                  onTap: () => setState(() => _activeFilter = _Filter.illegal),
                ),
                _FilterChip2(
                  label: t('securityThreat'),
                  dotColor: AppColors.info,
                  active: _activeFilter == _Filter.threat,
                  onTap: () => setState(() => _activeFilter = _Filter.threat),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: Stack(
              children: [
                Positioned.fill(
                  child: IncidentMap(
                    markers: items
                        .where((r) =>
                            r.latitude != 0 && r.longitude != 0)
                        .map((r) => {
                              'id': r.id,
                              'latitude': r.latitude,
                              'longitude': r.longitude,
                              'type': r.violationType ?? '',
                              'emergency': r.isEmergency,
                            })
                        .toList(),
                    markerColor: (m) => _pinColor(m),
                    onMarkerTap: (m) {
                      final id = '${m['id']}';
                      setState(() {
                        _selectedReport = nearby
                            .where((r) => r.id == id)
                            .firstOrNull;
                      });
                    },
                    selectedId: _selectedReport?.id,
                  ),
                ),
                Positioned(
                  left: 16,
                  right: 16,
                  bottom: 16,
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppShadows.card,
                    ),
                    child: Row(
                      children: [
                        Text(
                          '${items.length}',
                          style: AppTypography.h3.copyWith(color: AppColors.primary),
                        ),
                        const SizedBox(width: 6),
                        Text(t('activeIncidents'), style: AppTypography.smallMedium),
                        const Spacer(),
                        _LegendDot(color: AppColors.danger, label: 'Crime'),
                        const SizedBox(width: 10),
                        _LegendDot(color: AppColors.accent, label: 'Illegal'),
                        const SizedBox(width: 10),
                        _LegendDot(color: AppColors.info, label: 'Threat'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip2 extends StatelessWidget {
  final String label;
  final bool active;
  final Color? dotColor;
  final VoidCallback onTap;

  const _FilterChip2({
    required this.label,
    required this.active,
    this.dotColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: active ? AppColors.primary : AppColors.card,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: active ? AppColors.primary : AppColors.border),
          ),
          child: Row(
            children: [
              if (dotColor != null) ...[
                Container(
                  width: 7,
                  height: 7,
                  decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
                ),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: AppTypography.smallMedium.copyWith(
                  color: active ? AppColors.white : AppColors.textBody,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(label, style: AppTypography.caption),
      ],
    );
  }
}

