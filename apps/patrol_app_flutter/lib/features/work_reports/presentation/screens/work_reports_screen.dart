import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/media_helpers.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../data/repositories/work_reports_repository.dart';

class WorkReportsScreen extends StatefulWidget {
  const WorkReportsScreen({super.key});

  @override
  State<WorkReportsScreen> createState() => _WorkReportsScreenState();
}

class _WorkReportsScreenState extends State<WorkReportsScreen> {
  final _repository = WorkReportsRepository();
  List<WorkReport> _reports = [];
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
      final reports = await _repository.fetchMine();
      if (mounted) {
        setState(() => _reports = reports);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _error = 'Failed to load work reports');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('My Work Reports'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => const SubmitWorkReportScreen(),
            ),
          );
          _load();
        },
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Submit'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? EmptyState(
                  iconData: Icons.cloud_off,
                  title: _error!,
                  actionLabel: 'Retry',
                  onAction: _load,
                )
              : _reports.isEmpty
                  ? EmptyState(
                      iconData: Icons.assignment_outlined,
                      title: 'No work reports yet',
                      subtitle: 'Submit your daily work report',
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
                        itemCount: _reports.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final report = _reports[index];
                          return AppCard(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        report.title,
                                        style: AppTypography.smallMedium,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    StatusBadge(status: report.status),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                if (report.description.isNotEmpty) ...[
                                  Text(
                                    report.description,
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                    style: AppTypography.small,
                                  ),
                                  const SizedBox(height: 6),
                                ],
                                Row(
                                  children: [
                                    Icon(
                                      Icons.calendar_today_outlined,
                                      size: 13,
                                      color: AppColors.textMuted,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      report.reportDate ??
                                          Formatters.formatDate(
                                            report.createdAt,
                                          ),
                                      style: AppTypography.caption,
                                    ),
                                    const Spacer(),
                                    Text(
                                      Formatters.formatDateTime(
                                        report.createdAt,
                                      ),
                                      style: AppTypography.caption,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

class SubmitWorkReportScreen extends StatefulWidget {
  const SubmitWorkReportScreen({super.key});

  @override
  State<SubmitWorkReportScreen> createState() => _SubmitWorkReportScreenState();
}

class _SubmitWorkReportScreenState extends State<SubmitWorkReportScreen> {
  final _repository = WorkReportsRepository();
  final _title = TextEditingController();
  final _description = TextEditingController();
  DateTime? _date;
  double? _latitude;
  double? _longitude;
  bool _locating = false;
  bool _submitting = false;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _captureLocation() async {
    setState(() => _locating = true);
    final loc = await MediaHelpers.pickLocationOrFallback();
    if (loc != null && mounted) {
      setState(() {
        _latitude = loc.latitude;
        _longitude = loc.longitude;
      });
    }
    if (mounted) setState(() => _locating = false);
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _date ?? now,
      firstDate: DateTime(now.year - 1),
      lastDate: now,
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _submit() async {
    if (_title.text.trim().isEmpty || _description.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title and description are required')),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      await _repository.submit(
        SubmitWorkReportPayload(
          title: _title.text.trim(),
          description: _description.text.trim(),
          reportDate: _date?.toIso8601String().split('T').first,
          latitude: _latitude,
          longitude: _longitude,
        ),
      );
      if (!mounted) return;
      Navigator.of(context).pop(true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Work report submitted successfully')),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit work report')),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: const Text('Submit Work Report'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: _title,
            decoration: const InputDecoration(
              labelText: 'Title',
              hintText: 'e.g. Shift report — Bole patrol',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _description,
            maxLines: 6,
            decoration: const InputDecoration(
              labelText: 'Description',
              hintText: 'Describe your activities, incidents handled, notes...',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 16),
          ListTile(
            tileColor: AppColors.card,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            leading: const Icon(Icons.calendar_today_outlined),
            title: Text(
              _date == null
                  ? 'Report date (today)'
                  : _date!.toIso8601String().split('T').first,
              style: AppTypography.smallMedium,
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: _pickDate,
          ),
          const SizedBox(height: 12),
          ListTile(
            tileColor: AppColors.card,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            leading: Icon(
              _latitude != null
                  ? Icons.location_on
                  : Icons.location_off_outlined,
            ),
            title: Text(
              _latitude != null
                  ? 'Location captured'
                  : _locating
                      ? 'Getting location...'
                      : 'Attach current location (optional)',
              style: AppTypography.smallMedium,
            ),
            trailing: _locating
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.chevron_right),
            onTap: _locating ? null : _captureLocation,
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              minimumSize: const Size.fromHeight(50),
            ),
            child: _submitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text('Submit Work Report'),
          ),
        ],
      ),
    );
  }
}