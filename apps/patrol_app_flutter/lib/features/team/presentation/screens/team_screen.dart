import 'package:flutter/material.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/media_helpers.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../data/team_repository.dart';

class TeamScreen extends StatefulWidget {
  const TeamScreen({super.key});

  @override
  State<TeamScreen> createState() => _TeamScreenState();
}

class _TeamScreenState extends State<TeamScreen> {
  final _repository = TeamRepository();
  PatrolTeam? _team;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final team = await _repository.fetchMyTeam();
      if (mounted) setState(() => _team = team);
    } catch (e) {
      if (mounted) setState(() => _error = 'Failed to load team');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          AppHeader(title: t('myTeam')),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? EmptyState(
                  iconData: Icons.cloud_off,
                  title: _error!,
                  actionLabel: 'Retry',
                  onAction: _load,
                )
              : _team == null
                  ? EmptyState(
                      iconData: Icons.groups_outlined,
                      title: t('noTeamAssigned'),
                      subtitle: t('noTeamSub'),
                      actionLabel: 'Retry',
                      onAction: _load,
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView(
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                        children: [
                          AppCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: const BoxDecoration(
                                        color: AppColors.primarySoft,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        Icons.groups_outlined,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            _team!.name ?? 'My Team',
                                            style: AppTypography.h3,
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            _team!.woredaName ??
                                                t('woreda'),
                                            style: AppTypography.small
                                                .copyWith(
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (_team!.code != null)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.primarySoft,
                                          borderRadius:
                                              BorderRadius.circular(999),
                                        ),
                                        child: Text(
                                          _team!.code!,
                                          style:
                                              AppTypography.caption.copyWith(
                                            color: AppColors.primary,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                if (_team!.leader != null) ...[
                                  const SizedBox(height: 14),
                                  const Divider(
                                    color: AppColors.divider,
                                    height: 1,
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    '${t('teamLeader')} · ${_team!.leader!.fullName ?? '—'}',
                                    style: AppTypography.smallMedium,
                                  ),
                                ],
                                const SizedBox(height: 14),
                                const Divider(
                                  color: AppColors.divider,
                                  height: 1,
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  '${t('teamMembers')} (${_team!.members.length})',
                                  style: AppTypography.smallMedium,
                                ),
                                const SizedBox(height: 8),
                                ..._team!.members.map(
                                  (m) => _MemberTile(
                                    member: m,
                                    isLeader: m.id == _team!.leader?.id,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                ),
        ],
      ),
    );
  }
}

class _MemberTile extends StatelessWidget {
  final TeamMember member;
  final bool isLeader;

  const _MemberTile({required this.member, this.isLeader = false});

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final online = member.isOnline;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primarySoft,
            backgroundImage: member.profileImage != null &&
                    member.profileImage!.isNotEmpty
                ? NetworkImage(assetUrl(member.profileImage))
                : null,
            child: member.profileImage == null ||
                    member.profileImage!.isEmpty
                ? Text(
                    (member.fullName?.isNotEmpty ?? false)
                        ? member.fullName![0]
                        : '?',
                    style: AppTypography.smallMedium,
                  )
                : null,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        member.fullName ?? '—',
                        style: AppTypography.smallMedium,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (isLeader) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primarySoft,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          t('teamLeader'),
                          style: AppTypography.caption.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                if (member.phoneNumber != null)
                  Text(
                    member.phoneNumber!,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMuted,
                    ),
                  ),
              ],
            ),
          ),
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: online ? AppColors.success : AppColors.textMuted,
                ),
              ),
              const SizedBox(width: 5),
              Text(
                online ? t('online') : t('offline'),
                style: AppTypography.caption.copyWith(
                  color: online ? AppColors.success : AppColors.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
