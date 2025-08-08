import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Translations {
  [key: string]: {
    [lang: string]: string;
  };
}

// Translation strings for content tabs
export const contentTabTranslations: Translations = {
  // Sleep Tab
  'sleep': {
    'en': 'Sleep',
    'ja': 'スリープ',
    'es': 'Dormir',
    'zh': '睡眠',
  },
  'drift_into_peaceful_dreams': {
    'en': 'Drift into peaceful dreams',
    'ja': '穏やかな夢の世界へ',
    'es': 'Sumérgete en sueños pacíficos',
    'zh': '进入宁静的梦境',
  },
  'sleepy_music': {
    'en': 'Sleepy Music',
    'ja': '眠りの音楽',
    'es': 'Música relajante',
    'zh': '催眠音乐',
  },
  'story': {
    'en': 'Story',
    'ja': 'ストーリー',
    'es': 'Historia',
    'zh': '故事',
  },
  'sleep_meditation': {
    'en': 'Sleep Meditation',
    'ja': '睡眠瞑想',
    'es': 'Meditación para dormir',
    'zh': '睡眠冥想',
  },
  'white_noise': {
    'en': 'White Noise',
    'ja': 'ホワイトノイズ',
    'es': 'Ruido blanco',
    'zh': '白噪音',
  },

  // Relax Tab
  'relax': {
    'en': 'Relax',
    'ja': 'リラックス',
    'es': 'Relajar',
    'zh': '放松',
  },
  'unwind_and_let_go': {
    'en': 'Unwind and let go of stress',
    'ja': 'リラックスしてストレスを解放',
    'es': 'Relájate y libera el estrés',
    'zh': '放松身心，释放压力',
  },
  'quick_activities': {
    'en': 'Quick Activities',
    'ja': 'クイックアクティビティ',
    'es': 'Actividades rápidas',
    'zh': '快速活动',
  },
  'breathing': {
    'en': 'Breathing',
    'ja': '呼吸法',
    'es': 'Respiración',
    'zh': '呼吸',
  },
  'stretching': {
    'en': 'Stretching',
    'ja': 'ストレッチ',
    'es': 'Estiramiento',
    'zh': '伸展',
  },
  'calming_sounds': {
    'en': 'Calming Sounds',
    'ja': '癒しの音',
    'es': 'Sonidos relajantes',
    'zh': '平静音效',
  },
  'guided_relaxation': {
    'en': 'Guided Relaxation',
    'ja': 'ガイド付きリラクゼーション',
    'es': 'Relajación guiada',
    'zh': '引导放松',
  },

  // Focus Tab
  'focus': {
    'en': 'Focus',
    'ja': 'フォーカス',
    'es': 'Concentración',
    'zh': '专注',
  },
  'enhance_concentration': {
    'en': 'Enhance your concentration and productivity',
    'ja': '集中力と生産性を向上させる',
    'es': 'Mejora tu concentración y productividad',
    'zh': '提升专注力和生产力',
  },
  'productivity_tools': {
    'en': 'Productivity Tools',
    'ja': '生産性ツール',
    'es': 'Herramientas de productividad',
    'zh': '生产力工具',
  },
  'pomodoro_timer': {
    'en': 'Pomodoro Timer',
    'ja': 'ポモドーロタイマー',
    'es': 'Temporizador Pomodoro',
    'zh': '番茄钟',
  },
  'tasks': {
    'en': 'Tasks',
    'ja': 'タスク',
    'es': 'Tareas',
    'zh': '任务',
  },
  'journal': {
    'en': 'Journal',
    'ja': '日記',
    'es': 'Diario',
    'zh': '日记',
  },
  'work_music': {
    'en': 'Work Music',
    'ja': 'ワークミュージック',
    'es': 'Música de trabajo',
    'zh': '工作音乐',
  },
  'quick_meditation': {
    'en': 'Quick Meditation',
    'ja': 'クイック瞑想',
    'es': 'Meditación rápida',
    'zh': '快速冥想',
  },
};

// Translation strings for additional screens (breathing, journal, pomodoro, stretching, tasks)
export const additionalScreenTranslations: Translations = {
  // Breathing Exercise Screen
  'breathing_exercise': {
    'en': 'Breathing Exercise',
    'ja': '呼吸エクササイズ',
    'es': 'Ejercicio de respiración',
    'zh': '呼吸练习',
  },
  'cycles': {
    'en': 'Cycles',
    'ja': 'サイクル',
    'es': 'Ciclos',
    'zh': '周期',
  },
  'pattern': {
    'en': 'Pattern',
    'ja': 'パターン',
    'es': 'Patrón',
    'zh': '模式',
  },
  'speed': {
    'en': 'Speed',
    'ja': '速度',
    'es': 'Velocidad',
    'zh': '速度',
  },
  'inhale': {
    'en': 'Inhale',
    'ja': '吸う',
    'es': 'Inhalar',
    'zh': '吸气',
  },
  'hold': {
    'en': 'Hold',
    'ja': 'ホールド',
    'es': 'Mantener',
    'zh': '屏气',
  },
  'exhale': {
    'en': 'Exhale',
    'ja': '吐く',
    'es': 'Exhalar',
    'zh': '呼气',
  },
  'breathe_in_slowly': {
    'en': 'Breathe in slowly',
    'ja': 'ゆっくりと息を吸う',
    'es': 'Inhala lentamente',
    'zh': '慢慢吸气',
  },
  'hold_your_breath': {
    'en': 'Hold your breath',
    'ja': '息を止める',
    'es': 'Mantén la respiración',
    'zh': '屏住呼吸',
  },
  'breathe_out_slowly': {
    'en': 'Breathe out slowly',
    'ja': 'ゆっくりと息を吐く',
    'es': 'Exhala lentamente',
    'zh': '慢慢呼气',
  },
  'pause': {
    'en': 'Pause',
    'ja': '一時停止',
    'es': 'Pausar',
    'zh': '暂停',
  },
  'start': {
    'en': 'Start',
    'ja': 'スタート',
    'es': 'Iniciar',
    'zh': '开始',
  },
  'settings': {
    'en': 'Settings',
    'ja': '設定',
    'es': 'Configuración',
    'zh': '设置',
  },
  'breathing_pattern': {
    'en': 'Breathing Pattern',
    'ja': '呼吸パターン',
    'es': 'Patrón de respiración',
    'zh': '呼吸模式',
  },
  'speed_bps': {
    'en': 'Speed (BPS)',
    'ja': '速度 (BPS)',
    'es': 'Velocidad (BPS)',
    'zh': '速度 (BPS)',
  },
  's_remaining': {
    'en': 's remaining',
    'ja': '秒残り',
    'es': 's restantes',
    'zh': '秒剩余',
  },

  // Journal Screen
  'journal': {
    'en': 'Journal',
    'ja': '日記',
    'es': 'Diario',
    'zh': '日记',
  },
  'words': {
    'en': 'words',
    'ja': '単語',
    'es': 'palabras',
    'zh': '字',
  },
  'saved': {
    'en': 'Saved',
    'ja': '保存済み',
    'es': 'Guardado',
    'zh': '已保存',
  },
  'saving': {
    'en': 'Saving...',
    'ja': '保存中...',
    'es': 'Guardando...',
    'zh': '保存中...',
  },
  'whats_on_your_mind_today': {
    'en': "What's on your mind today?",
    'ja': '今日はどんな気分ですか？',
    'es': '¿Qué tienes en mente hoy?',
    'zh': '今天你在想什么？',
  },
  'save': {
    'en': 'Save',
    'ja': '保存',
    'es': 'Guardar',
    'zh': '保存',
  },
  'delete_entry': {
    'en': 'Delete Entry',
    'ja': 'エントリを削除',
    'es': 'Eliminar entrada',
    'zh': '删除条目',
  },
  'are_you_sure_delete_journal': {
    'en': 'Are you sure you want to delete this journal entry?',
    'ja': 'この日記エントリを削除しますか？',
    'es': '¿Estás seguro de que quieres eliminar esta entrada del diario?',
    'zh': '您确定要删除此日记条目吗？',
  },
  'recent_entries': {
    'en': 'Recent Entries',
    'ja': '最近のエントリ',
    'es': 'Entradas recientes',
    'zh': '最近条目',
  },
  'no_journal_entries_yet': {
    'en': 'No journal entries yet',
    'ja': 'まだ日記エントリがありません',
    'es': 'Aún no hay entradas de diario',
    'zh': '还没有日记条目',
  },
  'no_entry': {
    'en': 'No Entry',
    'ja': 'エントリなし',
    'es': 'Sin entrada',
    'zh': '无条目',
  },
  'no_entry_to_delete': {
    'en': 'There is no entry for this date to delete.',
    'ja': 'この日付の削除するエントリがありません。',
    'es': 'No hay entrada para esta fecha para eliminar.',
    'zh': '此日期没有要删除的条目。',
  },
  'your_journal_saved': {
    'en': 'Your journal entry has been saved.',
    'ja': '日記エントリが保存されました。',
    'es': 'Tu entrada de diario ha sido guardada.',
    'zh': '您的日记条目已保存。',
  },

  // Pomodoro Timer Screen
  'pomodoro_timer': {
    'en': 'Pomodoro Timer',
    'ja': 'ポモドーロタイマー',
    'es': 'Temporizador Pomodoro',
    'zh': '番茄钟',
  },
  'work': {
    'en': 'Work',
    'ja': 'ワーク',
    'es': 'Trabajo',
    'zh': '工作',
  },
  'break': {
    'en': 'Break',
    'ja': '休憩',
    'es': 'Descanso',
    'zh': '休息',
  },
  'completed': {
    'en': 'Completed',
    'ja': '完了',
    'es': 'Completado',
    'zh': '完成',
  },
  'pomodoros': {
    'en': 'Pomodoros',
    'ja': 'ポモドーロ',
    'es': 'Pomodoros',
    'zh': '番茄',
  },
  'work_session_complete': {
    'en': 'Work Session Complete! 🎉',
    'ja': 'ワークセッション完了！🎉',
    'es': '¡Sesión de trabajo completada! 🎉',
    'zh': '工作时段完成！🎉',
  },
  'time_for_break': {
    'en': 'Time for a break. Take a moment to relax.',
    'ja': '休憩時間です。リラックスしてください。',
    'es': 'Es hora de un descanso. Tómate un momento para relajarte.',
    'zh': '休息时间到了。放松一下。',
  },
  'start_break': {
    'en': 'Start Break',
    'ja': '休憩開始',
    'es': 'Iniciar descanso',
    'zh': '开始休息',
  },
  'break_time_over': {
    'en': 'Break Time Over! 💪',
    'ja': '休憩時間終了！💪',
    'es': '¡Tiempo de descanso terminado! 💪',
    'zh': '休息时间结束！💪',
  },
  'ready_focus_next_session': {
    'en': 'Ready to focus on your next work session?',
    'ja': '次のワークセッションに集中する準備はできましたか？',
    'es': '¿Listo para concentrarte en tu próxima sesión de trabajo?',
    'zh': '准备专注于您的下一个工作时段吗？',
  },
  'not_yet': {
    'en': 'Not Yet',
    'ja': 'まだ',
    'es': 'Aún no',
    'zh': '还没有',
  },
  'focus': {
    'en': 'Focus',
    'ja': 'フォーカス',
    'es': 'Concentración',
    'zh': '专注',
  },
  'work_time_emoji': {
    'en': '🍅 Work Time',
    'ja': '🍅 ワーク時間',
    'es': '🍅 Tiempo de trabajo',
    'zh': '🍅 工作时间',
  },
  'break_time_emoji': {
    'en': '☕ Break Time',
    'ja': '☕ 休憩時間',
    'es': '☕ Tiempo de descanso',
    'zh': '☕ 休息时间',
  },
  'focus_current_task': {
    'en': 'Focus on your current task',
    'ja': '現在のタスクに集中してください',
    'es': 'Concéntrate en tu tarea actual',
    'zh': '专注于你当前的任务',
  },
  'relax_recharge': {
    'en': 'Relax and recharge yourself',
    'ja': 'リラックスして充電してください',
    'es': 'Relájate y recarga energías',
    'zh': '放松和充电',
  },
  'timer_settings': {
    'en': 'Timer Settings',
    'ja': 'タイマー設定',
    'es': 'Configuración del temporizador',
    'zh': '计时器设置',
  },
  'start_work': {
    'en': 'Start Work',
    'ja': 'ワーク開始',
    'es': 'Iniciar trabajo',
    'zh': '开始工作',
  },
  'reset': {
    'en': 'Reset',
    'ja': 'リセット',
    'es': 'Reiniciar',
    'zh': '重置',
  },
  'work_duration': {
    'en': 'Work Duration',
    'ja': 'ワーク時間',
    'es': 'Duración del trabajo',
    'zh': '工作时长',
  },
  'break_duration': {
    'en': 'Break Duration',
    'ja': '休憩時間',
    'es': 'Duración del descanso',
    'zh': '休息时长',
  },
  'minutes': {
    'en': 'minutes',
    'ja': '分',
    'es': 'minutos',
    'zh': '分钟',
  },

  // Stretching Screen
  'stretching': {
    'en': 'Stretching',
    'ja': 'ストレッチ',
    'es': 'Estiramiento',
    'zh': '伸展',
  },
  'choose_stretch': {
    'en': 'Choose your stretching routine',
    'ja': 'ストレッチルーティンを選択',
    'es': 'Elige tu rutina de estiramiento',
    'zh': '选择您的伸展例程',
  },
  'back_stretch': {
    'en': 'Back Stretch',
    'ja': '背中のストレッチ',
    'es': 'Estiramiento de espalda',
    'zh': '背部伸展',
  },
  'body_stem': {
    'en': 'Body Stem',
    'ja': 'ボディステム',
    'es': 'Cuerpo completo',
    'zh': '全身',
  },
  'chest_stretch': {
    'en': 'Chest Stretch',
    'ja': '胸のストレッチ',
    'es': 'Estiramiento de pecho',
    'zh': '胸部伸展',
  },
  'gently_stretch_back': {
    'en': 'Gently stretch your back muscles to relieve tension and improve flexibility.',
    'ja': '背中の筋肉を優しくストレッチして緊張をほぐし、柔軟性を向上させます。',
    'es': 'Estira suavemente los músculos de la espalda para aliviar la tensión y mejorar la flexibilidad.',
    'zh': '轻柔地伸展背部肌肉以缓解紧张并提高柔韧性。',
  },
  'stretch_entire_body': {
    'en': 'Stretch your entire body from head to toe for overall flexibility.',
    'ja': '頭からつま先まで全身をストレッチして、全体的な柔軟性を向上させます。',
    'es': 'Estira todo tu cuerpo de la cabeza a los pies para mejorar la flexibilidad general.',
    'zh': '从头到脚伸展整个身体，提高整体柔韧性。',
  },
  'open_chest_breathing': {
    'en': 'Open up your chest and improve breathing with this stretch.',
    'ja': '胸を開いて、このストレッチで呼吸を改善します。',
    'es': 'Abre el pecho y mejora la respiración con este estiramiento.',
    'zh': '通过这个伸展动作打开胸部并改善呼吸。',
  },

  // Tasks Screen
  'tasks': {
    'en': 'Tasks',
    'ja': 'タスク',
    'es': 'Tareas',
    'zh': '任务',
  },
  'add_task': {
    'en': 'Add Task',
    'ja': 'タスク追加',
    'es': 'Agregar tarea',
    'zh': '添加任务',
  },
  'all': {
    'en': 'All',
    'ja': 'すべて',
    'es': 'Todas',
    'zh': '全部',
  },
  'active': {
    'en': 'Active',
    'ja': 'アクティブ',
    'es': 'Activas',
    'zh': '活动',
  },
  'task_title': {
    'en': 'Task title',
    'ja': 'タスクのタイトル',
    'es': 'Título de la tarea',
    'zh': '任务标题',
  },
  'task_description': {
    'en': 'Task description (optional)',
    'ja': 'タスクの説明（オプション）',
    'es': 'Descripción de la tarea (opcional)',
    'zh': '任务描述（可选）',
  },
  'priority': {
    'en': 'Priority',
    'ja': '優先度',
    'es': 'Prioridad',
    'zh': '优先级',
  },
  'low': {
    'en': 'Low',
    'ja': '低',
    'es': 'Baja',
    'zh': '低',
  },
  'medium': {
    'en': 'Medium',
    'ja': '中',
    'es': 'Media',
    'zh': '中',
  },
  'high': {
    'en': 'High',
    'ja': '高',
    'es': 'Alta',
    'zh': '高',
  },
  'create_task': {
    'en': 'Create Task',
    'ja': 'タスク作成',
    'es': 'Crear tarea',
    'zh': '创建任务',
  },
  'update_task': {
    'en': 'Update Task',
    'ja': 'タスク更新',
    'es': 'Actualizar tarea',
    'zh': '更新任务',
  },
  'edit_task': {
    'en': 'Edit Task',
    'ja': 'タスク編集',
    'es': 'Editar tarea',
    'zh': '编辑任务',
  },
  'delete_task': {
    'en': 'Delete Task',
    'ja': 'タスク削除',
    'es': 'Eliminar tarea',
    'zh': '删除任务',
  },
  'are_you_sure_delete_task': {
    'en': 'Are you sure you want to delete this task?',
    'ja': 'このタスクを削除しますか？',
    'es': '¿Estás seguro de que quieres eliminar esta tarea?',
    'zh': '您确定要删除此任务吗？',
  },
  'no_tasks_yet': {
    'en': 'No tasks yet',
    'ja': 'まだタスクがありません',
    'es': 'Aún no hay tareas',
    'zh': '还没有任务',
  },
  'add_first_task': {
    'en': 'Add your first task to get started!',
    'ja': '最初のタスクを追加して始めましょう！',
    'es': '¡Agrega tu primera tarea para comenzar!',
    'zh': '添加您的第一个任务开始吧！',
  },
  'created': {
    'en': 'Created',
    'ja': '作成日時',
    'es': 'Creado',
    'zh': '创建时间',
  },
  'total': {
    'en': 'Total',
    'ja': '合計',
    'es': 'Total',
    'zh': '总计',
  },
  'please_enter_task_title': {
    'en': 'Please enter a task title',
    'ja': 'タスクのタイトルを入力してください',
    'es': 'Por favor ingresa un título de tarea',
    'zh': '请输入任务标题',
  },
  'failed_to_load_tasks': {
    'en': 'Failed to load tasks from storage',
    'ja': 'タスクの読み込みに失敗しました',
    'es': 'Error al cargar las tareas del almacenamiento',
    'zh': '从存储加载任务失败',
  },
  'failed_to_save_tasks': {
    'en': 'Failed to save tasks to storage',
    'ja': 'タスクの保存に失敗しました',
    'es': 'Error al guardar las tareas en el almacenamiento',
    'zh': '保存任务到存储失败',
  },
  'no_tasks_found': {
    'en': 'No tasks found',
    'ja': 'タスクが見つかりません',
    'es': 'No se encontraron tareas',
    'zh': '未找到任务',
  },
  'tap_plus_add_first_task': {
    'en': 'Tap + to add your first task',
    'ja': '+をタップして最初のタスクを追加',
    'es': 'Toca + para agregar tu primera tarea',
    'zh': '点击+添加您的第一个任务',
  },
  'loading_tasks': {
    'en': 'Loading tasks...',
    'ja': 'タスクを読み込み中...',
    'es': 'Cargando tareas...',
    'zh': '正在加载任务...',
  },
  'add_new_task': {
    'en': 'Add New Task',
    'ja': '新しいタスクを追加',
    'es': 'Agregar nueva tarea',
    'zh': '添加新任务',
  },
  'title': {
    'en': 'Title',
    'ja': 'タイトル',
    'es': 'Título',
    'zh': '标题',
  },
  'description_optional': {
    'en': 'Description (Optional)',
    'ja': '説明（オプション）',
    'es': 'Descripción (Opcional)',
    'zh': '描述（可选）',
  },
  'enter_task_title': {
    'en': 'Enter task title...',
    'ja': 'タスクのタイトルを入力...',
    'es': 'Ingresa el título de la tarea...',
    'zh': '输入任务标题...',
  },
  'enter_task_description': {
    'en': 'Enter task description...',
    'ja': 'タスクの説明を入力...',
    'es': 'Ingresa la descripción de la tarea...',
    'zh': '输入任务描述...',
  },
};

// Translation strings for profile screen
export const profileTranslations: Translations = {
  // Header
  'settings': {
    'en': 'Settings',
    'ja': '設定',
    'es': 'Configuración',
    'zh': '设置',
  },
  'customize_experience': {
    'en': 'Customize your experience',
    'ja': 'あなたの体験をカスタマイズ',
    'es': 'Personaliza tu experiencia',
    'zh': '自定义您的体验',
  },

  // Settings items
  'ui_language': {
    'en': 'UI Language',
    'ja': 'UI言語',
    'es': 'Idioma de interfaz',
    'zh': '界面语言',
  },
  'audio_language': {
    'en': 'Audio Language',
    'ja': '音声言語',
    'es': 'Idioma de audio',
    'zh': '音频语言',
  },
  'save_battery': {
    'en': 'Save Battery',
    'ja': 'バッテリー節約',
    'es': 'Ahorrar batería',
    'zh': '省电模式',
  },
  'reduce_background_activity': {
    'en': 'Reduce background activity',
    'ja': 'バックグラウンド活動を削減',
    'es': 'Reducir actividad en segundo plano',
    'zh': '减少后台活动',
  },
  'delete_cache': {
    'en': 'Delete Cache',
    'ja': 'キャッシュを削除',
    'es': 'Eliminar caché',
    'zh': '清除缓存',
  },
  'clear_all_cached_data': {
    'en': 'Clear all cached data',
    'ja': 'すべてのキャッシュデータを削除',
    'es': 'Borrar todos los datos en caché',
    'zh': '清除所有缓存数据',
  },
  'terms_and_conditions': {
    'en': 'Terms and Conditions',
    'ja': '利用規約',
    'es': 'Términos y condiciones',
    'zh': '条款和条件',
  },
  'view_terms_of_service': {
    'en': 'View our terms of service',
    'ja': '利用規約を確認',
    'es': 'Ver nuestros términos de servicio',
    'zh': '查看我们的服务条款',
  },
  'contact_support': {
    'en': 'Contact & Support',
    'ja': 'お問い合わせ・サポート',
    'es': 'Contacto y soporte',
    'zh': '联系与支持',
  },
  'get_help_and_feedback': {
    'en': 'Get help and send feedback',
    'ja': 'ヘルプの取得とフィードバック送信',
    'es': 'Obtener ayuda y enviar comentarios',
    'zh': '获取帮助并发送反馈',
  },

  // Modals
  'select_ui_language': {
    'en': 'Select UI Language',
    'ja': 'UI言語を選択',
    'es': 'Seleccionar idioma de interfaz',
    'zh': '选择界面语言',
  },
  'select_audio_languages': {
    'en': 'Select Audio Languages',
    'ja': '音声言語を選択',
    'es': 'Seleccionar idiomas de audio',
    'zh': '选择音频语言',
  },
  'choose_one_or_more': {
    'en': 'Choose one or more languages',
    'ja': '1つ以上の言語を選択',
    'es': 'Elige uno o más idiomas',
    'zh': '选择一种或多种语言',
  },
  'cancel': {
    'en': 'Cancel',
    'ja': 'キャンセル',
    'es': 'Cancelar',
    'zh': '取消',
  },
  'done': {
    'en': 'Done',
    'ja': '完了',
    'es': 'Hecho',
    'zh': '完成',
  },

  // Alerts
  'delete_cache_title': {
    'en': 'Delete Cache',
    'ja': 'キャッシュを削除',
    'es': 'Eliminar caché',
    'zh': '删除缓存',
  },
  'delete_cache_message': {
    'en': 'This will delete all cached data including downloaded audio files, thumbnails, and API responses. Are you sure?',
    'ja': 'ダウンロードした音声ファイル、サムネイル、API応答を含むすべてのキャッシュデータが削除されます。よろしいですか？',
    'es': 'Esto eliminará todos los datos en caché, incluidos archivos de audio descargados, miniaturas y respuestas de API. ¿Estás seguro?',
    'zh': '这将删除所有缓存数据，包括下载的音频文件、缩略图和API响应。您确定吗？',
  },
  'delete': {
    'en': 'Delete',
    'ja': '削除',
    'es': 'Eliminar',
    'zh': '删除',
  },
  'success': {
    'en': 'Success',
    'ja': '成功',
    'es': 'Éxito',
    'zh': '成功',
  },
  'cache_cleared_success': {
    'en': 'All cached data has been deleted successfully',
    'ja': 'すべてのキャッシュデータが正常に削除されました',
    'es': 'Se han eliminado con éxito todos los datos en caché',
    'zh': '所有缓存数据已成功删除',
  },
  'error': {
    'en': 'Error',
    'ja': 'エラー',
    'es': 'Error',
    'zh': '错误',
  },
  'failed_to_clear_cache': {
    'en': 'Failed to clear cache',
    'ja': 'キャッシュの削除に失敗しました',
    'es': 'Error al borrar la caché',
    'zh': '清除缓存失败',
  },

  // Language names
  'english': {
    'en': 'English',
    'ja': 'English',
    'es': 'English',
    'zh': 'English',
  },
  'japanese': {
    'en': '日本語',
    'ja': '日本語',
    'es': '日本語',
    'zh': '日本語',
  },
  'spanish': {
    'en': 'Español',
    'ja': 'Español',
    'es': 'Español',
    'zh': 'Español',
  },
  'chinese': {
    'en': '中文',
    'ja': '中文',
    'es': '中文',
    'zh': '中文',
  },
};

// Get current language from AsyncStorage
export const getCurrentLanguage = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem('ui_language');
    return stored || 'en'; // Default to English
  } catch (error) {
    console.error('Error getting current language:', error);
    return 'en';
  }
};

// Get translation for a key
export const getTranslation = (translations: Translations, key: string, language: string): string => {
  if (translations[key] && translations[key][language]) {
    return translations[key][language];
  }
  
  // Fallback to English
  if (translations[key] && translations[key]['en']) {
    return translations[key]['en'];
  }
  
  // Fallback to key if no translation found
  return key;
};

// Translation hook for React components
export const useTranslation = (translations: Translations) => {
  const t = (key: string, language: string) => getTranslation(translations, key, language);
  return { t };
};