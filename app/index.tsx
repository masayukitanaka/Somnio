import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { RemoveAdsButton } from "@/components/RemoveAdsButton";

export default function Index() {
  return (
    <LinearGradient
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        <RemoveAdsButton />
        <View style={styles.innerContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Somnio</Text>
        <Text style={styles.subtitle}>Your Journey to Better Sleep & Relaxation</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
        
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions:</Text>
          
          <Link href="/(tabs)/sleep" asChild>
            <TouchableOpacity style={styles.quickButton}>
              <Text style={styles.quickButtonText}>🌙 Sleep Sounds</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(tabs)/relax" asChild>
            <TouchableOpacity style={styles.quickButton}>
              <Text style={styles.quickButtonText}>🍃 Relaxation</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(tabs)/focus" asChild>
            <TouchableOpacity style={styles.quickButton}>
              <Text style={styles.quickButtonText}>🧠 Focus Music</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      </View>
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
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#b8d4f0',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#0A2647',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  quickActions: {
    alignItems: 'center',
    width: '100%',
  },
  quickActionsTitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    fontWeight: '500',
  },
  quickButton: {
    backgroundColor: '#2B5797',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
