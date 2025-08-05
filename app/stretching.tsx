import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  Image,
  Modal,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 60) / 2; // 2 columns with padding

interface StretchItem {
  id: string;
  name: string;
  description: string;
  image: any;
}

const stretchingData: StretchItem[] = [
  {
    id: '1',
    name: 'Back Stretch',
    description: 'Gently stretch your back muscles to relieve tension and improve flexibility.',
    image: require('@/assets/images/stretching/back.png'),
  },
  {
    id: '2',
    name: 'Body Stem',
    description: 'Stretch your entire body from head to toe for overall flexibility.',
    image: require('@/assets/images/stretching/bodystem.png'),
  },
  {
    id: '3',
    name: 'Chest Stretch',
    description: 'Open up your chest and improve breathing with this stretch.',
    image: require('@/assets/images/stretching/chest_strech.png'),
  },
  {
    id: '4',
    name: 'Forward Bend',
    description: 'Bend forward to stretch your hamstrings and lower back.',
    image: require('@/assets/images/stretching/forward_bend.png'),
  },
  {
    id: '5',
    name: 'Forward Bend Variation',
    description: 'Alternative forward bend position for deeper stretch.',
    image: require('@/assets/images/stretching/forward_bend2.png'),
  },
  {
    id: '6',
    name: 'Seated Forward Bend',
    description: 'Seated position forward bend for hamstring flexibility.',
    image: require('@/assets/images/stretching/forward_bend3.png'),
  },
  {
    id: '7',
    name: 'Crossed Leg Forward Bend',
    description: 'Forward bend with crossed legs for hip flexibility.',
    image: require('@/assets/images/stretching/forward_bend_crossed_legs.png'),
  },
  {
    id: '8',
    name: 'Hamstring Stretch',
    description: 'Target your hamstrings with this focused stretch.',
    image: require('@/assets/images/stretching/hamstring.png'),
  },
  {
    id: '9',
    name: 'Hamstring Stretch 2',
    description: 'Alternative hamstring stretch for deeper flexibility.',
    image: require('@/assets/images/stretching/hamstring2.png'),
  },
  {
    id: '10',
    name: 'Heel Stretch',
    description: 'Stretch your calves and achilles tendon.',
    image: require('@/assets/images/stretching/heel.png'),
  },
  {
    id: '11',
    name: 'Hip Joint Stretch',
    description: 'Improve hip flexibility and reduce stiffness.',
    image: require('@/assets/images/stretching/hipjoint.png'),
  },
  {
    id: '12',
    name: 'Knee Stretch',
    description: 'Gentle knee stretch to improve joint flexibility.',
    image: require('@/assets/images/stretching/knee_strech.png'),
  },
  {
    id: '13',
    name: 'Shoulder Stretch',
    description: 'Release shoulder tension and improve mobility.',
    image: require('@/assets/images/stretching/sholder.png'),
  },
  {
    id: '14',
    name: 'Shoulder Shrug',
    description: 'Simple shoulder shrug to release neck and shoulder tension.',
    image: require('@/assets/images/stretching/shrug.png'),
  },
  {
    id: '15',
    name: 'Side Stretching',
    description: 'Stretch your obliques and improve lateral flexibility.',
    image: require('@/assets/images/stretching/side_streching.png'),
  },
  {
    id: '16',
    name: 'Back Extension',
    description: 'Extend your back to counteract forward bending postures.',
    image: require('@/assets/images/stretching/stretch_back.png'),
  },
  {
    id: '17',
    name: 'General Stretching',
    description: 'Full body stretching routine for overall flexibility.',
    image: require('@/assets/images/stretching/stretching.png'),
  },
  {
    id: '18',
    name: 'Torso Twist',
    description: 'Twist your torso to improve spinal mobility.',
    image: require('@/assets/images/stretching/twist.png'),
  },
];

export default function StretchingScreen() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<StretchItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleTilePress = (item: StretchItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  const renderTile = ({ item }: { item: StretchItem }) => (
    <TouchableOpacity 
      style={styles.tile}
      onPress={() => handleTilePress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.tileImage} resizeMode="cover" />
      <View style={styles.tileOverlay}>
        <Text style={styles.tileName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Stretching</ThemedText>
          <View style={styles.backButton} />
        </View>

        <FlatList
          data={stretchingData}
          renderItem={renderTile}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <BlurView intensity={100} style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={handleCloseModal}
              >
                <MaterialIcons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
              
              {selectedItem && (
                <>
                  <Image 
                    source={selectedItem.image} 
                    style={styles.modalImage} 
                    resizeMode="contain" 
                  />
                  <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                    {selectedItem.name}
                  </ThemedText>
                  <Text style={styles.modalDescription}>
                    {selectedItem.description}
                  </Text>
                </>
              )}
            </View>
          </BlurView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
  },
  gridContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
  },
  tileName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(20, 66, 114, 0.95)',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 10,
  },
  modalImage: {
    width: width - 80,
    height: 300,
    marginTop: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
});