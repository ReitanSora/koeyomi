import { Stack } from 'expo-router'
import React from 'react'

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        orientation: 'default',
      }}
    >
      <Stack.Screen name='index' />
      <Stack.Screen name='about' />
      <Stack.Screen name='preferences' />
      <Stack.Screen name='(storageManager)' />
    </Stack>
  )
}