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

  @override
  Widget build(BuildContext context) {
    final url = assetUrl(uri);
    Widget inner;
    if (url.isEmpty) {
      inner = Container(
        color: AppColors.primarySoft,
        child: kind == 'video'
            ? const Center(child: Icon(Icons.play_circle_fill, color: AppColors.primary, size: 28))
            : kind == 'audio'
                ? const Center(child: Icon(Icons.mic, color: AppColors.primary, size: 28))
                : const SizedBox.shrink(),
      );
    } else if (kind == 'image') {
      inner = Image.network(
        url,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => Container(
          color: AppColors.primarySoft,
          child: const Center(child: Icon(Icons.broken_image, color: AppColors.textMuted)),
        ),
      );
    } else {
      inner = Container(
        color: AppColors.primarySoft,
        child: kind == 'video'
            ? const Center(child: Icon(Icons.play_circle_fill, color: AppColors.primary, size: 28))
            : const Center(child: Icon(Icons.mic, color: AppColors.primary, size: 28)),
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
                  kind == 'video' ? 'Video' : 'Audio',
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(color: AppColors.white),
                ),
              ),
          ],
        ),
      ),
    );
  }
}