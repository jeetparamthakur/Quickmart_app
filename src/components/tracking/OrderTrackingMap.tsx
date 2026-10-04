import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useGoogleMapsProvider } from '@/utils/address';
import type { OrderTrackingSnapshot } from '@/types/order-tracking';

type Props = {
  snapshot: OrderTrackingSnapshot;
};

function showRiderMarker(sub: OrderTrackingSnapshot['subOrders'][0]): boolean {
  const status = sub.status.toUpperCase();
  return (
    Boolean(sub.partner) &&
    (status === 'PICKED_UP' ||
      status === 'OUT_FOR_DELIVERY' ||
      sub.assignmentStatus === 'IN_PROGRESS')
  );
}

function showStoreMarker(sub: OrderTrackingSnapshot['subOrders'][0]): boolean {
  const status = sub.status.toUpperCase();
  return status !== 'PICKED_UP' && status !== 'OUT_FOR_DELIVERY' && status !== 'DELIVERED';
}

export function OrderTrackingMap({ snapshot }: Props) {
  const mapRef = useRef<MapView>(null);
  const googleMaps = useGoogleMapsProvider();
  const { delivery, subOrders } = snapshot;

  useEffect(() => {
    const coords: { latitude: number; longitude: number }[] = [
      { latitude: delivery.lat, longitude: delivery.lng },
    ];
    for (const sub of subOrders) {
      if (showStoreMarker(sub)) {
        coords.push({ latitude: sub.pickup.lat, longitude: sub.pickup.lng });
      }
      if (showRiderMarker(sub) && sub.partner) {
        coords.push({ latitude: sub.partner.lat, longitude: sub.partner.lng });
      }
    }
    if (coords.length < 2) return;
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 48, bottom: 280, left: 48 },
      animated: true,
    });
  }, [delivery.lat, delivery.lng, subOrders]);

  const initial = {
    latitude: delivery.lat || 28.6139,
    longitude: delivery.lng || 77.209,
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
        <Marker
          coordinate={{ latitude: delivery.lat, longitude: delivery.lng }}
          title="Home"
          pinColor="#2563eb"
        />
        {subOrders
          .filter(showStoreMarker)
          .map((sub) => (
            <Marker
              key={`store-${sub.id}`}
              coordinate={{ latitude: sub.pickup.lat, longitude: sub.pickup.lng }}
              title={sub.storeName}
              pinColor="#16a34a"
            />
          ))}
        {subOrders
          .filter(showRiderMarker)
          .filter((sub) => sub.partner)
          .map((sub) => (
            <Marker
              key={`rider-${sub.id}`}
              coordinate={{ latitude: sub.partner!.lat, longitude: sub.partner!.lng }}
              title={sub.partner!.displayName}
              pinColor="#ea580c"
            />
          ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
});
