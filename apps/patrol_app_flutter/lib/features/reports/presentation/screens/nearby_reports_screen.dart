import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import '../bloc/reports_bloc.dart';

class NearbyReportsScreen extends StatefulWidget {
  const NearbyReportsScreen({super.key});

  @override
  State<NearbyReportsScreen> createState() => _NearbyReportsScreenState();
}

class _NearbyReportsScreenState extends State<NearbyReportsScreen> {
  double _radiusKm = 10;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ReportsBloc>().add(
              ReportsFetchNearbyRequested(radiusKm: _radiusKm),
            );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<ReportsBloc>().state;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          AppHeader(title: 'Nearby Reports', showBack: true),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Search radius: ${_radiusKm.toStringAsFixed(0)} km',
                    style: AppTypography.smallMedium,
                  ),
                ),
                TextButton(
                  onPressed: () => context
                      .read<ReportsBloc>()
                      .add(ReportsFetchNearbyRequested(radiusKm: _radiusKm)),
                  child: const Text('Search'),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Slider(
              value: _radiusKm,
              min: 1,
              max: 50,
              divisions: 49,
              label: '${_radiusKm.toStringAsFixed(0)} km',
              activeColor: AppColors.primary,
              onChanged: (v) => setState(() => _radiusKm = v),
              onChangeEnd: (v) => context
                  .read<ReportsBloc>()
                  .add(ReportsFetchNearbyRequested(radiusKm: v)),
            ),
          ),
          if (state.loading && state.nearbyReports.isEmpty)
            const Expanded(
              child: Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            )
          else if (state.nearbyReports.isEmpty)
            Expanded(
              child: EmptyState(
                iconData: Icons.location_searching,
                title: 'No nearby reports',
                subtitle: 'Try increasing the search radius.',
                actionLabel: 'Refresh',
                onAction: () => context
                    .read<ReportsBloc>()
                    .add(ReportsFetchNearbyRequested(radiusKm: _radiusKm)),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                itemCount: state.nearbyReports.length,
                itemBuilder: (context, i) {
                  final r = state.nearbyReports[i];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AppCard(
                      padding: const EdgeInsets.all(14),
                      onTap: () => context.push(
                        '/report-detail/${r.id}?caseId=${r.caseId ?? ''}',
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  r.caseId ?? 'Report',
                                  style: AppTypography.smallMedium,
                                ),
                              ),
                              StatusBadge(status: r.status),
                            ],
                          ),
                          const SizedBox(height: 6),
                          if (r.reportDescription != null &&
                              r.reportDescription!.isNotEmpty) ...[
                            Text(
                              r.reportDescription!,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: AppTypography.small,
                            ),
                            const SizedBox(height: 6),
                          ],
                          Row(
                            children: [
                              Icon(Icons.place_outlined,
                                  size: 14, color: AppColors.textMuted),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  r.address ?? r.area ?? '—',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTypography.caption,
                                ),
                              ),
                              if (r.distanceKm != null)
                                Text(
                                  '${r.distanceKm!.toStringAsFixed(1)} km',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.schedule,
                                  size: 14, color: AppColors.textMuted),
                              const SizedBox(width: 4),
                              Text(
                                Formatters.formatDateTime(r.createdAt),
                                style: AppTypography.caption,
                              ),
                              if (r.isEmergency) ...[
                                const Spacer(),
                                Text(
                                  '🚨 ${t('emergency')}',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.danger,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}