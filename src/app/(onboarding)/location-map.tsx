import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { ScreenHeader, Button } from '@/components/ui';
import { MapLocationPicker, AddressSearchInput } from '@/components/location';
import { AddressTypeChips, DeliveryContactFields, type AddressType } from '@/components/address';
import { useLocationStore } from '@/store/locationStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import { useDebouncedReverseGeocode } from '@/hooks/useDebouncedReverseGeocode';
import { DEFAULT_MAP_CENTER, addressResultToLine1, type AddressResult, type MapFocus } from '@/utils/address';
import { Address, isValidIndianMobile, normalizePhoneDigits } from '@/types/location';
import { addressService } from '@/services/api/address.service';
import { getErrorMessage } from '@/services/api/errors';
import { t } from '@/i18n';
import { layout } from '@/constants/theme';

function parseCoord(value: string | undefined, fallback: number): number {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function defaultPhoneFromUser(userPhone?: string, authPhone?: string): string {
  const raw = userPhone ?? authPhone ?? '';
  return normalizePhoneDigits(raw);
}

const SHEET_MAX_HEIGHT_RATIO = 0.62;
const KEYBOARD_SCROLL_EXTRA = 24;
const GPS_BOOTSTRAP_TIMEOUT_MS = 12_000;

async function getCurrentPositionWithTimeout() {
  return Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    new Promise<Location.LocationObject>((_, reject) => {
      setTimeout(() => reject(new Error('GPS_TIMEOUT')), GPS_BOOTSTRAP_TIMEOUT_MS);
    }),
  ]);
}

export default function LocationMapScreen() {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * SHEET_MAX_HEIGHT_RATIO);
  const mapHeight = Math.max(
    220,
    windowHeight - sheetHeight - layout.screenHeaderHeight - insets.top - 8,
  );
  const params = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    label?: string;
    autoGps?: string;
    saveOnly?: string;
    addressId?: string;
  }>();

  const user = useAuthStore((s) => s.user);
  const authPhone = useAuthStore((s) => s.phone);
  const { addAddress, setSelectedAddress, updateAddress, savedAddresses } = useLocationStore();
  const editing = savedAddresses.find((a) => a.id === params.addressId);

  const initialLat = parseCoord(params.lat, editing?.latitude ?? 0);
  const initialLng = parseCoord(params.lng, editing?.longitude ?? 0);
  const saveOnly = params.saveOnly === '1' || Boolean(params.addressId);

  const [latitude, setLatitude] = useState(initialLat || DEFAULT_MAP_CENTER.latitude);
  const [longitude, setLongitude] = useState(initialLng || DEFAULT_MAP_CENTER.longitude);
  const [mapFocus, setMapFocus] = useState<MapFocus | undefined>(
    initialLat && initialLng ? { latitude: initialLat, longitude: initialLng } : undefined,
  );
  const [label, setLabel] = useState(editing?.label ?? params.label?.trim() ?? 'Home');
  const [line1, setLine1] = useState(editing?.line1 ?? '');
  const [city, setCity] = useState(editing?.city ?? '');
  const [pincode, setPincode] = useState(editing?.pincode ?? '');
  const [receiverName, setReceiverName] = useState(editing?.receiverName ?? user?.name ?? '');
  const [receiverPhone, setReceiverPhone] = useState(
    editing?.receiverPhone ? normalizePhoneDigits(editing.receiverPhone) : defaultPhoneFromUser(user?.phone, authPhone),
  );
  const [addressFieldsTouched, setAddressFieldsTouched] = useState(Boolean(editing));
  const [bootstrappingGps, setBootstrappingGps] = useState(params.autoGps === '1');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { result, loading: geocoding } = useDebouncedReverseGeocode(latitude, longitude);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!result || addressFieldsTouched) return;
    setLine1(addressResultToLine1(result));
    setCity(result.city);
    setPincode(result.pincode);
  }, [result, addressFieldsTouched]);

  useEffect(() => {
    if (params.autoGps !== '1') return;

    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Please enable location or search and pin on the map.');
          return;
        }
        const pos = await getCurrentPositionWithTimeout();
        if (cancelled) return;
        const { latitude: lat, longitude: lng } = pos.coords;
        setLatitude(lat);
        setLongitude(lng);
        setMapFocus({ latitude: lat, longitude: lng });
      } catch {
        Alert.alert('Error', 'Could not detect location. Search or move the map manually.');
      } finally {
        if (!cancelled) setBootstrappingGps(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.autoGps]);

  function applySearchResult(selected: AddressResult) {
    setAddressFieldsTouched(false);
    setLatitude(selected.latitude);
    setLongitude(selected.longitude);
    setMapFocus({ latitude: selected.latitude, longitude: selected.longitude });
    setLine1(addressResultToLine1(selected));
    setCity(selected.city);
    setPincode(selected.pincode);
  }

  function applyGpsResolved(selected: AddressResult) {
    setAddressFieldsTouched(false);
    setLine1(addressResultToLine1(selected));
    setCity(selected.city);
    setPincode(selected.pincode);
  }

  function handleMapLocationChange(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
    if (editing) return;
    setAddressFieldsTouched(false);
    setLine1('');
    setCity('');
    setPincode('');
  }

  const canSubmit = useMemo(() => {
    const trimmedLine = line1.trim();
    const trimmedPin = pincode.replace(/\D/g, '').slice(0, 6);
    return (
      Boolean(trimmedLine) &&
      trimmedPin.length === 6 &&
      Boolean(receiverName.trim()) &&
      isValidIndianMobile(receiverPhone)
    );
  }, [line1, pincode, receiverName, receiverPhone]);

  async function handleConfirm() {
    const trimmedLine = line1.trim();
    const trimmedPin = pincode.replace(/\D/g, '').slice(0, 6);
    let valid = true;
    if (!trimmedLine) {
      Alert.alert('Required', 'Please enter your house / flat details or wait for address to load.');
      return;
    }
    if (trimmedPin.length !== 6) {
      Alert.alert('Required', 'Please enter a valid 6-digit pincode.');
      return;
    }
    if (!receiverName.trim()) {
      setNameError(t('invalidReceiverName'));
      valid = false;
    } else {
      setNameError('');
    }
    if (!isValidIndianMobile(receiverPhone)) {
      setPhoneError(t('invalidReceiverPhone'));
      valid = false;
    } else {
      setPhoneError('');
    }
    if (!valid) return;

    const payload: Omit<Address, 'id'> = {
      label: label.trim() || 'Home',
      line1: trimmedLine,
      city: city.trim() || result?.city || 'India',
      pincode: trimmedPin,
      latitude,
      longitude,
      receiverName: receiverName.trim(),
      receiverPhone,
      isDefault: editing?.isDefault ?? savedAddresses.length === 0,
    };

    setSaving(true);
    try {
      if (editing) {
        const saved = await addressService.update(editing.id, payload);
        updateAddress(editing.id, saved);
        if (useLocationStore.getState().selectedAddress?.id === editing.id) {
          setSelectedAddress(saved);
        }
        router.back();
        return;
      }

      const saved = await addressService.create(payload);
      if (saveOnly) {
        addAddress(saved);
        router.back();
      } else {
        setSelectedAddress(saved);
        addAddress(saved);
        router.replace('/(tabs)');
      }
    } catch (err) {
      Alert.alert(t('addNewAddress'), getErrorMessage(err, t('placeOrderFailed')));
    } finally {
      setSaving(false);
    }
  }

  const previewLine =
    line1.trim() ||
    (result ? addressResultToLine1(result) : '') ||
    'Move the map to load address…';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader
        title={editing ? t('edit') : 'Confirm location'}
        gradient
        showBack
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={[styles.mapSection, { height: mapHeight }]}>
          <MapLocationPicker
            fullScreen
            mapHeight={mapHeight}
            latitude={latitude}
            longitude={longitude}
            mapFocus={mapFocus}
            onLocationChange={handleMapLocationChange}
            onCurrentLocationResolved={applyGpsResolved}
          />
          {bootstrappingGps ? (
            <View style={[styles.gpsOverlay, { backgroundColor: 'rgba(0,0,0,0.35)' }]} pointerEvents="none">
              <View style={[styles.gpsCard, { backgroundColor: colors.surface, borderRadius: radius.md }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.md }]}>
                  Finding your location…
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.sheet,
            shadows.lg,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              height: sheetHeight,
            },
          ]}
        >
          <ScrollView
            style={styles.sheetScroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            nestedScrollEnabled
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={{
              padding: spacing.lg,
              gap: spacing.md,
              paddingBottom:
                spacing.xl +
                insets.bottom +
                (keyboardHeight > 0 ? keyboardHeight + KEYBOARD_SCROLL_EXTRA : 0),
            }}
            showsVerticalScrollIndicator
          >
            <AddressSearchInput label="" placeholder={t('searchLocation')} onSelect={applySearchResult} />

            <View style={[styles.preview, { backgroundColor: colors.background, borderRadius: radius.md }]}>
              {geocoding ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[typography.bodySmall, { color: colors.text }]} numberOfLines={3}>
                  {previewLine}
                </Text>
              )}
              {(city || pincode) && (
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                  {[city, pincode].filter(Boolean).join(' · ')}
                </Text>
              )}
            </View>

            <DeliveryContactFields
              receiverName={receiverName}
              receiverPhone={receiverPhone}
              onNameChange={setReceiverName}
              onPhoneChange={setReceiverPhone}
              nameError={nameError}
              phoneError={phoneError}
            />

            <AddressTypeChips
              value={label}
              onChange={(type: AddressType) => setLabel(type)}
            />

            <TextInput
              placeholder="House / flat / building (required)"
              placeholderTextColor={colors.textMuted}
              value={line1}
              onChangeText={(v) => {
                setAddressFieldsTouched(true);
                setLine1(v);
              }}
              style={[styles.input, { color: colors.text, borderColor: colors.border, borderRadius: radius.sm }]}
            />
            <View style={styles.row}>
              <TextInput
                placeholder="City"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={(v) => {
                  setAddressFieldsTouched(true);
                  setCity(v);
                }}
                style={[
                  styles.input,
                  styles.flexGrow,
                  { color: colors.text, borderColor: colors.border, borderRadius: radius.sm },
                ]}
              />
              <TextInput
                placeholder="Pincode"
                placeholderTextColor={colors.textMuted}
                value={pincode}
                onChangeText={(v) => {
                  setAddressFieldsTouched(true);
                  setPincode(v.replace(/\D/g, '').slice(0, 6));
                }}
                keyboardType="number-pad"
                maxLength={6}
                style={[
                  styles.input,
                  styles.pinInput,
                  { color: colors.text, borderColor: colors.border, borderRadius: radius.sm },
                ]}
              />
            </View>

            <Button
              title={editing ? 'Save address' : 'Confirm location'}
              onPress={handleConfirm}
              fullWidth
              loading={saving}
              disabled={!canSubmit || saving}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  mapSection: { position: 'relative', width: '100%' },
  gpsOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsCard: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  sheetScroll: { flex: 1 },
  preview: { padding: 12 },
  input: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  row: { flexDirection: 'row', gap: 10 },
  pinInput: { width: 110 },
  flexGrow: { flex: 1 },
});
