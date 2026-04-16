import {
  EBGaramond_500Medium,
  EBGaramond_700Bold,
  useFonts as useEBGaramond,
} from '@expo-google-fonts/eb-garamond';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts as useManrope,
} from '@expo-google-fonts/manrope';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AppNavigator } from './src/app/AppNavigator';
import { colors } from './src/shared/theme/tokens';

export default function App() {
  const [ebLoaded] = useEBGaramond({ EBGaramond_500Medium, EBGaramond_700Bold });
  const [manropeLoaded] = useManrope({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!ebLoaded || !manropeLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="dark" backgroundColor={colors.background} />
    </>
  );
}
