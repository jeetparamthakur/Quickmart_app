import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Button, SearchBar } from '@/components/ui';
import { useLocationStore } from '@/store/locationStore';
import { locationService } from '@/services/api/location.service';
import { useTheme } from '@/context/ThemeContext';
import { Address } from '@/types/location';
import { t } from '@/i18n';

export default function LocationScreen() {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const { savedAddresses, setSelectedAddress, addAddress } = useLocationStore();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Address[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', line1: '', pincode: '' });

  const selectAddress = (address: Address) => {
    setSelectedAddress(address);
    router.replace('/(tabs)');
  };

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please enable location or search manually.');
        setDetecting(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const address = await locationService.reverseGeocode(loc.coords.latitude, loc.coords.longitude);
      selectAddress(address);
    } catch {
      Alert.alert('Error', 'Could not detect location. Please search manually.');
    } finally {
      setDetecting(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (query.length > 2) {
      const results = await locationService.searchAddresses(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddAddress = () => {
    if (!newAddr.line1 || !newAddr.pincode) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const address: Address = {
      id: 'addr-' + Date.now(),
      label: newAddr.label,
      line1: newAddr.line1,
      city: 'New Delhi',
      pincode: newAddr.pincode,
      latitude: 28.6139,
      longitude: 77.209,
    };
    addAddress(address);
    setShowAddForm(false);
    selectAddress(address);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={[typography.h2, { color: colors.text }]}>{t('selectLocation')}</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
          We need your location to show nearby stores and products
        </Text>

        <TouchableOpacity
          onPress={detectLocation}
          disabled={detecting}
          style={[
            styles.detectBtn,
            shadows.md,
            { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg },
          ]}
        >
          {detecting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={{ fontSize: 24 }}>📍</Text>
              <Text style={[typography.label, { color: '#FFF', marginLeft: spacing.md }]}>
                {t('detectLocation')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <SearchBar
          value={search}
          onChangeText={handleSearch}
          placeholder={t('searchLocation')}
        />

        {searchResults.length > 0 && (
          <View style={{ marginTop: spacing.md }}>
            {searchResults.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                onPress={() => selectAddress(addr)}
                style={[styles.addrCard, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.sm, borderColor: colors.border, borderWidth: 1 }]}
              >
                <Text style={[typography.label, { color: colors.text }]}>{addr.label}</Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{addr.line1}, {addr.city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md }]}>
          {t('savedAddresses')}
        </Text>

        {savedAddresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            onPress={() => selectAddress(addr)}
            style={[styles.addrCard, shadows.sm, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.sm, borderColor: colors.border, borderWidth: 1 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: 20 }}>{addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '🏢' : '📍'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { color: colors.text }]}>{addr.label}</Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={2}>
                  {addr.line1}, {addr.city} - {addr.pincode}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {!showAddForm ? (
          <TouchableOpacity onPress={() => setShowAddForm(true)} style={{ marginTop: spacing.md }}>
            <Text style={[typography.label, { color: colors.primary }]}>+ {t('addNewAddress')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.form, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.md, borderColor: colors.border, borderWidth: 1 }]}>
            <TextInput placeholder="Label (Home, Work...)" placeholderTextColor={colors.textMuted} value={newAddr.label} onChangeText={(v) => setNewAddr({ ...newAddr, label: v })} style={[styles.formInput, { color: colors.text, borderColor: colors.border }]} />
            <TextInput placeholder="Address line" placeholderTextColor={colors.textMuted} value={newAddr.line1} onChangeText={(v) => setNewAddr({ ...newAddr, line1: v })} style={[styles.formInput, { color: colors.text, borderColor: colors.border }]} />
            <TextInput placeholder="Pincode" placeholderTextColor={colors.textMuted} value={newAddr.pincode} onChangeText={(v) => setNewAddr({ ...newAddr, pincode: v })} keyboardType="number-pad" style={[styles.formInput, { color: colors.text, borderColor: colors.border }]} />
            <Button title="Save & Continue" onPress={handleAddAddress} fullWidth />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  detectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addrCard: {},
  form: { gap: 12 },
  formInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
});
