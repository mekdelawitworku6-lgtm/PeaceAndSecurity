import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/models/report_type.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/media_helpers.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/app_input.dart';
import '../../../../core/widgets/incident_map.dart';
import '../../../../core/widgets/media_thumb.dart';
import '../../../../core/widgets/screen.dart';
import '../../data/repositories/reports_repository.dart';
import '../bloc/reports_bloc.dart';

class CreateReportScreen extends StatefulWidget {
  const CreateReportScreen({super.key});

  @override
  State<CreateReportScreen> createState() => _CreateReportScreenState();
}

class _CreateReportScreenState extends State<CreateReportScreen> {
  final _description = TextEditingController();
  final _recorder = AudioRecorderController();

  List<ReportType> _types = const [];
  ReportType? _selectedType;
  String? _validationError;

  LocationResult? _location;
  bool _locLoading = true;

  final List<PickedMedia> _photos = [];
  PickedMedia? _video;
  PickedMedia? _audio;
  bool _recording = false;
  Duration _recordingElapsed = Duration.zero;

  bool _emergencyMode = false;
  int _severity = 1;
  bool _anonymous = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    context.read<ReportsBloc>().add(ReportsFetchTypesRequested());
    _types = _tryFetchTypes();
    setState(() {});
    _fetchLocation();
  }

  List<ReportType> _tryFetchTypes() {
    final state = context.read<ReportsBloc>().state;
    if (state.reportTypes.isNotEmpty) return state.reportTypes;
    return const [
      ReportType(id: 't1', name: 'Robbery', description: 'Theft or crime'),
      ReportType(id: 't2', name: 'Illegal Weapons', description: 'Illegal weapon possession'),
      ReportType(id: 't3', name: 'Forgery', description: 'Forgery, fraud or illegal money'),
      ReportType(id: 't4', name: 'Security Threat', description: 'Threat to security'),
      ReportType(id: 't5', name: 'Street Children', description: 'Street children / begging'),
      ReportType(id: 't6', name: 'Disruptive Activity', description: 'Disruptive or illegal activity'),
      ReportType(id: 't7', name: 'Illegal Business', description: 'Illegal business or broker activity'),
      ReportType(id: 't8', name: 'Event Security', description: 'Event / holiday security screen'),
      ReportType(id: 't9', name: 'Inspection Request', description: 'Institution inspection request'),
      ReportType(id: 't10', name: 'Noise Pollution', description: 'Excessive noise'),
    ];
  }

  Future<void> _fetchLocation() async {
    setState(() => _locLoading = true);
    final loc = await MediaHelpers.pickLocationOrFallback();
    if (mounted) {
      setState(() {
        _location = loc;
        _locLoading = false;
      });
    }
  }

  Future<void> _addPhotos() async {
    final remaining = 4 - _photos.length;
    if (remaining <= 0) return;
    final picked = await MediaHelpers.pickImages(remaining);
    if (mounted && picked.isNotEmpty) {
      setState(() => _photos.addAll(picked));
    }
  }

  Future<void> _addVideo() async {
    final picked = await MediaHelpers.pickVideo();
    if (mounted && picked != null) {
      setState(() => _video = picked);
    }
  }

  Future<void> _toggleRecording() async {
    if (_recording) {
      final media = await _recorder.stop();
      if (mounted && media != null) {
        setState(() {
          _audio = media;
          _recording = false;
        });
      }
    } else {
      try {
        final path = await _recorder.start();
        if (mounted && path != null) {
          setState(() => _recording = true);
          _tickRecording();
        }
      } catch (e) {
        if (mounted) {
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Recording failed'),
              content: Text(e.toString().replaceFirst('Exception: ', '')),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
      }
    }
  }

  void _tickRecording() {
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted && _recording) {
        setState(() => _recordingElapsed += const Duration(seconds: 1));
        _tickRecording();
      }
    });
  }

  void _submit({bool emergency = false}) {
    final t = context.l10n().t;
    if (_selectedType == null) {
      setState(() => _validationError = t('selectIncidentType'));
      return;
    }
    if (_description.text.trim().length < 5) {
      setState(() => _validationError = t('describeWhatHappened'));
      return;
    }
    if (_location == null) {
      setState(() => _validationError = t('noLocation'));
      return;
    }

    final payload = CreateReportPayload(
      violationType: _selectedType!.name,
      reportDescription: _description.text.trim(),
      latitude: _location!.latitude,
      longitude: _location!.longitude,
      address: _location!.address,
      isAnonymous: _anonymous,
      incidentDateTime: DateTime.now().toIso8601String(),
      isEmergency: emergency || _emergencyMode,
      images: _photos,
      video: _video,
      audio: _audio,
    );

    context.read<ReportsBloc>().add(ReportsCreateRequested(payload));
  }

  @override
  void dispose() {
    _description.dispose();
    _recorder.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return BlocConsumer<ReportsBloc, ReportsState>(
      listenWhen: (prev, curr) =>
          prev.submitting && !curr.submitting && curr.detail != null,
      listener: (context, state) {
        final report = state.detail!;
        context.go(
          '/create-report-success/${report.id}'
          '?caseId=${report.caseId ?? ''}&status=${report.status}'
          '&lat=${_location?.latitude ?? 9.03}'
          '&lng=${_location?.longitude ?? 38.74}',
        );
      },
      builder: (context, state) {
        final submitting = state.submitting;
        final error = state.error ?? _validationError;
        return Scaffold(
          backgroundColor: AppColors.background,
          body: Column(
            children: [
              AppHeader(
                title: 'Report Security Incident',
                subtitle: 'Attach images, videos, audio and description',
              ),
              Expanded(
                child: Screen(
                  scroll: true,
                  keyboard: true,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (error != null) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFfee2e2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            error,
                            style: AppTypography.small.copyWith(color: AppColors.danger),
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                      AppCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Attach images, videos, audio and description',
                              style: AppTypography.label,
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                _MediaButton(
                                  icon: Icons.photo_camera_outlined,
                                  label: 'Photos (${_photos.length}/4)',
                                  onTap: _addPhotos,
                                ),
                                const SizedBox(width: 8),
                                _MediaButton(
                                  icon: Icons.videocam_outlined,
                                  label: _video == null ? '+ Video' : 'Video Added',
                                  color: _video == null ? null : AppColors.success,
                                  onTap: _addVideo,
                                ),
                                const SizedBox(width: 8),
                                _MediaButton(
                                  icon: Icons.mic_none,
                                  label: _audio == null
                                      ? '+ Voice'
                                      : 'Audio Added',
                                  color: _recording
                                      ? AppColors.danger
                                      : (_audio == null ? null : AppColors.success),
                                  onTap: _toggleRecording,
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: List.generate(4, (i) {
                                if (i < _photos.length) {
                                  return Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: Stack(
                                      clipBehavior: Clip.none,
                                      children: [
                                        MediaThumb(
                                          uri: _photos[i].uri,
                                          size: 56,
                                        ),
                                        Positioned(
                                          right: -4,
                                          top: -4,
                                          child: GestureDetector(
                                            onTap: () => setState(
                                                () => _photos.removeAt(i)),
                                            child: Container(
                                              width: 18,
                                              height: 18,
                                              decoration: BoxDecoration(
                                                color: AppColors.danger,
                                                shape: BoxShape.circle,
                                              ),
                                              child: const Icon(
                                                Icons.close,
                                                size: 12,
                                                color: AppColors.white,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }
                                if (i == 0 && _photos.isEmpty) {
                                  return GestureDetector(
                                    onTap: _addPhotos,
                                    child: Container(
                                      width: 56,
                                      height: 56,
                                      decoration: BoxDecoration(
                                        color: AppColors.primarySoft,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: AppColors.primary,
                                          style: BorderStyle.solid,
                                        ),
                                      ),
                                      child: const Icon(
                                        Icons.add,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  );
                                }
                                return Container(
                                  width: 56,
                                  height: 56,
                                  margin: const EdgeInsets.only(right: 8),
                                  decoration: BoxDecoration(
                                    color: AppColors.background,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.border),
                                  ),
                                );
                              }),
                            ),
                            if (_video != null) ...[
                              const SizedBox(height: 10),
                              _AttachedPill(
                                icon: Icons.videocam_outlined,
                                label: _video!.fileName,
                                onRemove: () => setState(() => _video = null),
                              ),
                            ],
                            if (_audio != null || _recording) ...[
                              const SizedBox(height: 10),
                              _AttachedPill(
                                icon: Icons.mic_none,
                                label: _recording
                                    ? 'Recording ${Formatters.formatDuration(_recordingElapsed)}'
                                    : 'Voice Recording (${Formatters.formatDuration(_recordingElapsed)})',
                                isRecording: _recording,
                                onRemove: _recording
                                    ? null
                                    : () => setState(() => _audio = null),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      _EmergencyToggle(
                        enabled: _emergencyMode,
                        onChanged: (v) => setState(() => _emergencyMode = v),
                      ),
                      if (_emergencyMode) ...[
                        const SizedBox(height: 12),
                        AppCard(
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  _MediaButton(
                                    icon: Icons.photo_camera_outlined,
                                    label: 'Tap to capture photo\nor hold to record video',
                                    onTap: _addPhotos,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(t('minor'), style: AppTypography.small),
                                  Expanded(
                                    child: Slider(
                                      value: _severity.toDouble(),
                                      min: 0,
                                      max: 2,
                                      divisions: 2,
                                      activeColor: AppColors.danger,
                                      onChanged: (v) =>
                                          setState(() => _severity = v.round()),
                                    ),
                                  ),
                                  Text(t('severe'), style: AppTypography.small),
                                ],
                              ),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    ['Minor', 'Moderate', 'Severe'][_severity],
                                    style: AppTypography.smallMedium.copyWith(
                                      color: [
                                        AppColors.success,
                                        AppColors.accent,
                                        AppColors.danger,
                                      ][_severity],
                                    ),
                                  ),
                                  if (_location != null)
                                    Text(
                                      '📍 ${_location!.address}',
                                      style: AppTypography.caption,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      Text(t('incidentType'), style: AppTypography.h3),
                      const SizedBox(height: 8),
                      AppCard(
                        child: Column(
                          children: List.generate(_types.length, (i) {
                            final type = _types[i];
                            final selected = _selectedType?.id == type.id;
                            return InkWell(
                              onTap: () {
                                setState(() {
                                  _selectedType = type;
                                  _validationError = null;
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  border: Border(
                                    bottom: i == _types.length - 1
                                        ? BorderSide.none
                                        : const BorderSide(
                                            color: AppColors.divider),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 22,
                                      height: 22,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: selected
                                              ? AppColors.primary
                                              : AppColors.border,
                                          width: 2,
                                        ),
                                      ),
                                      child: selected
                                          ? Container(
                                              margin: const EdgeInsets.all(4),
                                              decoration: const BoxDecoration(
                                                color: AppColors.primary,
                                                shape: BoxShape.circle,
                                              ),
                                            )
                                          : null,
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        type.name,
                                        style: AppTypography.bodyMedium,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),
                        ),
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: t('description'),
                        hint: t('describeWhatHappened'),
                        controller: _description,
                        multiline: true,
                        maxLength: 500,
                      ),
                      const SizedBox(height: 16),
                      _LocationCard(
                        location: _location,
                        loading: _locLoading,
                        onRefresh: _fetchLocation,
                        onMapTap: (loc) => setState(() {
                          _location = loc;
                          _locLoading = false;
                        }),
                      ),
                      const SizedBox(height: 16),
                      _AnonymousToggle(
                        value: _anonymous,
                        onChanged: (v) => setState(() => _anonymous = v),
                      ),
                      const SizedBox(height: 24),
                      AppButton(
                        title: _emergencyMode
                            ? t('submitEmergency')
                            : t('submitReport'),
                        variant: _emergencyMode
                            ? AppButtonVariant.danger
                            : AppButtonVariant.primary,
                        loading: submitting,
                        onPressed: submitting ? null : () => _submit(),
                      ),
                      if (_emergencyMode) ...[
                        const SizedBox(height: 12),
                        AppButton(
                          title: t('submitReport'),
                          variant: AppButtonVariant.outline,
                          loading: false,
                          onPressed: submitting ? null : () => _submit(),
                        ),
                      ],
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _MediaButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;
  final VoidCallback onTap;

  const _MediaButton({
    required this.icon,
    required this.label,
    this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? AppColors.primary;
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: effectiveColor.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: effectiveColor.withValues(alpha: 0.4)),
          ),
          child: Column(
            children: [
              Icon(icon, color: effectiveColor, size: 22),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                style: AppTypography.caption.copyWith(
                  color: effectiveColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AttachedPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isRecording;
  final VoidCallback? onRemove;

  const _AttachedPill({
    required this.icon,
    required this.label,
    this.isRecording = false,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isRecording
            ? const Color(0xFFfee2e2)
            : AppColors.primaryLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: isRecording ? AppColors.danger : AppColors.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: AppTypography.smallMedium.copyWith(
                color: isRecording ? AppColors.danger : AppColors.primary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (isRecording)
            const Padding(
              padding: EdgeInsets.only(left: 4),
              child: Icon(Icons.record_voice_over, size: 14, color: AppColors.danger),
            )
          else if (onRemove != null)
            GestureDetector(
              onTap: onRemove,
              child: const Padding(
                padding: EdgeInsets.all(2),
                child: Icon(Icons.close, size: 16, color: AppColors.textMuted),
              ),
            ),
        ],
      ),
    );
  }
}

class _EmergencyToggle extends StatelessWidget {
  final bool enabled;
  final ValueChanged<bool> onChanged;

  const _EmergencyToggle({required this.enabled, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: enabled ? const Color(0xFFfef2f2) : AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: enabled ? Border.all(color: AppColors.danger) : null,
      ),
      child: Row(
        children: [
          const Text('🚨', style: TextStyle(fontSize: 18)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Emergency Mode',
              style: AppTypography.smallMedium,
            ),
          ),
          Switch(
            value: enabled,
            activeThumbColor: AppColors.primary,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class _LocationCard extends StatelessWidget {
  final LocationResult? location;
  final bool loading;
  final VoidCallback onRefresh;
  final ValueChanged<LocationResult> onMapTap;

  const _LocationCard({
    required this.location,
    required this.loading,
    required this.onRefresh,
    required this.onMapTap,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final loc = location;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(t('currentLocation'), style: AppTypography.label),
              ),
              GestureDetector(
                onTap: onRefresh,
                child: Text(
                  t('change'),
                  style: AppTypography.smallMedium.copyWith(color: AppColors.primary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              height: 130,
              child: loading || loc == null
                  ? Container(
                      color: AppColors.card,
                      child: Center(
                        child: loading
                            ? const CircularProgressIndicator(
                                color: AppColors.primary)
                            : const Icon(
                                Icons.location_off_outlined,
                                color: AppColors.textMuted,
                              ),
                      ),
                    )
                  : IncidentMap(
                      initialCenter: LatLng(loc.latitude, loc.longitude),
                      initialZoom: 15,
                      draggablePin: LatLng(loc.latitude, loc.longitude),
                      markers: const [],
                      markerColor: (m) => AppColors.primary,
                      onMapTap: (pos) => onMapTap(
                        LocationResult(
                          latitude: pos.latitude,
                          longitude: pos.longitude,
                          address:
                              '${pos.latitude.toStringAsFixed(5)}, ${pos.longitude.toStringAsFixed(5)}',
                        ),
                      ),
                    ),
            ),
          ),
          if (!loading && loc != null) ...[
            const SizedBox(height: 8),
            Text(
              loc.address.isNotEmpty
                  ? loc.address
                  : '${loc.latitude.toStringAsFixed(4)}, '
                      '${loc.longitude.toStringAsFixed(4)}',
              style: AppTypography.caption.copyWith(
                color: AppColors.textMuted,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }
}

class _AnonymousToggle extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;

  const _AnonymousToggle({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return AppCard(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t('reportAnonymously'), style: AppTypography.label),
                const SizedBox(height: 2),
                Text(t('anonymousSub'), style: AppTypography.caption),
              ],
            ),
          ),
          Switch(value: value, activeThumbColor: AppColors.primary, onChanged: onChanged),
        ],
      ),
    );
  }
}