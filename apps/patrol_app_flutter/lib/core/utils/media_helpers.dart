import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

import '../config/app_config.dart';

class PickedMedia {
  final String uri;
  final String? name;
  final String? mimeType;
  final File? file;
  final XFile? xfile;

  const PickedMedia({
    required this.uri,
    this.name,
    this.mimeType,
    this.file,
    this.xfile,
  });

  String get fileName => name ?? path.basename(uri);
}

class LocationResult {
  final double latitude;
  final double longitude;
  final String address;

  const LocationResult({
    required this.latitude,
    required this.longitude,
    required this.address,
  });
}

class MediaHelpers {
  static const defaultLatitude = 9.0107;
  static const defaultLongitude = 38.7612;
  static const defaultAddress = 'Meskel Square, Addis Ababa';

  static Future<List<PickedMedia>> pickImages(int limit) async {
    final picker = ImagePicker();
    final result = await picker.pickMultiImage(limit: limit, imageQuality: 80);
    return result.map((x) => _fromXFile(x, 'image/jpeg')).toList();
  }

  static Future<PickedMedia?> pickVideo() async {
    final picker = ImagePicker();
    final result = await picker.pickVideo(source: ImageSource.gallery);
    if (result == null) return null;
    return _fromXFile(result, 'video/mp4');
  }

  static PickedMedia _fromXFile(XFile x, String fallbackMime) {
    final realName = kIsWeb && x.name.isNotEmpty ? x.name : x.path;
    final ext = path.extension(realName).toLowerCase();
    final mime = switch (ext) {
      '.png' => 'image/png',
      '.jpg' || '.jpeg' => 'image/jpeg',
      '.mp4' => 'video/mp4',
      '.m4a' => 'audio/m4a',
      '.mp3' => 'audio/mpeg',
      _ => fallbackMime,
    };
    return PickedMedia(
      uri: x.path,
      name: path.basename(realName),
      mimeType: mime,
      file: File(x.path),
      xfile: x,
    );
  }

  static Future<LocationResult?> pickLocation() async {
    try {
      final hasPermission = await Geolocator.checkPermission();
      if (hasPermission == LocationPermission.denied) {
        final requested = await Geolocator.requestPermission();
        if (requested == LocationPermission.denied ||
            requested == LocationPermission.deniedForever) {
          throw Exception('Location permission is required.');
        }
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      String address = '';
      try {
        final places = await placemarkFromCoordinates(
          pos.latitude,
          pos.longitude,
        );
        if (places.isNotEmpty) {
          final p = places.first;
          final parts = [
            p.name, p.street, p.subLocality, p.subAdministrativeArea,
            p.locality, p.administrativeArea,
          ].whereType<String>().where((s) => s.trim().isNotEmpty).toList();
          address = parts.join(', ');
        }
      } catch (_) {}
      return LocationResult(
        latitude: pos.latitude,
        longitude: pos.longitude,
        address: address.isEmpty ? address : address,
      );
    } on Exception catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  static Future<LocationResult?> pickLocationOrFallback() async {
    try {
      return await pickLocation();
    } catch (_) {
      return const LocationResult(
        latitude: defaultLatitude,
        longitude: defaultLongitude,
        address: defaultAddress,
      );
    }
  }
}

class AudioRecorderController {
  final AudioRecorder _recorder = AudioRecorder();
  bool _recording = false;
  Duration _elapsed = Duration.zero;

  bool get isRecording => _recording;
  Duration get elapsed => _elapsed;

  Future<String?> start() async {
    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) {
      throw Exception('Microphone permission is required to record audio.');
    }
    final dir = await _tempDir();
    final filePath = '$dir/recording-${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _recorder.start(
      const RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
      ),
      path: filePath,
    );
    _recording = true;
    _elapsed = Duration.zero;
    _startTimer();
    return filePath;
  }

  Future<PickedMedia?> stop() async {
    if (!_recording) return null;
    _recording = false;
    _timer?.cancel();
    final filePath = await _recorder.stop();
    if (filePath == null) return null;
    return PickedMedia(
      uri: filePath,
      name: 'recording-${DateTime.now().millisecondsSinceEpoch}.m4a',
      mimeType: 'audio/m4a',
      file: File(filePath),
    );
  }

  Timer? _timer;

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      _elapsed += const Duration(seconds: 1);
    });
  }

  Future<String> _tempDir() async {
    final dir = await getTemporaryDirectory();
    return dir.path;
  }

  void dispose() {
    _timer?.cancel();
    _recorder.dispose();
  }
}

String assetUrl(String? url) {
  if (url == null || url.isEmpty) return '';
  if (url.startsWith('http') ||
      url.startsWith('blob:') ||
      url.startsWith('data:')) {
    return url;
  }
  return '${AppConfig.socketUrl}$url';
}

class DeviceInfo {
  static String deviceId = 'cit-${DateTime.now().millisecondsSinceEpoch}';
}