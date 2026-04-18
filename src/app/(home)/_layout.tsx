import { Stack } from 'expo-router'
import React from 'react'

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        orientation: 'default',
      }}
    >
      <Stack.Screen name='index' />
      <Stack.Screen name='manga' />
      <Stack.Screen name='reader' />
    </Stack>
  )
}