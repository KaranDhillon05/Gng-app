import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../app/navigationTypes';
import { AppButton } from '../../shared/components/AppButton';
import { BottomNavBar } from '../../shared/components/BottomNavBar';
import { useCartStore } from '../cart/useCartStore';
import { useStoreStore } from '../selectstore/useStoreStore';
import { bottomNavClearance, colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';

type VisionCameraModule = typeof import('react-native-vision-camera');

let visionCameraModule: VisionCameraModule | null = null;
try {
  visionCameraModule = require('react-native-vision-camera');
} catch {
  visionCameraModule = null;
}

const Camera = visionCameraModule?.Camera;
const useCameraDevice = visionCameraModule?.useCameraDevice;
const useCameraPermission = visionCameraModule?.useCameraPermission;
const useCodeScanner = visionCameraModule?.useCodeScanner;

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export function ScanScreen({ navigation }: Props) {
  const cameraPermission = useCameraPermission
    ? useCameraPermission()
    : { hasPermission: false, requestPermission: async () => false };
  const hasPermission = cameraPermission.hasPermission;
  const requestPermission = cameraPermission.requestPermission;
  const device = useCameraDevice ? useCameraDevice('back') : undefined;
  const supportsNativeScanner = Boolean(Camera && useCameraPermission && useCameraDevice && useCodeScanner);
  const [locked, setLocked] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [showTypeCodeModal, setShowTypeCodeModal] = useState(false);
  const [typedBarcode, setTypedBarcode] = useState('');

  const selectedStoreId = useStoreStore((s) => s.selectedStoreId);
  const selectedStoreName = useStoreStore((s) => s.selectedStoreName);
  const addProductByBarcode = useCartStore((s) => s.addProductByBarcode);
  const lastScanned = useCartStore((s) => s.lastScannedProduct);
  const isAdding = useCartStore((s) => s.isAddingProduct);
  const scanError = useCartStore((s) => s.error);
  const clearError = useCartStore((s) => s.clearError);

  const canScan = supportsNativeScanner && hasPermission && Boolean(device);
  const hasScanned = Boolean(lastScanned);
  const productPrice = useMemo(
    () => (lastScanned ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(lastScanned.price) : '—'),
    [lastScanned]
  );

  const codeScanner = useCodeScanner
    ? useCodeScanner({
        codeTypes: ['ean-13', 'ean-8', 'upc-a', 'upc-e', 'qr'],
        onCodeScanned: (codes) => {
          if (locked || isAdding) return;
          const code = codes[0]?.value;
          if (!code) return;
          void handleBarcode(code);
        },
      })
    : undefined;

  useEffect(() => {
    if (!selectedStoreId) {
      navigation.replace('SelectStore');
    }
  }, [navigation, selectedStoreId]);

  useEffect(() => {
    if (!scanError) {
      return;
    }
    const timeout = setTimeout(() => clearError(), 3000);
    return () => clearTimeout(timeout);
  }, [clearError, scanError]);

  const handleBarcode = async (data: string) => {
    if (locked) return;
    setLocked(true);
    try {
      await addProductByBarcode(data);
    } finally {
      // Keep scan lock briefly to avoid duplicate reads from same frame.
      setTimeout(() => setLocked(false), 1200);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.camera}>
        {canScan && Camera && codeScanner ? (
          <Camera
            codeScanner={codeScanner}
            device={device!}
            isActive
            style={StyleSheet.absoluteFill}
            torch={torchOn ? 'on' : 'off'}
          />
        ) : null}

        {canScan ? (
          <View style={styles.frame} pointerEvents="none">
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.scanLine} />
            <View style={styles.barcodeHint}>
              <MaterialCommunityIcons name="barcode" size={36} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        ) : (
          <View style={styles.frameDisabled}>
            <MaterialCommunityIcons color="rgba(194,101,42,0.6)" name="barcode-scan" size={78} />
          </View>
        )}

        <View style={styles.scanLabel}>
          <Text style={styles.scanHeading}>
            {canScan ? 'Scan item barcode' : (supportsNativeScanner ? 'Camera access required' : 'Scanner needs dev build')}
          </Text>
          <Text style={styles.scanSub}>
            {canScan
              ? `Store: ${selectedStoreName || '—'}. Point at barcode and hold steady.`
              : (supportsNativeScanner
                ? 'Allow camera access to start scanning products instantly.'
                : 'This ML Kit scanner is not supported in Expo Go. Open the app in a development build.')}
          </Text>
        </View>
        {scanError ? <Text style={styles.errorBanner}>{scanError}</Text> : null}

        {!canScan && (
          <View style={styles.permissionCard}>
            <MaterialCommunityIcons color={colors.primary} name="camera-outline" size={28} />
            <Text style={styles.permissionTitle}>{supportsNativeScanner ? 'Enable camera to scan' : 'Open in development build'}</Text>
            <Text style={styles.permissionBody}>
              {supportsNativeScanner
                ? 'This helps Grab N Go identify products quickly and build your cart automatically.'
                : 'Install and launch the dev build (`expo run:android`), then use `expo start --dev-client`.'}
            </Text>
            <View style={styles.permissionBtnWrap}>
              <AppButton
                label={supportsNativeScanner ? 'Allow Camera Access' : 'How to Run'}
                onPress={async () => {
                  if (!supportsNativeScanner) {
                    Alert.alert(
                      'Development build required',
                      'react-native-vision-camera (ML Kit scanning) does not run in Expo Go. Use: 1) npx expo run:android 2) npx expo start --dev-client'
                    );
                    return;
                  }
                  await requestPermission();
                }}
                leadingIcon="📷"
              />
            </View>
          </View>
        )}

        {canScan && (
          <View style={styles.tools}>
            {([
              { icon: 'image-outline', label: 'GALLERY' },
              { icon: 'keyboard-outline', label: 'TYPE CODE' },
              { icon: 'history', label: 'HISTORY' },
            ] as const).map((tool) => (
              <View key={tool.label} style={styles.toolBtn}>
                <Pressable
                  style={styles.toolBtnCircle}
                  onPress={() => {
                    if (tool.label === 'TYPE CODE') {
                      setShowTypeCodeModal(true);
                      return;
                    }
                    Alert.alert('Coming soon');
                  }}
                >
                  <MaterialCommunityIcons name={tool.icon} size={20} color={colors.white} />
                </Pressable>
                <Text style={styles.toolBtnLabel}>{tool.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {canScan && (
        <View style={styles.previewCard}>
          <View style={[styles.productImageBg, hasScanned && styles.productImageBgScanned]}>
            <View style={styles.productImageOverlay}>
              {hasScanned ? (
                <MaterialCommunityIcons color={colors.white} name="check-decagram" size={22} />
              ) : (
                <MaterialCommunityIcons name="barcode-scan" size={22} color={colors.white} />
              )}
            </View>
          </View>
          <View style={styles.previewInfo}>
            <View style={styles.previewRow}>
              <View>
                <Text style={styles.lastScannedLabel}>LAST SCANNED</Text>
                <Text style={styles.productName}>
                  {isAdding ? 'Looking up product...' : (lastScanned?.name ?? 'Awaiting scan')}
                </Text>
                {!hasScanned && !isAdding ? (
                  <Text style={styles.productHint}>Scan a barcode above to populate product details.</Text>
                ) : null}
              </View>
              <Text style={styles.productPrice}>{hasScanned ? productPrice : '—'}</Text>
            </View>
            <View style={styles.previewActions}>
              <View style={styles.halfBtn}>
                <AppButton
                  disabled={!hasScanned}
                  label="View Details"
                  onPress={() => {
                    if (!lastScanned) return;
                    navigation.navigate('ProductDetail', { product: lastScanned });
                  }}
                  size="sm"
                  variant="outline"
                />
            </View>
              <View style={styles.halfBtn}>
                <AppButton
                  disabled={!hasScanned}
                  label="Add to Cart"
                  onPress={() => navigation.navigate('Cart')}
                  size="sm"
                />
              </View>
            </View>
          </View>
        </View>
      )}

      <SafeAreaView style={styles.topNav} pointerEvents="box-none">
        <View style={styles.topNavRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.glassBtn}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={colors.white} />
          </Pressable>
          <View style={styles.glassTitle}>
            <Text style={styles.glassTitleText}>Grab N Go</Text>
          </View>
          <Pressable style={styles.glassBtn} onPress={() => setTorchOn((current) => !current)}>
            <MaterialCommunityIcons name={torchOn ? 'flash' : 'flash-outline'} size={20} color={colors.white} />
          </Pressable>
        </View>
      </SafeAreaView>

      <BottomNavBar navigation={navigation} />

      <Modal
        transparent
        visible={showTypeCodeModal}
        animationType="fade"
        onRequestClose={() => setShowTypeCodeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Type Barcode</Text>
            <TextInput
              value={typedBarcode}
              onChangeText={setTypedBarcode}
              placeholder="Enter barcode"
              keyboardType="numeric"
              style={styles.modalInput}
              placeholderTextColor={colors.placeholder}
            />
            {scanError ? <Text style={styles.modalError}>{scanError}</Text> : null}
            <View style={styles.modalActions}>
              <View style={styles.modalBtnHalf}>
                <AppButton
                  variant="outline"
                  size="sm"
                  label="Cancel"
                  onPress={() => {
                    setShowTypeCodeModal(false);
                    setTypedBarcode('');
                    clearError();
                  }}
                />
              </View>
              <View style={styles.modalBtnHalf}>
                <AppButton
                  size="sm"
                  label="Look Up"
                  onPress={async () => {
                    try {
                      await addProductByBarcode(typedBarcode.trim());
                      setShowTypeCodeModal(false);
                      setTypedBarcode('');
                    } catch {
                      // Store error is shown inline.
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  camera: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    paddingTop: 108,
  },
  frame: {
    alignItems: 'center',
    height: 248,
    justifyContent: 'center',
    width: 248,
  },
  frameDisabled: {
    alignItems: 'center',
    borderColor: 'rgba(194,101,42,0.45)',
    borderRadius: radius.xl,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 176,
    justifyContent: 'center',
    marginTop: spacing.sm,
    width: 176,
  },
  corner: {
    borderColor: colors.primary,
    height: 48,
    position: 'absolute',
    width: 48,
  },
  cornerTL: { borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 12, top: 0, left: 0 },
  cornerTR: { borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: 12, top: 0, right: 0 },
  cornerBL: { borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: 12, bottom: 0, left: 0 },
  cornerBR: { borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: 12, bottom: 0, right: 0 },
  scanLine: {
    backgroundColor: 'rgba(194,101,42,0.6)',
    height: 2,
    left: 16,
    position: 'absolute',
    right: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    top: 0,
  },
  barcodeHint: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  barcodeHintIcon: {
    height: 70,
    resizeMode: 'contain',
    width: 86,
  },
  scanLabel: {
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  scanHeading: {
    color: 'rgba(250,245,238,1)',
    fontFamily: fonts.serifMedium,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  scanSub: {
    color: 'rgba(250,245,238,0.8)',
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorBanner: {
    color: '#FCA5A5',
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  permissionCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(250,245,238,0.95)',
    borderColor: colors.borderMedium,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    width: '88%',
  },
  permissionTitle: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  permissionBody: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  permissionBtnWrap: {
    marginTop: spacing.sm,
    width: '100%',
  },
  tools: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  toolBtn: {
    alignItems: 'center',
    gap: 8,
  },
  toolBtnCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(58,48,42,0.2)',
    borderColor: 'rgba(250,245,238,0.3)',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  toolBtnIcon: {
    height: 17,
    resizeMode: 'contain',
    width: 17,
  },
  toolBtnLabel: {
    color: 'rgba(250,245,238,0.8)',
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  previewCard: {
    backgroundColor: 'rgba(250,245,238,0.9)',
    borderColor: 'rgba(216,208,200,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    bottom: bottomNavClearance + 8,
    flexDirection: 'row',
    gap: spacing.lg,
    left: '4%',
    padding: 18,
    position: 'absolute',
    right: '4%',
    ...shadow.nav,
  },
  productImageBg: {
    alignItems: 'center',
    backgroundColor: '#F2ECE4',
    borderRadius: radius.md,
    height: 80,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 80,
  },
  productImageBgScanned: {
    backgroundColor: 'rgba(74,124,89,0.2)',
  },
  productImageOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(194,101,42,0.2)',
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  productScanIcon: {
    height: 20,
    resizeMode: 'contain',
    width: 20,
  },
  previewInfo: {
    flex: 1,
    gap: 10,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastScannedLabel: {
    color: colors.subtle,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  productName: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 25,
    marginTop: 2,
    width: 150,
  },
  productHint: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  productPrice: {
    color: colors.primary,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    lineHeight: 24,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  halfBtn: {
    flex: 1,
  },
  topNav: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  topNavRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  glassBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(250,245,238,0.8)',
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
    ...shadow.card,
  },
  glassBtnIcon: {
    height: 14,
    resizeMode: 'contain',
    width: 14,
  },
  glassTitle: {
    backgroundColor: 'rgba(250,245,238,0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    ...shadow.card,
  },
  glassTitleText: {
    color: colors.primary,
    fontFamily: fonts.serif,
    fontSize: 16,
    letterSpacing: -0.4,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMedium,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    width: '100%',
    ...shadow.card,
  },
  modalTitle: {
    color: colors.ink,
    fontFamily: fonts.serifMedium,
    fontSize: 24,
    lineHeight: 30,
  },
  modalInput: {
    backgroundColor: colors.white,
    borderColor: colors.borderMedium,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalError: {
    color: '#B3261E',
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtnHalf: {
    flex: 1,
  },
});
