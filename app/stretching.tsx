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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import { additionalScreenTranslations, getCurrentLanguage, getTranslation } from '@/utils/i18n';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 60) / 2; // 2 columns with padding

interface StretchItem {
  id: string;
  name: string;
  description: string;
  image: any;
}

interface TranslatedStretchItem {
  id: string;
  name: {
    [key: string]: string;
  };
  description: {
    [key: string]: string;
  };
  image: any;
}

const translatedStretchingData: TranslatedStretchItem[] = [
  {
    id: '1',
    name: {
      'en': 'Back Stretch',
      'ja': '背中のストレッチ',
      'es': 'Estiramiento de espalda',
      'zh': '背部伸展',
    },
    description: {
      'en': 'Gently stretch your back muscles to relieve tension and improve flexibility.',
      'ja': '背中の筋肉を優しくストレッチして緊張をほぐし、柔軟性を向上させます。',
      'es': 'Estira suavemente los músculos de la espalda para aliviar la tensión y mejorar la flexibilidad.',
      'zh': '轻柔地伸展背部肌肉以缓解紧张并提高柔韧性。',
    },
    image: require('@/assets/images/stretching/back.png'),
  },
  {
    id: '2',
    name: {
      'en': 'Body Stem',
      'ja': 'ボディステム',
      'es': 'Cuerpo completo',
      'zh': '全身',
    },
    description: {
      'en': 'Stretch your entire body from head to toe for overall flexibility.',
      'ja': '頭からつま先まで全身をストレッチして、全体的な柔軟性を向上させます。',
      'es': 'Estira todo tu cuerpo de la cabeza a los pies para mejorar la flexibilidad general.',
      'zh': '从头到脚伸展整个身体，提高整体柔韧性。',
    },
    image: require('@/assets/images/stretching/bodystem.png'),
  },
  {
    id: '3',
    name: {
      'en': 'Chest Stretch',
      'ja': '胸のストレッチ',
      'es': 'Estiramiento de pecho',
      'zh': '胸部伸展',
    },
    description: {
      'en': 'Open up your chest and improve breathing with this stretch.',
      'ja': '胸を開いて、このストレッチで呼吸を改善します。',
      'es': 'Abre el pecho y mejora la respiración con este estiramiento.',
      'zh': '通过这个伸展动作打开胸部并改善呼吸。',
    },
    image: require('@/assets/images/stretching/chest_strech.png'),
  },
  {
    id: '4',
    name: {
      'en': 'Forward Bend',
      'ja': 'フォワードベンド',
      'es': 'Flexión hacia adelante',
      'zh': '前弯',
    },
    description: {
      'en': 'Bend forward to stretch your hamstrings and lower back.',
      'ja': 'ハムストリングと腰を伸ばすために前に曲がります。',
      'es': 'Inclínate hacia adelante para estirar los isquiotibiales y la parte baja de la espalda.',
      'zh': '向前弯曲以拉伸您的腿筋和下背部。',
    },
    image: require('@/assets/images/stretching/forward_bend.png'),
  },
  {
    id: '5',
    name: {
      'en': 'Forward Bend Variation',
      'ja': 'フォワードベンドバリエーション',
      'es': 'Variación de flexión hacia adelante',
      'zh': '前弯变化',
    },
    description: {
      'en': 'Alternative forward bend position for deeper stretch.',
      'ja': 'より深いストレッチのための代替フォワードベンドポジション。',
      'es': 'Posición alternativa de flexión hacia adelante para un estiramiento más profundo.',
      'zh': '用于更深层伸展的替代前弯姿势。',
    },
    image: require('@/assets/images/stretching/forward_bend2.png'),
  },
  {
    id: '6',
    name: {
      'en': 'Seated Forward Bend',
      'ja': '座位フォワードベンド',
      'es': 'Flexión hacia adelante sentado',
      'zh': '坐姿前弯',
    },
    description: {
      'en': 'Seated position forward bend for hamstring flexibility.',
      'ja': 'ハムストリングの柔軟性のための座位フォワードベンド。',
      'es': 'Flexión hacia adelante en posición sentada para la flexibilidad de los isquiotibiales.',
      'zh': '坐姿前弯以提高腿筋柔韧性。',
    },
    image: require('@/assets/images/stretching/forward_bend3.png'),
  },
  {
    id: '7',
    name: {
      'en': 'Crossed Leg Forward Bend',
      'ja': '足を組んだフォワードベンド',
      'es': 'Flexión hacia adelante con piernas cruzadas',
      'zh': '交叉腿前弯',
    },
    description: {
      'en': 'Forward bend with crossed legs for hip flexibility.',
      'ja': '股関節の柔軟性のための足を組んだフォワードベンド。',
      'es': 'Flexión hacia adelante con piernas cruzadas para la flexibilidad de la cadera.',
      'zh': '交叉腿前弯以提高髋部柔韧性。',
    },
    image: require('@/assets/images/stretching/forward_bend_crossed_legs.png'),
  },
  {
    id: '8',
    name: {
      'en': 'Hamstring Stretch',
      'ja': 'ハムストリングストレッチ',
      'es': 'Estiramiento de isquiotibiales',
      'zh': '腿筋伸展',
    },
    description: {
      'en': 'Target your hamstrings with this focused stretch.',
      'ja': 'この集中的なストレッチでハムストリングをターゲットにします。',
      'es': 'Apunta a tus isquiotibiales con este estiramiento enfocado.',
      'zh': '通过这个专注的伸展来锻炼您的腿筋。',
    },
    image: require('@/assets/images/stretching/hamstring.png'),
  },
  {
    id: '9',
    name: {
      'en': 'Hamstring Stretch 2',
      'ja': 'ハムストリングストレッチ2',
      'es': 'Estiramiento de isquiotibiales 2',
      'zh': '腿筋伸展2',
    },
    description: {
      'en': 'Alternative hamstring stretch for deeper flexibility.',
      'ja': 'より深い柔軟性のための代替ハムストリングストレッチ。',
      'es': 'Estiramiento alternativo de isquiotibiales para mayor flexibilidad.',
      'zh': '用于更深柔韧性的替代腿筋伸展。',
    },
    image: require('@/assets/images/stretching/hamstring2.png'),
  },
  {
    id: '10',
    name: {
      'en': 'Heel Stretch',
      'ja': 'ヒールストレッチ',
      'es': 'Estiramiento de talón',
      'zh': '脚跟伸展',
    },
    description: {
      'en': 'Stretch your calves and achilles tendon.',
      'ja': 'ふくらはぎとアキレス腱をストレッチします。',
      'es': 'Estira las pantorrillas y el tendón de Aquiles.',
      'zh': '拉伸您的小腿和跟腱。',
    },
    image: require('@/assets/images/stretching/heel.png'),
  },
  {
    id: '11',
    name: {
      'en': 'Hip Joint Stretch',
      'ja': '股関節ストレッチ',
      'es': 'Estiramiento de articulación de cadera',
      'zh': '髋关节伸展',
    },
    description: {
      'en': 'Improve hip flexibility and reduce stiffness.',
      'ja': '股関節の柔軟性を向上させ、こわばりを軽減します。',
      'es': 'Mejora la flexibilidad de la cadera y reduce la rigidez.',
      'zh': '改善髋部柔韧性并减少僵硬。',
    },
    image: require('@/assets/images/stretching/hipjoint.png'),
  },
  {
    id: '12',
    name: {
      'en': 'Knee Stretch',
      'ja': '膝ストレッチ',
      'es': 'Estiramiento de rodilla',
      'zh': '膝盖伸展',
    },
    description: {
      'en': 'Gentle knee stretch to improve joint flexibility.',
      'ja': '関節の柔軟性を向上させるための優しい膝ストレッチ。',
      'es': 'Estiramiento suave de rodilla para mejorar la flexibilidad articular.',
      'zh': '温和的膝盖伸展以改善关节柔韧性。',
    },
    image: require('@/assets/images/stretching/knee_strech.png'),
  },
  {
    id: '13',
    name: {
      'en': 'Shoulder Stretch',
      'ja': '肩ストレッチ',
      'es': 'Estiramiento de hombro',
      'zh': '肩部伸展',
    },
    description: {
      'en': 'Release shoulder tension and improve mobility.',
      'ja': '肩の緊張を解放し、可動性を向上させます。',
      'es': 'Libera la tensión del hombro y mejora la movilidad.',
      'zh': '释放肩部紧张并改善活动性。',
    },
    image: require('@/assets/images/stretching/sholder.png'),
  },
  {
    id: '14',
    name: {
      'en': 'Shoulder Shrug',
      'ja': '肩すくめ',
      'es': 'Encogimiento de hombros',
      'zh': '耸肩',
    },
    description: {
      'en': 'Simple shoulder shrug to release neck and shoulder tension.',
      'ja': '首と肩の緊張を解放するためのシンプルな肩すくめ。',
      'es': 'Encogimiento simple de hombros para liberar la tensión del cuello y los hombros.',
      'zh': '简单的耸肩动作来释放颈部和肩部紧张。',
    },
    image: require('@/assets/images/stretching/shrug.png'),
  },
  {
    id: '15',
    name: {
      'en': 'Side Stretching',
      'ja': 'サイドストレッチ',
      'es': 'Estiramiento lateral',
      'zh': '侧面伸展',
    },
    description: {
      'en': 'Stretch your obliques and improve lateral flexibility.',
      'ja': '腹斜筋をストレッチし、横の柔軟性を向上させます。',
      'es': 'Estira los oblicuos y mejora la flexibilidad lateral.',
      'zh': '拉伸您的腹斜肌并提高横向柔韧性。',
    },
    image: require('@/assets/images/stretching/side_streching.png'),
  },
  {
    id: '16',
    name: {
      'en': 'Back Extension',
      'ja': '背中伸展',
      'es': 'Extensión de espalda',
      'zh': '背部伸展',
    },
    description: {
      'en': 'Extend your back to counteract forward bending postures.',
      'ja': '前かがみの姿勢を打ち消すために背中を伸ばします。',
      'es': 'Extiende tu espalda para contrarrestar las posturas de flexión hacia adelante.',
      'zh': '伸展背部以抵消前弯姿势。',
    },
    image: require('@/assets/images/stretching/stretch_back.png'),
  },
  {
    id: '17',
    name: {
      'en': 'General Stretching',
      'ja': '全般ストレッチ',
      'es': 'Estiramiento general',
      'zh': '综合伸展',
    },
    description: {
      'en': 'Full body stretching routine for overall flexibility.',
      'ja': '全体的な柔軟性のための全身ストレッチルーティン。',
      'es': 'Rutina de estiramiento de cuerpo completo para flexibilidad general.',
      'zh': '全身伸展例程以提高整体柔韧性。',
    },
    image: require('@/assets/images/stretching/stretching.png'),
  },
  {
    id: '18',
    name: {
      'en': 'Torso Twist',
      'ja': '胴体ひねり',
      'es': 'Giro de torso',
      'zh': '躯干扭转',
    },
    description: {
      'en': 'Twist your torso to improve spinal mobility.',
      'ja': '脊椎の可動性を向上させるために胴体をひねります。',
      'es': 'Gira tu torso para mejorar la movilidad espinal.',
      'zh': '扭转躯干以改善脊柱活动性。',
    },
    image: require('@/assets/images/stretching/twist.png'),
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
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [stretchingData, setStretchingData] = useState<StretchItem[]>([]);

  React.useEffect(() => {
    loadCurrentLanguage();
  }, []);

  React.useEffect(() => {
    updateStretchingData();
  }, [currentLanguage]);

  const loadCurrentLanguage = async () => {
    try {
      const language = await getCurrentLanguage();
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error loading current language:', error);
    }
  };

  const updateStretchingData = () => {
    const localizedData = translatedStretchingData.map(item => ({
      id: item.id,
      name: item.name[currentLanguage] || item.name['en'],
      description: item.description[currentLanguage] || item.description['en'],
      image: item.image,
    }));
    setStretchingData(localizedData);
  };

  // Translation helper function
  const t = (key: string) => getTranslation(additionalScreenTranslations, key, currentLanguage);

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
          <ThemedText type="title" style={styles.headerTitle}>{t('stretching')}</ThemedText>
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