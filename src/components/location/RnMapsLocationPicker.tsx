import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, UrlTile, Region, type MapType } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { reverseGeocode } from '@/services/geocoding';
import { useGoogleMapsProvider } from '@/utils/address';
import { isExpoGo, shouldUseAndroidOsmStreetTiles } from '@/utils/expoRuntime';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui';
import type { MapLocationPickerProps } from './MapLocationPicker.types';
import { DEFAULT_MAP_CENTER } from './MapLocationPicker.types';

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Satellite + tilt for spotting rooftops; street map uses OSM on Android. */
type MapVisualMode = 'satellite3d' | 'street';

const CAMERA = {
  satellite3d: { pitch: 58, zoom: 19 },
  street: { pitch: 0, zoom: 18 },
} as const;

function defaultRnMapsVisualMode(fullScreen: boolean): MapVisualMode {
  if (!fullScreen) return 'street';
  // Android Expo Go: street + Google provider is the most reliable first paint.
  if (Platform.OS === 'android' && isExpoGo()) return 'street';
  if (isExpoGo() || useGoogleMapsProvider()) return 'satellite3d';
  return 'street';
}

export function RnMapsLocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onCurrentLocationResolved,
  mapFocus,
  fullScreen = false,
  mapHeight: mapHeightProp,
}: MapLocationPickerProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const mapRef = useRef<MapView>(null);
  const didInitialCameraRef = useRef(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const googleMaps = useGoogleMapsProvider();
  const showSatelliteMode = googleMaps || isExpoGo();
  const [visualMode, setVisualMode] = useState<MapVisualMode>(() => defaultRnMapsVisualMode(fullScreen));
  const hasPin = latitude !== 0 || longitude !== 0;

  const useOsmTiles = shouldUseAndroidOsmStreetTiles() && visualMode === 'street';

  function nativeMapType(): MapType {
    if (visualMode === 'satellite3d') {
      return Platform.OS === 'ios' ? 'hybrid' : 'satellite';
    }
    if (useOsmTiles) {
      return 'none';
    }
    return 'standard';
  }

  function animateTo(lat: number, lng: number, mode: MapVisualMode = visualMode) {
    const cam = CAMERA[mode];
    mapRef.current?.animateCamera(
      {
        center: { latitude: lat, longitude: lng },
        pitch: cam.pitch,
        zoom: cam.zoom,
      },
      { duration: 400 }
    );
  }

  function setVisualModeAndRecenter(mode: MapVisualMode) {
    setVisualMode(mode);
    animateTo(latitude, longitude, mode);
  }

  function onMapReady() {
    if (didInitialCameraRef.current) return;
    didInitialCameraRef.current = true;
    if (visualMode === 'satellite3d') {
      animateTo(latitude, longitude, 'satellite3d');
    }
  }

  useEffect(() => {
    if (!mapFocus || !mapRef.current) return;
    const cam = CAMERA[visualMode];
    mapRef.current.animateCamera(
      {
        center: { latitude: mapFocus.latitude, longitude: mapFocus.longitude },
        pitch: cam.pitch,
        zoom: Math.max(cam.zoom - 2, 15),
      },
      { duration: 500 }
    );
  }, [mapFocus, visualMode]);

  async function useCurrentLocation() {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

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

  function handleRegionChangeComplete(region: Region) {
    onLocationChange(region.latitude, region.longitude);
  }

  const initialRegion: Region = {
    latitude: latitude || DEFAULT_MAP_CENTER.latitude,
    longitude: longitude || DEFAULT_MAP_CENTER.longitude,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  const mapWrapHeight = mapHeightProp ?? (fullScreen ? undefined : 280);
  const pitchEnabled = visualMode === 'satellite3d';

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.containerFull,
        mapHeightProp != null && { height: mapHeightProp, flexGrow: 0 },
      ]}
    >
      <View
        collapsable={false}
        style={[
          styles.mapWrap,
          fullScreen && !mapHeightProp && styles.mapWrapFull,
          {
            borderRadius: fullScreen ? 0 : radius.lg,
            borderColor: colors.border,
            height: mapWrapHeight,
            flex: fullScreen && mapHeightProp ? undefined : fullScreen ? 1 : undefined,
          },
        ]}
      >
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          mapType={nativeMapType()}
          initialRegion={initialRegion}
          onRegionChangeComplete={handleRegionChangeComplete}
          onMapReady={onMapReady}
          showsUserLocation
          showsMyLocationButton={false}
          pitchEnabled={pitchEnabled}
          rotateEnabled
          loadingEnabled
        >
          {useOsmTiles && (
            <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={19} flipY={false} />
          )}
        </MapView>

        <View style={styles.centerPin} pointerEvents="none">
          <Ionicons name="location" size={fullScreen ? 48 : 40} color={colors.primary} />
        </View>

        <View style={[styles.modeRow, { top: spacing.sm, right: spacing.sm }]}>
          {showSatelliteMode ? (
            <MapModeChip
              active={visualMode === 'satellite3d'}
              label="3D Satellite"
              icon="globe-outline"
              onPress={() => setVisualModeAndRecenter('satellite3d')}
              colors={colors}
              radius={radius}
              typography={typography}
            />
          ) : null}
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

        {fullScreen && visualMode === 'satellite3d' && (
          <View
            pointerEvents="none"
            style={[styles.tiltHint, { bottom: spacing.md, left: spacing.sm, right: spacing.sm + 52 }]}
          >
            <Text style={[typography.caption, { color: colors.text, textAlign: 'center' }]}>
              Pinch to zoom · Two fingers up/down to tilt · Drag map under the pin
            </Text>
          </View>
        )}
      </View>

      {!fullScreen && (
        <>
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

          {hasPin && (
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
              ]}
            >
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </Text>
          )}

          <Text
            style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' }]}
          >
            Move the map so the pin sits on your building entrance
          </Text>
          {useOsmTiles && (
            <Text
              style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' }]}
            >
              © OpenStreetMap contributors
            </Text>
          )}
        </>
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
  },
  mapWrapFull: {
    flex: 1,
    borderWidth: 0,
  },
  map: { ...StyleSheet.absoluteFillObject, flex: 1 },
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
  tiltHint: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
