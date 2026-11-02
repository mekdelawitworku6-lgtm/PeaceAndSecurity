import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/media_helpers.dart';

class MediaThumb extends StatelessWidget {
  final String? uri;
  final String kind;
  final double size;
  final VoidCallback? onTap;

  const MediaThumb({
    super.key,
    this.uri,
    this.kind = 'image',
    this.size = 88,
    this.onTap,
  });

  bool _isLocalFile(String path) {
    if (kIsWeb) return false;
    if (path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('blob:')) {
      return false;
    }
    return path.startsWith('/') || path.startsWith('file://');
  }

  @override
  Widget build(BuildContext context) {
    Widget inner;
    final cleanUri = uri?.trim() ?? '';

    if (cleanUri.isEmpty) {
      inner = _buildPlaceholder();
    } else if (kind == 'image') {
      if (_isLocalFile(cleanUri)) {
        final filePath = cleanUri.startsWith('file://')
            ? cleanUri.substring(7)
            : cleanUri;
        final file = File(filePath);
        inner = Image.file(
          file,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _buildPlaceholder(),
        );
      } else {
        final url = assetUrl(cleanUri);
        inner = Image.network(
          url,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _buildPlaceholder(),
        );
      }
    } else if (kind == 'video') {
      inner = Container(
        color: AppColors.primaryDark,
        child: const Center(
          child: Icon(Icons.play_circle_fill, color: Colors.white, size: 28),
        ),
      );
    } else {
      inner = Container(
        color: AppColors.primarySoft,
        child: const Center(
          child: Icon(Icons.mic, color: AppColors.primary, size: 28),
        ),
      );
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: AppColors.primarySoft,
          borderRadius: BorderRadius.circular(12),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            inner,
            if (kind != 'image')
              Positioned(
                bottom: 4,
                left: 0,
                right: 0,
                child: Text(
                  kind.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(
                    color: kind == 'video' ? Colors.white : AppColors.primary,
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: AppColors.primarySoft,
      child: Center(
        child: Icon(
          kind == 'video'
              ? Icons.videocam_outlined
              : kind == 'audio'
                  ? Icons.mic
                  : Icons.image_outlined,
          color: AppColors.textMuted,
          size: 24,
        ),
      ),
    );
  }
}