import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const STORAGE_KEY = '@somnio_tasks';

export default function TasksScreen() {
  const router = useRouter();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load tasks from storage on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to storage whenever tasks change
  useEffect(() => {
    if (isLoaded) {
      saveTasks();
    }
  }, [tasks, isLoaded]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }));
        setTasks(parsedTasks);
      } else {
        // Set default tasks if no stored tasks exist
        const defaultTasks: Task[] = [
          {
            id: '1',
            title: 'Complete project proposal',
            description: 'Write and review the Q4 project proposal document',
            completed: false,
            priority: 'high',
            createdAt: new Date(),
          },
          {
            id: '2',
            title: 'Team meeting preparation',
            description: 'Prepare agenda and materials for Monday meeting',
            completed: false,
            priority: 'medium',
            createdAt: new Date(),
          },
          {
            id: '3',
            title: 'Review code changes',
            description: '',
            completed: true,
            priority: 'low',
            createdAt: new Date(),
          },
        ];
        setTasks(defaultTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks from storage');
    } finally {
      setIsLoaded(true);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      Alert.alert('Error', 'Failed to save tasks to storage');
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const addTask = () => {
    if (newTaskTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      completed: false,
      priority: newTaskPriority,
      createdAt: new Date(),
    };

    setTasks(prev => [newTask, ...prev]);
    resetForm();
    setShowAddModal(false);
  };

  const updateTask = () => {
    if (!editingTask || newTaskTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? {
            ...task,
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            priority: newTaskPriority,
          }
        : task
    ));

    resetForm();
    setEditingTask(null);
    setShowAddModal(false);
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setTasks(prev => prev.filter(task => task.id !== taskId))
        }
      ]
    );
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || '');
    setNewTaskPriority(task.priority);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setEditingTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  const renderTask = ({ item }: { item: Task }) => (
    <View style={[styles.taskCard, item.completed && styles.completedTask]}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => toggleTaskComplete(item.id)}
      >
        <View style={styles.taskLeft}>
          <TouchableOpacity
            style={[styles.checkbox, item.completed && styles.checkedBox]}
            onPress={() => toggleTaskComplete(item.id)}
          >
            {item.completed && (
              <MaterialIcons name="check" size={16} color="#ffffff" />
            )}
          </TouchableOpacity>
          <View style={styles.taskText}>
            <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={[styles.taskDescription, item.completed && styles.completedText]}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.taskRight}>
          <View 
            style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} 
          />
        </View>
      </TouchableOpacity>
      
      <View style={styles.taskActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => editTask(item)}
        >
          <MaterialIcons name="edit" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteTask(item.id)}
        >
          <MaterialIcons name="delete" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0A2647', '#144272', '#205295']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A2647" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tasks</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialIcons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCount - completedCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.activeFilter]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'completed' && styles.activeFilter]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        {isLoaded ? (
          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            style={styles.taskList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="assignment" size={64} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.emptyText}>No tasks found</Text>
                <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.loadingState}>
            <MaterialIcons name="hourglass-empty" size={48} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        )}

        {/* Add/Edit Task Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.taskModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}>
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  placeholder="Enter task title..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={newTaskDescription}
                  onChangeText={setNewTaskDescription}
                  placeholder="Enter task description..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.priorityOptions}>
                  {(['low', 'medium', 'high'] as const).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        newTaskPriority === priority && styles.selectedPriority,
                        { borderColor: getPriorityColor(priority) }
                      ]}
                      onPress={() => setNewTaskPriority(priority)}
                    >
                      <View 
                        style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} 
                      />
                      <Text style={styles.priorityText}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={editingTask ? updateTask : addTask}
                >
                  <Text style={styles.saveButtonText}>
                    {editingTask ? 'Update' : 'Add Task'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    paddingBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    padding: 8,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  completedTask: {
    opacity: 0.6,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskText: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskRight: {
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  taskActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskModal: {
    backgroundColor: '#144272',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedPriority: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  priorityText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});