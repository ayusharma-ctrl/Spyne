import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ICar } from '@/lib/types'

interface AppState {
    userId: string | null;
    selectedCar: ICar | null;
    setUserId: (userId: string | null) => void;
    setSelectedCar: (car: ICar | null) => void;
    clearUserId: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            userId: null,
            selectedCar: null,
            setUserId: (userId) => set({ userId }),
            setSelectedCar: (car) => set({ selectedCar: car }),
            clearUserId: () => set({ userId: null }),
        }),
        {
            name: 'app-storage',
            partialize: (state) => ({ userId: state.userId, selectedCar: state.selectedCar }), // save these two locally
        }
    )
);