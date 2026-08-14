import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_typography.dart';

class AppInput extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? error;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final bool secure;
  final bool multiline;
  final TextInputType? keyboardType;
  final int? maxLength;
  final bool autoFocus;
  final TextCapitalization capitalization;

  const AppInput({
    super.key,
    this.label,
    this.hint,
    this.error,
    this.controller,
    this.onChanged,
    this.secure = false,
    this.multiline = false,
    this.keyboardType,
    this.maxLength,
    this.autoFocus = false,
    this.capitalization = TextCapitalization.none,
  });

  @override
  State<AppInput> createState() => _AppInputState();
}

class _AppInputState extends State<AppInput> {
  late final TextEditingController _controller;
  bool _obscured = true;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.error != null && widget.error!.isNotEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(widget.label!, style: AppTypography.label),
          const SizedBox(height: 6),
        ],
        TextField(
          controller: _controller,
          onChanged: widget.onChanged,
          obscureText: widget.secure && _obscured,
          keyboardType: widget.keyboardType,
          maxLength: widget.maxLength,
          maxLines: widget.multiline ? null : 1,
          minLines: widget.multiline ? 4 : 1,
          autofocus: widget.autoFocus,
          textCapitalization: widget.capitalization,
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: AppTypography.small.copyWith(color: AppColors.textMuted),
            errorText: hasError ? widget.error : null,
            counterText: '',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.input),
              borderSide: BorderSide(
                color: hasError ? AppColors.danger : AppColors.border,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.input),
              borderSide: BorderSide(
                color: hasError ? AppColors.danger : AppColors.border,
                width: 1.5,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.input),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
            ),
            suffixIcon: widget.secure
                ? TextButton(
                    onPressed: () => setState(() => _obscured = !_obscured),
                    child: Text(
                      _obscured ? 'Show' : 'Hide',
                      style: AppTypography.smallMedium.copyWith(color: AppColors.primary),
                    ),
                  )
                : null,
          ),
        ),
      ],
    );
  }
}