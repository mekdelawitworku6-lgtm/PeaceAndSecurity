import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/media_helpers.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/app_input.dart';
import '../../../../core/widgets/media_thumb.dart';
import '../../../../core/widgets/screen.dart';
import '../../data/repositories/reports_repository.dart';
import '../bloc/reports_bloc.dart';

class FollowUpScreen extends StatefulWidget {
  final String reportId;
  final String? caseId;

  const FollowUpScreen({
    super.key,
    required this.reportId,
    this.caseId,
  });

  @override
  State<FollowUpScreen> createState() => _FollowUpScreenState();
}

class _FollowUpScreenState extends State<FollowUpScreen> {
  final _notes = TextEditingController();
  final List<PickedMedia> _photos = [];
  final AudioRecorderController _recorder = AudioRecorderController();
  bool _recording = false;
  String? _recordingUri;
  double? _latitude;
  double? _longitude;
  bool _locating = false;

  @override
  void initState() {
    super.initState();
    _captureLocation();
  }

  @override
  void dispose() {
    _notes.dispose();
    _recorder.dispose();
    super.dispose();
  }

  Future<void> _captureLocation() async {
    setState(() => _locating = true);
    final loc = await MediaHelpers.pickLocationOrFallback();
    if (loc != null) {
      setState(() {
        _latitude = loc.latitude;
        _longitude = loc.longitude;
      });
    }
    if (mounted) setState(() => _locating = false);
  }

  Future<void> _pickPhotos() async {
    final remaining = 5 - _photos.length;
    if (remaining <= 0) return;
    final source = await showModalBottomSheet<int>(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primary),
                title: const Text('Take Photo with Camera'),
                onTap: () => Navigator.pop(ctx, 1),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
                title: const Text('Choose from Gallery'),
                onTap: () => Navigator.pop(ctx, 2),
              ),
            ],
          ),
        ),
      ),
    );
    if (source == null) return;
    if (source == 1) {
      final photo = await MediaHelpers.takePhoto();
      if (mounted && photo != null) {
        setState(() => _photos.add(photo));
      }
    } else if (source == 2) {
      final picked = await MediaHelpers.pickImages(remaining);
      if (mounted && picked.isNotEmpty) {
        setState(() => _photos.addAll(picked.take(remaining)));
      }
    }
  }

  Future<void> _toggleRecording() async {
    if (_recording) {
      final media = await _recorder.stop();
      setState(() {
        _recording = false;
        _recordingUri = media?.uri;
      });
    } else {
      final started = await _recorder.start();
      if (started != null) setState(() => _recording = true);
    }
  }

  Future<void> _submit() async {
    final notes = _notes.text.trim();
    if (notes.isEmpty) {
      _alert('Notes required', 'Please write your inspection notes.');
      return;
    }
    if (_latitude == null || _longitude == null) {
      _alert('Location required', 'Please wait for GPS location to load.');
      return;
    }
    final bloc = context.read<ReportsBloc>();
    final evidence = [..._photos];
    if (_recordingUri != null) {
      evidence.add(PickedMedia(
        uri: _recordingUri!,
        name: 'recording-${DateTime.now().millisecondsSinceEpoch}.m4a',
        mimeType: 'audio/mp4',
        file: File(_recordingUri!),
      ));
    }
    bloc.add(ReportsFollowUpRequested(
      reportId: widget.reportId,
      payload: FollowUpPayload(
        notes: notes,
        latitude: _latitude!,
        longitude: _longitude!,
        evidence: evidence,
      ),
    ));
  }

  void _alert(String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<ReportsBloc>().state;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          AppHeader(
            title: 'Follow-up',
            subtitle: widget.caseId ?? widget.reportId,
            showBack: true,
          ),
          Expanded(
            child: Screen(
              scroll: true,
              keyboard: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (state.error != null) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFfee2e2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        state.error!,
                        style:
                            AppTypography.small.copyWith(color: AppColors.danger),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _SectionTitle('GPS location'),
                        const SizedBox(height: 8),
                        if (_locating)
                          Row(
                            children: [
                              const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(context.l10n().t('locating'), style: AppTypography.small),
                            ],
                          )
                        else if (_latitude != null)
                          Text(
                            '${_latitude!.toStringAsFixed(6)}, '
                            '${_longitude!.toStringAsFixed(6)}',
                            style: AppTypography.smallMedium.copyWith(
                              color: AppColors.primary,
                            ),
                          )
                        else
                          Text(
                            'Unable to get GPS location. '
                            'Enable location and retry.',
                            style:
                                AppTypography.small.copyWith(color: AppColors.danger),
                          ),
                        const SizedBox(height: 8),
                        TextButton.icon(
                          onPressed: _captureLocation,
                          icon: const Icon(Icons.my_location, size: 16),
                          label: const Text('Retry location'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Inspection notes (required)',
                    style: AppTypography.label,
                  ),
                  const SizedBox(height: 8),
                  AppInput(
                    label: '',
                    hint: 'Describe what you found during inspection…',
                    controller: _notes,
                    multiline: true,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Photos (up to 5)',
                    style: AppTypography.label,
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ..._photos.map((p) => Stack(
                            clipBehavior: Clip.none,
                            children: [
                              MediaThumb(
                                uri: p.file?.path ?? '',
                                kind: 'image',
                                size: 84,
                              ),
                              Positioned(
                                top: -6,
                                right: -6,
                                child: GestureDetector(
                                  onTap: () => setState(() =>
                                      _photos.remove(p)),
                                  child: Container(
                                    padding: const EdgeInsets.all(3),
                                    decoration: const BoxDecoration(
                                      color: AppColors.danger,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.close,
                                      size: 12,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          )),
                      if (_photos.length < 5)
                        GestureDetector(
                          onTap: _pickPhotos,
                          child: Container(
                            width: 84,
                            height: 84,
                            decoration: BoxDecoration(
                              color: AppColors.primarySoft,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.add_a_photo_outlined,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(context.l10n().t('audioRecordingOptional'), style: AppTypography.label),
                  const SizedBox(height: 8),
                  AppButton(
                    title: _recording
                        ? '⏹ Stop recording'
                        : (_recordingUri != null
                            ? '🔁 Re-record'
                            : '🎙 Start recording'),
                    variant: _recording
                        ? AppButtonVariant.danger
                        : AppButtonVariant.outline,
                    onPressed: _toggleRecording,
                  ),
                  const SizedBox(height: 24),
                  AppButton(
                    title: 'Submit Follow-up',
                    loading: state.actionLoading,
                    onPressed: _submit,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;

  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: AppTypography.label.copyWith(
        fontSize: 12,
        letterSpacing: 0.5,
        color: AppColors.textMuted,
      ),
    );
  }
}