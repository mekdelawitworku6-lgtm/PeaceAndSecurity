import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class Screen extends StatelessWidget {
  final Widget child;
  final bool scroll;
  final bool keyboard;
  final EdgeInsetsGeometry padding;
  final Color backgroundColor;
  final Future<void> Function()? onRefresh;

  const Screen({
    super.key,
    required this.child,
    this.scroll = false,
    this.keyboard = true,
    this.padding = const EdgeInsets.all(16),
    this.backgroundColor = AppColors.background,
    this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = child;
    if (onRefresh != null) {
      content = RefreshIndicator(
        onRefresh: onRefresh!,
        color: AppColors.primary,
        child: content,
      );
    }
    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        bottom: false,
        child: AnimatedPadding(
          duration: const Duration(milliseconds: 150),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom * (keyboard ? 0.5 : 0),
          ),
          child: scroll
              ? SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: padding,
                  keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                  child: content,
                )
              : Padding(padding: padding, child: content),
        ),
      ),
    );
  }
}