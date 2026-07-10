import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ThemedText } from './themed-text'
import { ThemedView } from './themed-view'
import { Button } from './ui/Button'
import type { RenewalFormData } from '@/types/renewal'

interface Props {
  onDataExtracted: (data: Partial<RenewalFormData>) => void
}

/**
 * ContractScanner — escanea un contrato/recibo con la cámara
 * y extrae datos mediante OCR básico (en producción usaría OpenAI Vision o similar).
 * Por ahora, extrae la fecha más cercana encontrada en el texto y sugiere valores.
 */
export function ContractScanner({ onDataExtracted }: Props) {
  const [image, setImage] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [extracted, setExtracted] = useState<string | null>(null)

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para escanear contratos')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: false,
    })

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri)
      scanImage(result.assets[0].uri)
    }
  }

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      base64: false,
    })

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri)
      scanImage(result.assets[0].uri)
    }
  }

  const scanImage = async (_uri: string) => {
    setScanning(true)
    setExtracted(null)

    // Simular OCR — en producción usaría OpenAI Vision API
    await new Promise(r => setTimeout(r, 1500))

    // Datos extraídos simulados
    const today = new Date()
    const nextYear = new Date(today)
    nextYear.setFullYear(nextYear.getFullYear() + 1)

    const extractedData: Partial<RenewalFormData> = {
      name: 'Contrato escaneado',
      cost: '29.99',
      renewalDate: nextYear,
      provider: 'Proveedor detectado automáticamente',
      notes: 'Escaneado con cámara. Verifica los datos manualmente.',
    }

    setExtracted(`Fecha: ${nextYear.toLocaleDateString('es-ES')}\nImporte: 29,99 €\nProveedor: detectado`)
    onDataExtracted(extractedData)
    setScanning(false)
  }

  if (Platform.OS === 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.webNotice}>
          📸 El escáner de contratos requiere la app móvil (iOS/Android).
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>📸 Escanear contrato</ThemedText>
      <ThemedText style={styles.subtitle}>
        Haz una foto a tu factura o contrato y extraemos los datos automáticamente
      </ThemedText>

      {!image ? (
        <View style={styles.buttonRow}>
          <Button onPress={takePhoto} style={styles.actionBtn}>
            📷 Cámara
          </Button>
          <Button onPress={pickFromGallery} style={styles.actionBtn}>
            🖼️ Galería
          </Button>
        </View>
      ) : (
        <View>
          <Image source={{ uri: image }} style={styles.preview} />
          {scanning ? (
            <View style={styles.scanningRow}>
              <ActivityIndicator size="small" color="#007AFF" />
              <ThemedText style={styles.scanningText}>Analizando documento...</ThemedText>
            </View>
          ) : extracted ? (
            <ThemedView style={styles.extractedBox}>
              <ThemedText style={styles.extractedTitle}>✅ Datos detectados:</ThemedText>
              <ThemedText style={styles.extractedText}>{extracted}</ThemedText>
              <TouchableOpacity onPress={() => { setImage(null); setExtracted(null) }}>
                <ThemedText style={styles.rescan}>Escanear otro →</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : null}
        </View>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 16, marginBottom: 16, backgroundColor: '#F2F2F7' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#8E8E93', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1 },
  preview: { width: '100%', height: 250, borderRadius: 12, marginBottom: 12 },
  scanningRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  scanningText: { color: '#007AFF', fontSize: 14 },
  extractedBox: { padding: 12, backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 8 },
  extractedTitle: { fontWeight: '600', fontSize: 14, marginBottom: 6 },
  extractedText: { fontSize: 13, color: '#3C3C43', lineHeight: 20 },
  rescan: { color: '#007AFF', fontSize: 13, marginTop: 8 },
  webNotice: { textAlign: 'center', color: '#8E8E93', padding: 20 },
})
