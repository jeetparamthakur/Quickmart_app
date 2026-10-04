import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  Map,
  Camera,
  UserLocation,
  type CameraRef,
  type ViewStateChangeEvent,
} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { reverseGeocode } from '@/services/geocoding';
import { satelliteMapStyle, streetMapStyle } from '@/constants/mapStyle';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui';
import type { MapLocationPickerProps } from './MapLocationPicker.types';
import { DEFAULT_MAP_CENTER } from './MapLocationPicker.types';

type MapVisualMode = 'satellite3d' | 'street';

const CAMERA = {
  satellite3d: { pitch: 58, zoom: 18 },
  street: { pitch: 0, zoom: 17 },
} as const;

export function MapLibreLocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onCurrentLocationResolved,
  mapFocus,
  fullScreen = false,
}: MapLocationPickerProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const cameraRef = useRef<CameraRef>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [visualMode, setVisualMode] = useState<MapVisualMode>(fullScreen ? 'satellite3d' : 'street');
  const hasPin = latitude !== 0 || longitude !== 0;

  const initialCenter = useMemo(
    () => ({
      latitude: latitude || DEFAULT_MAP_CENTER.latitude,
      longitude: longitude || DEFAULT_MAP_CENTER.longitude,
    }),
    [latitude, longitude]
  );

  const mapStyle = visualMode === 'satellite3d' ? satelliteMapStyle() : streetMapStyle();

  function animateTo(lat: number, lng: number, mode: MapVisualMode = visualMode) {
    const cam = CAMERA[mode];
    cameraRef.current?.easeTo({
      center: [lng, lat],
      zoom: cam.zoom,
      pitch: cam.pitch,
      duration: 400,
    });
  }

  function setVisualModeAndRecenter(mode: MapVisualMode) {
    setVisualMode(mode);
    requestAnimationFrame(() => animateTo(latitude, longitude, mode));
  }

  function handleRegionDidChange(event: NativeSyntheticEvent<ViewStateChangeEvent>) {
    const { center, userInteraction } = event.nativeEvent;
    const [lng, lat] = center;
    if (userInteraction || hasPin) {
      onLocationChange(lat, lng);
    }
  }

  useEffect(() => {
    if (!mapFocus) return;
    const cam = CAMERA[visualMode];
    cameraRef.current?.easeTo({
      center: [mapFocus.longitude, mapFocus.latitude],
      zoom: Math.max(cam.zoom - 2, 14),
      pitch: cam.pitch,
      duration: 500,
    });
  }, [mapFocus, visualMode]);

  async function useCurrentLocation() {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude: lat, longitude: lng } = pos.coords;
      onLocationChange(lat, lng);
      animateTo(lat, lng);

      if (onCurrentLocationResolved) {
        try {
          const address = await reverseGeocode(lat, lng);
          onCurrentLocationResolved(address);
        } catch {
          onCurrentLocationResolved({
            addressLine: '',
            city: '',
            area: '',
            pincode: '',
            latitude: lat,
            longitude: lng,
          });
        }
      }
    } finally {
      setLoadingGps(false);
    }
  }

  const mapHeight = fullScreen ? undefined : 280;

  return (
    <View style={[styles.container, fullScreen && styles.containerFull]}>
      <View
        style={[
          styles.mapWrap,
          fullScreen && styles.mapWrapFull,
          {
            borderRadius: fullScreen ? 0 : radius.lg,
            borderColor: colors.border,
            height: mapHeight,
            minHeight: fullScreen ? 200 : 280,
          },
        ]}
      >
        <Map
          style={styles.mapFill}
          mapStyle={mapStyle}
          logo={false}
          attribution
          compass
          compassPosition={{ top: 48, right: 8 }}
          attributionPosition={{ bottom: 4, left: 4 }}
          touchPitch={visualMode === 'satellite3d'}
          touchRotate
          onRegionDidChange={handleRegionDidChange}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [initialCenter.longitude, initialCenter.latitude],
              zoom: CAMERA[visualMode].zoom,
              pitch: CAMERA[visualMode].pitch,
            }}
          />
          <UserLocation />
        </Map>

        <View style={styles.centerPin} pointerEvents="none">
          <Ionicons name="location" size={fullScreen ? 48 : 40} color={colors.primary} />
        </View>

        <View style={[styles.modeRow, { top: spacing.sm, right: spacing.sm }]}>
          <MapModeChip
            active={visualMode === 'satellite3d'}
            label="3D Satellite"
            icon="globe-outline"
            onPress={() => setVisualModeAndRecenter('satellite3d')}
            colors={colors}
            radius={radius}
            typography={typography}
          />
          <MapModeChip
            active={visualMode === 'street'}
            label="Street"
            icon="map-outline"
            onPress={() => setVisualModeAndRecenter('street')}
            colors={colors}
            radius={radius}
            typography={typography}
          />
        </View>

        {fullScreen && (
          <PressableScale
            onPress={useCurrentLocation}
            disabled={loadingGps}
            haptic="light"
            style={[
              styles.fabGps,
              {
                bottom: spacing.md,
                right: spacing.sm,
                backgroundColor: colors.surface,
                borderRadius: radius.full,
                borderColor: colors.border,
              },
            ]}
          >
            {loadingGps ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Ionicons name="locate" size={22} color={colors.primary} />
            )}
          </PressableScale>
        )}
      </View>

      {!fullScreen && (
        <PressableScale
          onPress={useCurrentLocation}
          disabled={loadingGps}
          haptic="light"
          style={[
            styles.gpsBtn,
            {
              marginTop: spacing.md,
              backgroundColor: colors.primaryLight,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
            },
          ]}
        >
          {loadingGps ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              <Ionicons name="locate" size={18} color={colors.primary} />
              <Text style={[typography.bodySmall, { color: colors.primary, fontWeight: '600' }]}>
                Use current location
              </Text>
            </>
          )}
        </PressableScale>
      )}
    </View>
  );
}

type ChipColors = {
  surface: string;
  primary: string;
  text: string;
  border: string;
};

function MapModeChip({
  active,
  label,
  icon,
  onPress,
  colors,
  radius,
  typography,
}: {
  active: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: ChipColors;
  radius: { md: number };
  typography: { caption: object };
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      style={[
        styles.modeChip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={active ? '#FFF' : colors.text} />
      <Text
        style={[
          typography.caption,
          styles.modeChipText,
          { color: active ? '#FFF' : colors.text, fontWeight: active ? '700' : '500' },
        ]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  containerFull: { flex: 1, marginBottom: 0 },
  mapWrap: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  mapWrapFull: {
    flex: 1,
    borderWidth: 0,
  },
  mapFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeRow: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 8,
    maxWidth: '100%',
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
    }),
  },
  modeChipText: { fontSize: 11 },
  fabGps: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
