import { Stack } from 'expo-router'
import React from 'react'

export default function StorageManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        orientation: 'default',
      }}
    >
      <Stack.Screen name='index' />
      <Stack.Screen name='manga/[mangaId]' />
    </Stack>
  )
}