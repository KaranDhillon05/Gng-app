import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { apiClient } from '../../core/api/apiClient';

type StoreItem = {
  id: string;
  name: string;
  address: string | null;
};

type StoreState = {
  stores: StoreItem[];
  selectedStoreId: string | null;
  selectedStoreName: string;
  isLoading: boolean;
  fetchStores: () => Promise<void>;
  selectStore: (id: string, name: string) => void;
};

export const useStoreStore = create<StoreState>()(
  persist(
    (set) => ({
      stores: [],
      selectedStoreId: null,
      selectedStoreName: '',
      isLoading: false,
      fetchStores: async () => {
        set({ isLoading: true });
        try {
          const { data } = await apiClient.get<StoreItem[]>('/stores');
          const validIds = new Set(data.map((store) => store.id));
          let { selectedStoreId, selectedStoreName } = useStoreStore.getState();

          // Clear stale mock IDs ('1', '2', …) or any store no longer in the API list.
          if (selectedStoreId && !validIds.has(selectedStoreId)) {
            selectedStoreId = null;
            selectedStoreName = '';
          }

          if (!selectedStoreId && data.length === 1) {
            selectedStoreId = data[0].id;
            selectedStoreName = data[0].name;
          }

          set({
            stores: data,
            selectedStoreId,
            selectedStoreName,
            isLoading: false,
          });
        } catch {
          set({ stores: [], isLoading: false });
        }
      },
      selectStore: (id, name) => set({ selectedStoreId: id, selectedStoreName: name }),
    }),
    {
      name: 'gng-store-selection',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedStoreId: state.selectedStoreId,
        selectedStoreName: state.selectedStoreName,
      }),
    },
  ),
);
