import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../theme/app_colors.dart';

typedef MapMarkerIcon = IconData Function(Map<String, dynamic> item);

class IncidentMap extends StatefulWidget {
  final List<Map<String, dynamic>> markers;
  final Color Function(Map<String, dynamic> item) markerColor;
  final void Function(Map<String, dynamic> item)? onMarkerTap;
  final String? selectedId;
  final LatLng? initialCenter;
  final double initialZoom;
  final LatLng? draggablePin;
  final void Function(LatLng position)? onMapTap;

  const IncidentMap({
    super.key,
    this.markers = const [],
    required this.markerColor,
    this.onMarkerTap,
    this.selectedId,
    this.initialCenter,
    this.initialZoom = 13,
    this.draggablePin,
    this.onMapTap,
  });

  @override
  State<IncidentMap> createState() => _IncidentMapState();
}

class _IncidentMapState extends State<IncidentMap> {
  final Completer<GoogleMapController> _controller = Completer();
  Set<Marker> _markers = {};
  LatLng? _center;
  double _zoom = 13;

  static const _centerAddis = LatLng(9.03, 38.74);

  @override
  void initState() {
    super.initState();
    _center = widget.initialCenter ?? _centerAddis;
    _zoom = widget.initialZoom;
    _syncMarkers();
  }

  @override
  void didUpdateWidget(IncidentMap oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.markers != widget.markers ||
        oldWidget.selectedId != widget.selectedId) {
      _syncMarkers();
    }
  }

  void _syncMarkers() {
    final updated = <Marker>{
      for (var i = 0; i < widget.markers.length; i++)
        Marker(
          markerId: MarkerId('m${widget.markers[i]['id'] ?? i}'),
          position: LatLng(
            (widget.markers[i]['latitude'] as num).toDouble(),
            (widget.markers[i]['longitude'] as num).toDouble(),
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            _hueFor(widget.markerColor(widget.markers[i])),
          ),
          onTap: widget.onMarkerTap == null
              ? null
              : () => widget.onMarkerTap!(widget.markers[i]),
        ),
    };
    if (widget.selectedId != null) {
      final selected = widget.markers
          .where((m) => '${m['id']}' == widget.selectedId)
          .toList();
      if (selected.isNotEmpty) {
        updated.add(
          Marker(
            markerId: const MarkerId('selected'),
            position: LatLng(
              (selected.first['latitude'] as num).toDouble(),
              (selected.first['longitude'] as num).toDouble(),
            ),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueViolet,
            ),
            zIndexInt: 10,
          ),
        );
      }
    }
    if (widget.draggablePin != null) {
      updated.add(
        Marker(
          markerId: const MarkerId('pin'),
          position: widget.draggablePin!,
          icon: BitmapDescriptor.defaultMarkerWithHue(
            BitmapDescriptor.hueAzure,
          ),
          zIndexInt: 20,
        ),
      );
    }
    setState(() => _markers = updated);
  }

  double _hueFor(Color color) {
    if (color == AppColors.danger) return BitmapDescriptor.hueRed;
    if (color == AppColors.accent) return BitmapDescriptor.hueOrange;
    if (color == AppColors.info) return BitmapDescriptor.hueBlue;
    if (color == AppColors.success) return BitmapDescriptor.hueGreen;
    return BitmapDescriptor.hueViolet;
  }

  void _onCameraMove(CameraPosition position) {
    _center = position.target;
    _zoom = position.zoom;
  }

  void moveTo(LatLng position, {double? zoom}) {
    if (!_controller.isCompleted) return;
    _controller.future.then((c) {
      c.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: position,
            zoom: zoom ?? _zoom,
          ),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return GoogleMap(
      mapType: MapType.normal,
      initialCameraPosition: CameraPosition(
        target: _center ?? _centerAddis,
        zoom: _zoom,
      ),
      markers: _markers,
      onMapCreated: (c) {
        if (!_controller.isCompleted) _controller.complete(c);
      },
      onCameraMove: _onCameraMove,
      onTap: widget.onMapTap,
      myLocationEnabled: false,
      myLocationButtonEnabled: false,
      zoomControlsEnabled: !kIsWeb,
      compassEnabled: false,
      mapToolbarEnabled: false,
      padding: const EdgeInsets.only(top: 8, bottom: 8),
    );
  }
}