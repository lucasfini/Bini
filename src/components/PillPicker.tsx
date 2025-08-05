// src/components/PillPicker.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Plus, X, Check } from '@tamagui/lucide-icons';

interface PillOption {
  id: string;
  label: string;
}

interface PillPickerProps {
  allAlertOptions: PillOption[];
  selectedAlerts: string[];
  onSelectAlerts: (alertIds: string[]) => void;
  placeholder?: string;
}

const { height: screenHeight } = Dimensions.get('window');

const PillPicker: React.FC<PillPickerProps> = ({
  allAlertOptions,
  selectedAlerts,
  onSelectAlerts,
  placeholder = 'Add Alert',
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempSelectedAlerts, setTempSelectedAlerts] = useState<string[]>([]);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openModal = () => {
    setTempSelectedAlerts([...selectedAlerts]);
    setIsModalVisible(true);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
    });
  };

  const handleSave = () => {
    onSelectAlerts(tempSelectedAlerts);
    closeModal();
  };

  const toggleTempAlert = (alertId: string) => {
    setTempSelectedAlerts(prev =>
      prev.includes(alertId)
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId],
    );
  };

  const removePill = (alertId: string) => {
    const updatedAlerts = selectedAlerts.filter(id => id !== alertId);
    onSelectAlerts(updatedAlerts);
  };

  const getSelectedOptionLabels = () => {
    return selectedAlerts
      .map(id => allAlertOptions.find(option => option.id === id)?.label || '')
      .filter(label => label !== '');
  };

  return (
    <View style={styles.container}>
      {/* Selected Pills */}
      {selectedAlerts.length > 0 && (
        <View style={styles.pillsContainer}>
          {getSelectedOptionLabels().map((label, index) => {
            const alertId = selectedAlerts[index];
            return (
              <View key={alertId} style={styles.pill}>
                <Text style={styles.pillText}>{label}</Text>
                <TouchableOpacity
                  style={styles.pillRemoveButton}
                  onPress={() => removePill(alertId)}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <X size={14} color="#666666" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* Add Alert Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={openModal}
        activeOpacity={0.7}
        accessibilityLabel={placeholder}
        accessibilityHint="Opens alert selection modal"
      >
        <Plus size={18} color="#4A7C3A" />
        <Text style={styles.addButtonText}>{placeholder}</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={closeModal}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Select Alerts</Text>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            >
              {allAlertOptions.map((option, index) => {
                const isSelected = tempSelectedAlerts.includes(option.id);

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionItem,
                      index === allAlertOptions.length - 1 &&
                        styles.lastOptionItem,
                    ]}
                    onPress={() => toggleTempAlert(option.id)}
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={option.label}
                  >
                    <Text style={styles.optionLabel}>{option.label}</Text>

                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#4A7C3A',
  },
  pillText: {
    fontSize: 14,
    color: '#2C3E26',
    fontWeight: '500',
    marginRight: 6,
  },
  pillRemoveButton: {
    padding: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    minHeight: 44,
  },
  addButtonText: {
    fontSize: 16,
    color: '#4A7C3A',
    fontWeight: '500',
    marginLeft: 6,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E26',
  },
  saveButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#4A7C3A',
    fontWeight: '600',
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 56,
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionLabel: {
    fontSize: 16,
    color: '#2C3E26',
    flex: 1,
    fontWeight: '400',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#4A7C3A',
    borderColor: '#4A7C3A',
  },
});

export default PillPicker;
