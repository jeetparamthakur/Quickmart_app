import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useGoogleMapsProvider } from '@/utils/address';
import type { OrderTrackingSnapshot } from '@/types/order-tracking';
import {
  getMapFocusCoordinates,
  getMapRouteSegments,
  getTrackingMapPhase,
  shouldShowCustomerMarker,
  shouldShowRiderMarker,
  shouldShowStoreMarker,
} from '@/utils/trackingMapPhase';

export type DeliveryOverride = {
  lat: number;
  lng: number;
  addressLine?: string;
};

type Props = {
  snapshot: OrderTrackingSnapshot;
  deliveryOverride?: DeliveryOverride;
  bottomPadding?: number;
};

function MarkerBubble({
  icon,
  color,
  backgroundColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}) {
  return (
    <View style={[styles.markerBubble, { backgroundColor }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
  );
}

export function OrderTrackingMap({ snapshot, deliveryOverride, bottomPadding = 280 }: Props) {
  const mapRef = useRef<MapView>(null);
  const googleMaps = useGoogleMapsProvider();

  const mergedSnapshot = useMemo((): OrderTrackingSnapshot => {
    if (!deliveryOverride?.lat || !deliveryOverride?.lng) return snapshot;
    const useOverride =
      !snapshot.delivery.lat ||
      !snapshot.delivery.lng ||
      (Math.abs(snapshot.delivery.lat - 28.6139) < 0.0001 &&
        Math.abs(snapshot.delivery.lng - 77.209) < 0.0001);
    if (!useOverride) return snapshot;
    return {
      ...snapshot,
      delivery: {
        ...snapshot.delivery,
        lat: deliveryOverride.lat,
        lng: deliveryOverride.lng,
        addressLine: deliveryOverride.addressLine ?? snapshot.delivery.addressLine,
      },
    };
  }, [snapshot, deliveryOverride]);

  const phase = getTrackingMapPhase(mergedSnapshot);
  const routeSegments = getMapRouteSegments(mergedSnapshot, phase);
  const { delivery, subOrders } = mergedSnapshot;

  useEffect(() => {
    const coords = getMapFocusCoordinates(mergedSnapshot, phase);
    if (coords.length === 0) return;
    if (coords.length === 1) {
      mapRef.current?.animateToRegion(
        {
          latitude: coords[0].latitude,
          longitude: coords[0].longitude,
          latitudeDelta: phase === 'awaiting_partner' ? 0.018 : 0.012,
          longitudeDelta: phase === 'awaiting_partner' ? 0.018 : 0.012,
        },
        400,
      );
      return;
    }
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 48, bottom: bottomPadding, left: 48 },
      animated: true,
    });
  }, [mergedSnapshot, phase, bottomPadding]);

  const initial = {
    latitude: delivery.lat || deliveryOverride?.lat || 28.6139,
    longitude: delivery.lng || deliveryOverride?.lng || 77.209,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={googleMaps ? PROVIDER_GOOGLE : undefined}
        initialRegion={initial}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {shouldShowCustomerMarker(phase) ? (
          <Marker coordinate={{ latitude: delivery.lat, longitude: delivery.lng }} title="Home">
            <MarkerBubble icon="home" color="#2563eb" backgroundColor="#dbeafe" />
          </Marker>
        ) : null}

        {subOrders
          .filter((sub) => shouldShowStoreMarker(sub, phase))
          .map((sub) => (
            <Marker
              key={`store-${sub.id}`}
              coordinate={{ latitude: sub.pickup.lat, longitude: sub.pickup.lng }}
              title={sub.storeName}
            >
              <MarkerBubble icon="storefront" color="#16a34a" backgroundColor="#dcfce7" />
            </Marker>
          ))}

        {subOrders
          .filter((sub) => shouldShowRiderMarker(sub, phase))
          .filter((sub) => sub.partner)
          .map((sub) => (
            <Marker
              key={`rider-${sub.id}`}
              coordinate={{ latitude: sub.partner!.lat, longitude: sub.partner!.lng }}
              title={sub.partner!.displayName}
            >
              <MarkerBubble icon="bicycle" color="#ea580c" backgroundColor="#ffedd5" />
            </Marker>
          ))}

        {routeSegments.map((seg, i) => (
          <Polyline
            key={`route-${i}`}
            coordinates={[seg.from, seg.to]}
            strokeColor="#2563eb"
            strokeWidth={4}
            lineDashPattern={[1, 0]}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  markerBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
