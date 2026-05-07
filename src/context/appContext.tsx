import Toast from '@/components/ui/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
    defaultLanguage: 'en' | 'es-la';
    setDefaultLanguage: (value: 'en' | 'es-la') => void;
    readingMode: 'horizontal' | 'vertical';
    setReadingMode: (value: 'horizontal' | 'vertical') => void;
    readingDirection: 'ltr' | 'rtl';
    setReadingDirection: (value: 'ltr' | 'rtl') => void;
    readingPaging: 'single' | 'multiple';
    setReadingPaging: (value: 'single' | 'multiple') => void;
    imageQuality: 'high' | 'low';
    setImageQuality: (value: 'high' | 'low') => void;
    dataMode: 'wifi-only' | 'always';
    setDataMode: (value: 'wifi-only' | 'always') => void;
    isLoaded: boolean;
}

const DEFAULT_SETTINGS = {
    defaultLanguage: 'en' as const,
    readingMode: 'horizontal' as const,
    readingDirection: 'rtl' as const,
    readingPaging: 'single' as const,
    imageQuality: 'low' as const,
    dataMode: 'wifi-only' as const,
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [defaultLanguage, setDefaultLanguage] = useState<'en' | 'es-la'>(DEFAULT_SETTINGS.defaultLanguage);
    const [readingMode, setReadingMode] = useState<'horizontal' | 'vertical'>(DEFAULT_SETTINGS.readingMode);
    const [readingDirection, setReadingDirection] = useState<'ltr' | 'rtl'>(DEFAULT_SETTINGS.readingDirection);
    const [readingPaging, setReadingPaging] = useState<'single' | 'multiple'>(DEFAULT_SETTINGS.readingPaging);
    const [imageQuality, setImageQuality] = useState<'high' | 'low'>(DEFAULT_SETTINGS.imageQuality);
    const [dataMode, setDataMode] = useState<'wifi-only' | 'always'>(DEFAULT_SETTINGS.dataMode);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedSettings = await AsyncStorage.multiGet(['defaultLanguage', 'readingMode', 'readingDirection', 'readingPaging', 'imageQuality', 'dataMode']);

                storedSettings.forEach(([key, value]) => {
                    if (value) {
                        switch (key) {
                            case 'defaultLanguage':
                                if (value === 'en' || value === 'es-la') setDefaultLanguage(value);
                                break;
                            case 'readingMode':
                                if (value === 'horizontal' || value === 'vertical') setReadingMode(value);
                                break;
                            case 'readingDirection':
                                if (value === 'ltr' || value === 'rtl') setReadingDirection(value);
                                break;
                            case 'readingPaging':
                                if (value === 'single' || value === 'multiple') setReadingPaging(value);
                                break;
                            case 'imageQuality':
                                if (value === 'high' || value === 'low') setImageQuality(value);
                                break;
                            case 'dataMode':
                                if (value === 'wifi-only' || value === 'always') setDataMode(value);
                                break;
                        }
                    }
                });
            } catch (error) {
                Toast({ message: 'Error loading context' });
            } finally {
                setIsLoaded(true);
            }
        };

        loadSettings();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const saveSettings = async () => {
            try {
                await AsyncStorage.multiSet([
                    ['defaultLanguage', defaultLanguage],
                    ['readingMode', readingMode],
                    ['readingDirection', readingDirection],
                    ['readingPaging', readingPaging],
                    ['imageQuality', imageQuality],
                    ['dataMode', dataMode],
                ]);
            } catch (error) {
                Toast({ message: 'Error saving context' });
            }
        };

        saveSettings();
    }, [defaultLanguage, readingMode, readingDirection, readingPaging, imageQuality, dataMode, isLoaded]);

    return (
        <SettingsContext.Provider
            value={{
                defaultLanguage,
                setDefaultLanguage,
                readingMode,
                setReadingMode,
                readingDirection,
                setReadingDirection,
                readingPaging,
                setReadingPaging,
                imageQuality,
                setImageQuality,
                dataMode,
                setDataMode,
                isLoaded,
            }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);

    if (!context) throw new Error('Error in context');
    return context;
}
