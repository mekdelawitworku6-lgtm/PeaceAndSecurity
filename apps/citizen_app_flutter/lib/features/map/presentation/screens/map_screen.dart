import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

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
  String _selectedSubcity = 'All';
  LatLng? _mapCenter;
  Report? _selectedReport;
  final _search = TextEditingController();

  static const List<String> _subcities = [
    'All',
    'Bole',
    'Kirkos',
    'Arada',
    'Yeka',
    'Lideta',
    'Nifas Silk',
    'Kolfe Keranio',
    'Gulele',
    'Akaky Kaliti',
    'Addis Ketema',
  ];

  static const Map<String, LatLng> _subcityCoords = {
    'Bole': LatLng(8.9806, 38.7844),
    'Kirkos': LatLng(9.0069, 38.7525),
    'Arada': LatLng(9.0350, 38.7520),
    'Yeka': LatLng(9.0322, 38.8050),
    'Lideta': LatLng(9.0125, 38.7350),
    'Nifas Silk': LatLng(8.9650, 38.7300),
    'Kolfe Keranio': LatLng(9.0150, 38.7050),
    'Gulele': LatLng(9.0650, 38.7400),
    'Akaky Kaliti': LatLng(8.9200, 38.7700),
    'Addis Ketema': LatLng(9.0300, 38.7300),
  };

  @override
  void initState() {
    super.initState();
    _search.addListener(() => setState(() {}));
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ReportsBloc>().add(const ReportsFetchNearbyRequested());
        context.read<ReportsBloc>().add(ReportsFetchMyRequested());
      }
    });
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  void _onSelectSubcity(String subcity) {
    setState(() {
      _selectedSubcity = subcity;
      if (subcity != 'All' && _subcityCoords.containsKey(subcity)) {
        _mapCenter = _subcityCoords[subcity];
      }
    });
  }

  List<Report> _filtered(List<Report> reports) {
    final query = _search.text.trim().toLowerCase();
    final subcityFilter = _selectedSubcity.toLowerCase();

    return reports.where((r) {
      final type = (r.violationType ?? '').toUpperCase();
      switch (_activeFilter) {
        case _Filter.crime:
          if (!type.contains('CRIME') &&
              !type.contains('ROBBERY') &&
              !r.isEmergency) {
            return false;
          }
          break;
        case _Filter.illegal:
          if (!type.contains('ILLEGAL') && !type.contains('VANDALISM')) {
            return false;
          }
          break;
        case _Filter.threat:
          if (!type.contains('THREAT') && !type.contains('WEAPON')) {
            return false;
          }
          break;
        case _Filter.all:
          break;
      }

      if (_selectedSubcity != 'All') {
        final address = (r.address ?? '').toLowerCase();
        final area = (r.area ?? '').toLowerCase();
        if (!address.contains(subcityFilter) && !area.contains(subcityFilter)) {
          return false;
        }
      }

      if (query.isNotEmpty) {
        final address = (r.address ?? '').toLowerCase();
        final area = (r.area ?? '').toLowerCase();
        final vType = (r.violationType ?? '').toLowerCase();
        final desc = (r.reportDescription ?? '').toLowerCase();
        final caseId = (r.caseId ?? '').toLowerCase();
        if (!address.contains(query) &&
            !area.contains(query) &&
            !vType.contains(query) &&
            !desc.contains(query) &&
            !caseId.contains(query)) {
          return false;
        }
      }

      return true;
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

  void _showIncidentsBottomSheet(BuildContext context, List<Report> reports) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.6,
          ),
          decoration: const BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${reports.length} Active Incidents',
                    style: AppTypography.h3,
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: reports.length,
                  separatorBuilder: (context, index) => const Divider(height: 1),
                  itemBuilder: (ctx, i) {
                    final r = reports[i];
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 0),
                      leading: CircleAvatar(
                        backgroundColor: r.isEmergency ? AppColors.danger.withValues(alpha: 0.15) : AppColors.primarySoft,
                        child: Icon(
                          r.isEmergency ? Icons.warning_amber_rounded : Icons.location_on_outlined,
                          color: r.isEmergency ? AppColors.danger : AppColors.primary,
                        ),
                      ),
                      title: Text(
                        r.violationType ?? 'Incident Report',
                        style: AppTypography.bodyMedium,
                      ),
                      subtitle: Text(
                        r.area ?? r.address ?? 'Addis Ababa',
                        style: AppTypography.caption,
                      ),
                      trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted),
                      onTap: () {
                        Navigator.pop(ctx);
                        setState(() => _selectedReport = r);
                        context.push('/report-detail/${r.id}?caseId=${r.caseId ?? ''}');
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showLocationFilterSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Filter by Location', style: AppTypography.h3),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _subcities.map((s) {
                final isSelected = _selectedSubcity == s;
                return ChoiceChip(
                  label: Text(s == 'All' ? 'All Locations' : s),
                  selected: isSelected,
                  onSelected: (_) {
                    _onSelectSubcity(s);
                    Navigator.pop(ctx);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<ReportsBloc>().state;
    final combined = <String, Report>{};
    for (final r in state.nearbyReports) {
      combined[r.id] = r;
    }
    for (final r in state.myReports) {
      combined[r.id] = r;
    }
    final allReports = combined.values.toList();
    final items = _filtered(allReports);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
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
                GestureDetector(
                  onTap: _showLocationFilterSheet,
                  child: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: _selectedSubcity != 'All' ? AppColors.primary : AppColors.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _selectedSubcity != 'All' ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Icon(
                      Icons.tune,
                      color: _selectedSubcity != 'All' ? Colors.white : AppColors.textMuted,
                    ),
                  ),
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
          const SizedBox(height: 8),
          SizedBox(
            height: 32,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _subcities.length,
              separatorBuilder: (_, _) => const SizedBox(width: 6),
              itemBuilder: (context, index) {
                final subcity = _subcities[index];
                final isSelected = _selectedSubcity == subcity;
                return GestureDetector(
                  onTap: () => _onSelectSubcity(subcity),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.card,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Text(
                      subcity == 'All' ? 'All Areas' : subcity,
                      style: AppTypography.caption.copyWith(
                        color: isSelected ? Colors.white : AppColors.text,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: Stack(
              children: [
                Positioned.fill(
                  child: IncidentMap(
                    initialCenter: _mapCenter,
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
                      final found = allReports
                          .where((r) => r.id == id)
                          .firstOrNull;
                      setState(() {
                        _selectedReport = found;
                      });
                      if (found != null) {
                        context.push('/report-detail/${found.id}?caseId=${found.caseId ?? ''}');
                      }
                    },
                    selectedId: _selectedReport?.id,
                  ),
                ),
                if (_selectedReport != null)
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 76,
                    child: _SelectedReportCard(
                      report: _selectedReport!,
                      onClose: () => setState(() => _selectedReport = null),
                      onViewDetails: () {
                        context.push('/report-detail/${_selectedReport!.id}?caseId=${_selectedReport!.caseId ?? ''}');
                      },
                    ),
                  ),
                Positioned(
                  left: 16,
                  right: 16,
                  bottom: 16,
                  child: GestureDetector(
                    onTap: () {
                      if (items.isNotEmpty) {
                        if (items.length == 1) {
                          final first = items.first;
                          setState(() => _selectedReport = first);
                          context.push('/report-detail/${first.id}?caseId=${first.caseId ?? ''}');
                        } else {
                          _showIncidentsBottomSheet(context, items);
                        }
                      }
                    },
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
                          Expanded(
                            child: Text(
                              t('activeIncidents'),
                              style: AppTypography.smallMedium,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          _LegendDot(color: AppColors.danger, label: 'Crime'),
                          const SizedBox(width: 8),
                          _LegendDot(color: AppColors.accent, label: 'Illegal'),
                          const SizedBox(width: 8),
                          _LegendDot(color: AppColors.info, label: 'Threat'),
                          const SizedBox(width: 4),
                          const Icon(Icons.chevron_right, size: 18, color: AppColors.textMuted),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
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

class _SelectedReportCard extends StatelessWidget {
  final Report report;
  final VoidCallback onClose;
  final VoidCallback onViewDetails;

  const _SelectedReportCard({
    required this.report,
    required this.onClose,
    required this.onViewDetails,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppShadows.card,
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: report.isEmergency
                      ? AppColors.danger.withValues(alpha: 0.15)
                      : AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  report.isEmergency ? 'EMERGENCY' : report.status,
                  style: AppTypography.caption.copyWith(
                    color: report.isEmergency ? AppColors.danger : AppColors.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: 10,
                  ),
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: onClose,
                child: const Icon(Icons.close, size: 18, color: AppColors.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            report.violationType ?? 'Incident Report',
            style: AppTypography.h3.copyWith(fontSize: 15),
          ),
          if (report.area != null && report.area!.isNotEmpty) ...[
            const SizedBox(height: 3),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 13, color: AppColors.textMuted),
                const SizedBox(width: 3),
                Expanded(
                  child: Text(
                    report.area!,
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
          if (report.reportDescription != null && report.reportDescription!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              report.reportDescription!,
              style: AppTypography.caption,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onViewDetails,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(vertical: 8),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('View Incident Details', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                  SizedBox(width: 6),
                  Icon(Icons.arrow_forward, size: 14),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}


