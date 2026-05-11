import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { uploadAttachment, deleteAttachment, getAttachmentUrl } from '@/lib/supabase';

const isWeb = Platform.OS === 'web';

interface AttachmentsUploaderProps {
  userId: string;
  renewalId: string;
  attachments: string[];
  onAttachmentsChange: (attachments: string[]) => void;
}

export function AttachmentsUploader({
  userId,
  renewalId,
  attachments,
  onAttachmentsChange,
}: AttachmentsUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File | Blob, fileName: string) => {
    setUploading(true);
    const { data, error } = await uploadAttachment(userId, renewalId, file, fileName);
    setUploading(false);

    if (error || !data?.path) {
      Alert.alert('Error', 'No se pudo subir el archivo');
      return;
    }

    onAttachmentsChange([...attachments, data.path]);
  };

  const handleWebFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      await handleFile(files[i], files[i].name);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      handleFile(files[i], files[i].name);
    }
  }, [attachments, onAttachmentsChange]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      await handleFile(blob, asset.name || 'document');
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const fileName = asset.uri.split('/').pop() || 'image.jpg';
      await handleFile(blob, fileName);
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleRemove = async (path: string) => {
    Alert.alert(
      'Eliminar adjunto',
      '¿Estás seguro de que quieres eliminar este archivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteAttachment(path);
            if (error) {
              Alert.alert('Error', 'No se pudo eliminar el archivo');
              return;
            }
            onAttachmentsChange(attachments.filter((a) => a !== path));
          },
        },
      ]
    );
  };

  const isImage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
  };

  const isPdf = (path: string) => {
    return path.toLowerCase().endsWith('.pdf');
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  return (
    <View style={styles.container}>
      {isWeb ? (
        <View
          style={[
            styles.dropZone,
            dragActive && styles.dropZoneActive,
          ]}
          onMouseEnter={() => setDragActive(false)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,image/*"
            style={styles.fileInput}
            onChange={handleWebFileChange}
          />
          <IconSymbol name="doc.badge.arrow.up" size={32} color="#b6d9fc" />
          <Text style={styles.dropZoneText}>
            Arrastra archivos aquí o haz clic para seleccionar
          </Text>
          <Text style={styles.dropZoneSubtext}>PDF, JPG, PNG</Text>
        </View>
      ) : (
        <View style={styles.nativeActions}>
          <TouchableOpacity style={styles.nativeButton} onPress={pickDocument}>
            <IconSymbol name="doc.text" size={20} color="#007AFF" />
            <Text style={styles.nativeButtonText}>Documento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nativeButton} onPress={pickImage}>
            <IconSymbol name="photo" size={20} color="#007AFF" />
            <Text style={styles.nativeButtonText}>Imagen</Text>
          </TouchableOpacity>
        </View>
      )}

      {uploading && (
        <View style={styles.uploadingRow}>
          <ActivityIndicator size="small" color={isWeb ? '#b6d9fc' : '#007AFF'} />
          <Text style={[styles.uploadingText, isWeb && styles.uploadingTextWeb]}>
            Subiendo archivo...
          </Text>
        </View>
      )}

      {attachments.length > 0 && (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {attachments.map((path) => {
            const url = getAttachmentUrl(path);
            const fileName = getFileName(path);
            const imageFile = isImage(path);
            const pdfFile = isPdf(path);

            return (
              <View key={path} style={[styles.item, isWeb && styles.itemWeb]}>
                {imageFile ? (
                  isWeb ? (
                    <img src={url} alt={fileName} style={styles.thumbnailWeb} />
                  ) : (
                    <Image source={{ uri: url }} style={styles.thumbnail} />
                  )
                ) : (
                  <View style={[styles.iconPreview, isWeb && styles.iconPreviewWeb]}>
                    <IconSymbol
                      name={pdfFile ? 'doc.text' : 'doc'}
                      size={28}
                      color={isWeb ? '#b6d9fc' : '#007AFF'}
                    />
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <Text
                    style={[styles.itemName, isWeb && styles.itemNameWeb]}
                    numberOfLines={1}
                  >
                    {fileName}
                  </Text>
                  <Text style={[styles.itemType, isWeb && styles.itemTypeWeb]}>
                    {imageFile ? 'Imagen' : pdfFile ? 'PDF' : 'Archivo'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemove(path)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <IconSymbol
                    name="trash"
                    size={18}
                    color={isWeb ? '#FF453A' : '#FF3B30'}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropZone: {
    borderWidth: 2,
    borderColor: 'rgba(186, 215, 247, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(186, 214, 247, 0.03)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    position: 'relative',
    overflow: 'hidden',
  } as any,
  dropZoneActive: {
    borderColor: '#b6d9fc',
    backgroundColor: 'rgba(102, 58, 243, 0.08)',
  } as any,
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    zIndex: 2,
  } as any,
  dropZoneText: {
    color: '#d1e4fa',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  dropZoneSubtext: {
    color: '#9da7ba',
    fontSize: 12,
    marginTop: 4,
  },
  nativeActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  nativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  nativeButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  uploadingText: {
    color: '#3C3C43',
    fontSize: 13,
  },
  uploadingTextWeb: {
    color: '#9da7ba',
  },
  list: {
    marginTop: 12,
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  itemWeb: {
    backgroundColor: 'rgba(186, 214, 247, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(186, 215, 247, 0.1)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  } as any,
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  thumbnailWeb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(186, 214, 247, 0.06)',
    objectFit: 'cover',
  } as any,
  iconPreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPreviewWeb: {
    backgroundColor: 'rgba(186, 214, 247, 0.06)',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  itemNameWeb: {
    color: '#d1e4fa',
  },
  itemType: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  itemTypeWeb: {
    color: '#9da7ba',
  },
  deleteButton: {
    padding: 6,
  },
});
