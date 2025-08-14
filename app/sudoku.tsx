import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { getCurrentLanguage } from '@/utils/i18n';
import sudokuData from '@/assets/data/sudokuPuzzles.json';

type SudokuDifficulty = 'easy' | 'medium' | 'hard';

type SudokuPuzzle = {
  id: string;
  difficulty: SudokuDifficulty;
  board: number[][];
  solution: number[][];
};

type SudokuCell = {
  value: number | null;
  isFixed: boolean;
  isError?: boolean;
};

type SudokuBoard = SudokuCell[][];

// Helper functions
const getRandomPuzzle = (difficulty: SudokuDifficulty): SudokuPuzzle => {
  const puzzlesOfDifficulty = sudokuData.puzzles.filter(
    (p: any) => p.difficulty === difficulty
  );
  const randomIndex = Math.floor(Math.random() * puzzlesOfDifficulty.length);
  return puzzlesOfDifficulty[randomIndex] as SudokuPuzzle;
};

const generateBoardFromPuzzle = (puzzle: number[][]): SudokuBoard => {
  return puzzle.map(row => 
    row.map(value => ({
      value: value === 0 ? null : value,
      isFixed: value !== 0
    }))
  );
};

const checkSolution = (
  currentBoard: SudokuBoard,
  solution: number[][]
): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (currentBoard[row][col].value !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
};

export default function SudokuScreen() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<SudokuPuzzle | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadLanguage();
    startNewGame();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const loadLanguage = async () => {
    const lang = await getCurrentLanguage();
    setCurrentLanguage(lang);
  };

  const startNewGame = () => {
    const puzzle = getRandomPuzzle(difficulty);
    setCurrentPuzzle(puzzle);
    setBoard(generateBoardFromPuzzle(puzzle.board));
    setTimer(0);
    setIsPlaying(true);
    setSelectedCell(null);
  };

  const handleCellPress = (row: number, col: number) => {
    if (!board[row][col].isFixed) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num: number) => {
    if (selectedCell && !board[selectedCell.row][selectedCell.col].isFixed) {
      const newBoard = [...board];
      newBoard[selectedCell.row][selectedCell.col] = {
        ...newBoard[selectedCell.row][selectedCell.col],
        value: num,
      };
      setBoard(newBoard);
      checkForCompletion(newBoard);
    }
  };

  const handleClear = () => {
    if (selectedCell && !board[selectedCell.row][selectedCell.col].isFixed) {
      const newBoard = [...board];
      newBoard[selectedCell.row][selectedCell.col] = {
        ...newBoard[selectedCell.row][selectedCell.col],
        value: null,
      };
      setBoard(newBoard);
    }
  };

  const checkForCompletion = (currentBoard: SudokuBoard) => {
    // Check if all cells are filled
    const isFilled = currentBoard.every(row => 
      row.every(cell => cell.value !== null)
    );
    
    if (isFilled && currentPuzzle) {
      // Check if the solution is correct
      const isCorrect = checkSolution(currentBoard, currentPuzzle.solution);
      
      if (isCorrect) {
        setIsPlaying(false);
        Alert.alert(
          'Congratulations!',
          `You completed the puzzle in ${formatTime(timer)}!`,
          [{ text: 'New Game', onPress: startNewGame }]
        );
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCellStyle = (row: number, col: number) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const cell = board[row]?.[col];
    
    return [
      styles.cell,
      cell?.isFixed && styles.fixedCell,
      isSelected && styles.selectedCell,
      // Add borders for 3x3 sections
      (col + 1) % 3 === 0 && col !== 8 && styles.rightBorder,
      (row + 1) % 3 === 0 && row !== 8 && styles.bottomBorder,
    ];
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Sudoku',
          headerStyle: {
            backgroundColor: '#0A2647',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <LinearGradient
        colors={['#0A2647', '#144272', '#205295']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.timerContainer}>
            <MaterialIcons name="timer" size={20} color="#ffffff" />
            <ThemedText style={styles.timerText}>{formatTime(timer)}</ThemedText>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Difficulty Selector */}
          <View style={styles.difficultyContainer}>
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyButton,
                  difficulty === level && styles.difficultyButtonActive
                ]}
                onPress={() => {
                  setDifficulty(level);
                  startNewGame();
                }}
              >
                <ThemedText style={[
                  styles.difficultyText,
                  difficulty === level && styles.difficultyTextActive
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sudoku Board */}
          <View style={styles.board}>
            {board.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => (
                  <TouchableOpacity
                    key={`${rowIndex}-${colIndex}`}
                    style={getCellStyle(rowIndex, colIndex)}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    disabled={cell.isFixed}
                  >
                    <ThemedText style={[
                      styles.cellText,
                      cell.isFixed && styles.fixedCellText,
                      !cell.isFixed && styles.editableCellText,
                    ]}>
                      {cell.value || ''}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Number Input Pad */}
          <View style={styles.numberPad}>
            <View style={styles.numberRow}>
              {[1, 2, 3, 4, 5].map(num => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => handleNumberInput(num)}
                >
                  <ThemedText style={styles.numberButtonText}>{num}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.numberRow}>
              {[6, 7, 8, 9].map(num => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => handleNumberInput(num)}
                >
                  <ThemedText style={styles.numberButtonText}>{num}</ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.numberButton, styles.clearButton]}
                onPress={handleClear}
              >
                <MaterialIcons name="clear" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={startNewGame}
            >
              <MaterialIcons name="refresh" size={20} color="#ffffff" />
              <ThemedText style={styles.controlButtonText}>New Game</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
    </>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  timerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 10,
  },
  difficultyButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  difficultyButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#ffffff',
  },
  difficultyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  difficultyTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  board: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 5,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#ffffff',
  },
  fixedCell: {
    backgroundColor: '#f5f5f5',
  },
  selectedCell: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  rightBorder: {
    borderRightWidth: 2,
    borderRightColor: '#333',
  },
  bottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fixedCellText: {
    color: '#333',
  },
  editableCellText: {
    color: '#2196F3',
  },
  numberPad: {
    marginTop: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
    gap: 8,
  },
  numberButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 100, 100, 0.3)',
  },
  numberButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 15,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});