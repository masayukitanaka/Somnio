import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export function RemoveAdsButton() {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePurchase = () => {
    // TODO: Implement actual in-app purchase logic
    Alert.alert(
      'Purchase Confirmation',
      'Would you like to remove ads for $2.99?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Purchase',
          onPress: () => {
            setModalVisible(false);
            Alert.alert('Success!', 'Ads have been removed. Thank you for your support!');
          },
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Image
          source={require('@/assets/images/remove-ads.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <LinearGradient
            colors={['#0A2647', '#144272', '#205295']}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalContent}>
              <StatusBar barStyle="light-content" />
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>

              <View style={styles.header}>
                <MaterialIcons name="star" size={48} color="#FFD700" />
                <Text style={styles.title}>Remove Ads</Text>
                <Text style={styles.subtitle}>
                  Enjoy uninterrupted relaxation with our premium experience
                </Text>
              </View>

              <View style={styles.features}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="block" size={24} color="#ffffff" />
                  <Text style={styles.featureText}>No more interruptions</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="music-note" size={24} color="#ffffff" />
                  <Text style={styles.featureText}>Seamless audio experience</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="bedtime" size={24} color="#ffffff" />
                  <Text style={styles.featureText}>Perfect for sleep sessions</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="favorite" size={24} color="#ffffff" />
                  <Text style={styles.featureText}>Support app development</Text>
                </View>
              </View>

              <View style={styles.pricing}>
                <Text style={styles.price}>$2.99</Text>
                <Text style={styles.priceDescription}>One-time purchase</Text>
              </View>

              <TouchableOpacity
                style={styles.purchaseButton}
                onPress={handlePurchase}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.purchaseGradient}
                >
                  <Text style={styles.purchaseText}>Remove Ads Forever</Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                This is a one-time purchase. No recurring charges.
              </Text>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  pricing: {
    alignItems: 'center',
    marginBottom: 30,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  priceDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  purchaseButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  purchaseGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  purchaseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2647',
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 10,
  },
});