import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { getTasks, addTask, updateTask, deleteTask, reorderTasks } from '../utils/storage';
import { PageHeader } from './PageHeader';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Flag, Loader2, Edit2, X, GripVertical, Table, List, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Search, CalendarClock, Tag, Pin, Bell } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Helpers ---

const getTagColor = (tag: string) => {
  const colors = [
    'bg-red-500/10 text-red-400 border-red-500/20',
    'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'bg-lime-500/10 text-lime-400 border-lime-500/20',
    'bg-green-500/10 text-green-400 border-green-500/20',
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'bg-rose-500/10 text-rose-400 border-rose-500/20',
  ];
  
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getPriorityColor = (p: number) => {
  if (p === 3) return 'text-red-500';
  if (p === 2) return 'text-yellow-500';
  return 'text-teal-500';
};

const getPriorityLabel = (p: number) => {
  if (p === 3) return 'Wysoki';
  if (p === 2) return 'Średni';
  return 'Niski';
};

const toLocalISO = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
};

const formatForInput = (isoString?: string) => {
  if (!isoString) return '';
  return isoString.slice(0, 16);
};

// --- Sortable Item Component ---

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, data: Partial<Task>) => void;
  onDelete: (id: number) => void;
  dragHandleProps?: any;
  style?: React.CSSProperties;
  setNodeRef?: (node: HTMLElement | null) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task, onUpdate, onDelete, dragHandleProps, style, setNodeRef
}) => {
  const [editingField, setEditingField] = useState<'title' | 'description' | 'tags' | null>(null);
  const [tempValue, setTempValue] = useState('');

  const startEditing = (field: 'title' | 'description' | 'tags', value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const saveEdit = () => {
    if (!editingField) return;
    
    const updates: Partial<Task> = {};
    if (editingField === 'title' && tempValue.trim() !== task.title) updates.title = tempValue;
    if (editingField === 'description' && tempValue.trim() !== (task.description || '')) updates.description = tempValue;
    if (editingField === 'tags' && tempValue.trim() !== (task.tags || '')) updates.tags = tempValue;

    if (Object.keys(updates).length > 0) {
      onUpdate(task.id, updates);
    }
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingField !== 'description') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const togglePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPriority = (task.priority % 3) + 1;
    onUpdate(task.id, { priority: nextPriority as 1 | 2 | 3 });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${
        task.is_completed
          ? 'bg-[#1c1c1e]/50 border-white/5 opacity-60'
          : task.is_pinned
            ? 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40'
            : 'bg-[#1c1c1e] border-white/10 hover:border-white/20'
      }`}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <div {...dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400">
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      <button
        onClick={() => onUpdate(task.id, { is_completed: task.is_completed ? 0 : 1 })}
        className={`flex-shrink-0 mt-0.5 transition-colors ${task.is_completed ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
      >
        {task.is_completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-600">#{task.id}</span>
          {editingField === 'title' ? (
            <input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:border-teal-500 flex-1 min-w-0"
              autoFocus
            />
          ) : (
            <p 
              onClick={() => startEditing('title', task.title)}
              className={`font-medium truncate cursor-text hover:text-teal-400 transition-colors ${task.is_completed ? 'line-through text-gray-500' : 'text-white'}`}
              title="Kliknij, aby edytować tytuł"
            >
              {task.title}
            </p>
          )}
        </div>
        
        {/* Description */}
        {editingField === 'description' ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => { if(e.key === 'Escape') cancelEdit(); }}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 resize-none h-20 mt-1"
            autoFocus
            placeholder="Wpisz opis..."
          />
        ) : (
          <p 
            onClick={() => startEditing('description', task.description || '')}
            className={`text-sm cursor-text hover:text-gray-300 transition-colors mt-1 line-clamp-2 ${task.description ? 'text-gray-400' : 'text-gray-600 italic'}`}
            title="Kliknij, aby edytować opis"
          >
            {task.description || 'Dodaj opis...'}
          </p>
        )}

        {/* Tags */}
        {editingField === 'tags' ? (
           <input
             value={tempValue}
             onChange={(e) => setTempValue(e.target.value)}
             onBlur={saveEdit}
             onKeyDown={handleKeyDown}
             className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500 mt-1"
             autoFocus
             placeholder="Tagi (po przecinku)"
           />
        ) : (
          <div 
            className="flex flex-wrap gap-1 min-h-[20px] items-center cursor-pointer group/tags mt-1"
            onClick={() => startEditing('tags', task.tags || '')}
            title="Kliknij, aby edytować tagi"
          >
            {task.tags ? (
              task.tags.split(',').filter(Boolean).map((tag, i) => (
                <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${getTagColor(tag.trim())}`}>
                  {tag.trim()}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-gray-600 opacity-0 group-hover/tags:opacity-100 transition-opacity flex items-center gap-1">
                <Tag className="w-3 h-3" /> Dodaj tagi
              </span>
            )}
          </div>
        )}

        {/* Meta: Date, Reminder, Priority */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
          {/* Date Picker */}
          <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer relative group/date">
            <Calendar className="w-3 h-3" />
            <input
              type="datetime-local"
              value={formatForInput(task.due_date)}
              onChange={(e) => onUpdate(task.id, { due_date: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Zmień datę"
            />
            <span className={`${!task.is_completed && task.due_date && new Date(task.due_date) < new Date() ? 'text-red-400' : ''}`}>
              {task.due_date ? new Date(task.due_date).toLocaleString('pl-PL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ustaw termin'}
            </span>
          </div>

          {/* Reminder Picker */}
          <div className={`flex items-center gap-1 hover:text-white transition-colors cursor-pointer relative group/reminder ${task.reminder_date ? 'text-teal-400' : 'text-gray-500'}`}>
            <Bell className="w-3 h-3" />
            <input
              type="datetime-local"
              value={formatForInput(task.reminder_date)}
              onChange={(e) => onUpdate(task.id, { reminder_date: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Ustaw przypomnienie"
            />
            <span>
              {task.reminder_date ? new Date(task.reminder_date).toLocaleString('pl-PL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '+Alert'}
            </span>
          </div>

          {/* Priority Toggle */}
          <button 
            onClick={togglePriority}
            className={`flex items-center gap-1 hover:opacity-80 transition-opacity ${getPriorityColor(task.priority)}`}
            title="Kliknij aby zmienić priorytet"
          >
            <Flag className="w-3 h-3" />
            {getPriorityLabel(task.priority)}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={() => onUpdate(task.id, { is_pinned: task.is_pinned ? 0 : 1 })}
          className={`p-1.5 hover:text-white rounded-md hover:bg-white/10 ${task.is_pinned ? 'text-purple-400' : 'text-gray-500'}`}
          title={task.is_pinned ? "Odepnij" : "Przypnij"}
        >
          <Pin className={`w-4 h-4 ${task.is_pinned ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-gray-500 hover:text-red-500 rounded-md hover:bg-white/10"
          title="Usuń"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const SortableTaskItem: React.FC<TaskItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return <TaskItem {...props} dragHandleProps={{ ...attributes, ...listeners }} style={style} setNodeRef={setNodeRef} />;
};

export const Tasks: React.FC<{ onTasksChange?: () => void }> = ({ onTasksChange }) => {
  const getInitialDefaults = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);

    const defaultDue = toLocalISO(now);

    const reminder = new Date(now);
    reminder.setDate(reminder.getDate() - 1);
    reminder.setHours(20, 0, 0, 0);
    const defaultReminder = toLocalISO(reminder);

    return { defaultDue, defaultReminder };
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<1 | 2 | 3>(1);
  const [newTaskDate, setNewTaskDate] = useState(() => getInitialDefaults().defaultDue);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskReminder, setNewTaskReminder] = useState(() => getInitialDefaults().defaultReminder);
  const [newTaskTags, setNewTaskTags] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // State for Table View (Backlog) - kept for compatibility
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingTags, setEditingTags] = useState('');

  const [filterPriority, setFilterPriority] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isGrouped, setIsGrouped] = useState(true);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (e) {
      console.error('Failed to load tasks', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterPriority, viewMode, searchQuery]);

  const handleTaskUpdate = async (taskId: number, updates: Partial<Task>) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    try {
      await updateTask(taskId, updates);
      onTasksChange?.();
    } catch (e) {
      console.error('Failed to update task', e);
      loadTasks(); // Revert on error
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAdding(true);
    try {
      await addTask({
        title: newTaskTitle,
        priority: newTaskPriority,
        description: newTaskDescription,
        due_date: newTaskDate || undefined,
        reminder_date: newTaskReminder || undefined,
        tags: newTaskTags,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority(1);
      const defaults = getInitialDefaults();
      setNewTaskDate(defaults.defaultDue);
      setNewTaskReminder(defaults.defaultReminder);
      setNewTaskTags('');
      await loadTasks();
      onTasksChange?.();
      setIsAddModalOpen(false);
    } catch (e) {
      console.error('Failed to add task', e);
    } finally {
      setIsAdding(false);
    }
  };

  // Legacy handlers for Table View
  const toggleTask = async (task: Task) => handleTaskUpdate(task.id, { is_completed: task.is_completed ? 0 : 1 });
  const togglePin = async (task: Task) => handleTaskUpdate(task.id, { is_pinned: task.is_pinned ? 0 : 1 });
  
  const handleDelete = async (id: number) => {
    setDeletingTaskId(id);
  };

  const confirmDelete = async () => {
    if (deletingTaskId === null) return;
    try {
      await deleteTask(deletingTaskId);
      setTasks(tasks.filter(t => t.id !== deletingTaskId));
      onTasksChange?.();
    } catch (e) {
      console.error('Failed to delete task', e);
    } finally {
      setDeletingTaskId(null);
    }
  };

  // Legacy editing for Table View
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description || '');
    setEditingTags(task.tags || '');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTitle('');
    setEditingDescription('');
    setEditingTags('');
  };

  const saveDescription = async (taskId: number) => {
    try {
      await updateTask(taskId, { title: editingTitle, description: editingDescription, tags: editingTags });
      setEditingTaskId(null);
      loadTasks();
      onTasksChange?.();
    } catch (e) {
      console.error('Failed to update task description', e);
    }
  };

  const handleDateChange = async (taskId: number, newDate: string) => handleTaskUpdate(taskId, { due_date: newDate });
  const handlePriorityChange = async (taskId: number, newPriority: 1 | 2 | 3) => handleTaskUpdate(taskId, { priority: newPriority });

  const allTags = React.useMemo(() => {
    const tagsMap = new Map<string, number>();
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(tag => {
          tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
        });
      }
    });
    return Array.from(tagsMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const availableTags = React.useMemo(() => allTags.map(([t]) => t), [allTags]);

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        const currentTags = newTaskTags.split(',').map(t => t.trim()).filter(Boolean);
        const newTag = tagInput.trim();
        if (!currentTags.includes(newTag)) {
          setNewTaskTags(currentTags.length > 0 ? `${currentTags.join(', ')}, ${newTag}` : newTag);
        }
        setTagInput('');
      }
    }
  };

  const addTag = (tag: string) => {
    const currentTags = newTaskTags.split(',').map(t => t.trim()).filter(Boolean);
    if (!currentTags.includes(tag)) {
      setNewTaskTags(currentTags.length > 0 ? `${currentTags.join(', ')}, ${tag}` : tag);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = newTaskTags.split(',').map(t => t.trim()).filter(Boolean);
    setNewTaskTags(currentTags.filter(t => t !== tagToRemove).join(', '));
  };

  const filteredTasks = React.useMemo(() => tasks.filter(t => {
    const matchesPriority = filterPriority === 0 || t.priority === filterPriority;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = t.tags ? t.tags.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSelectedTag = selectedTag ? t.tags && t.tags.split(',').map(tag => tag.trim()).includes(selectedTag) : true;
    return matchesPriority && (matchesSearch || matchesTags) && matchesSelectedTag;
  }), [tasks, filterPriority, searchQuery, selectedTag]);

  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = React.useMemo(() => {
    let sortableItems = [...filteredTasks];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const pinA = a.is_pinned || 0;
        const pinB = b.is_pinned || 0;
        if (pinA !== pinB) return pinB - pinA;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      sortableItems.sort((a, b) => (b.is_pinned || 0) - (a.is_pinned || 0));
    }
    return sortableItems;
  }, [filteredTasks, sortConfig]);

  const groupedTasks = React.useMemo(() => {
    if (!isGrouped) return null;

    const groups = {
      pinned: [] as Task[],
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      upcoming: [] as Task[],
      noDate: [] as Task[],
      completed: [] as Task[]
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    filteredTasks.forEach(t => {
      if (t.is_completed) {
        groups.completed.push(t);
        return;
      }
      if (t.is_pinned) {
        groups.pinned.push(t);
        return;
      }

      if (!t.due_date) {
        groups.noDate.push(t);
        return;
      }
      const d = new Date(t.due_date);
      d.setHours(0, 0, 0, 0);

      if (d < now) groups.overdue.push(t);
      else if (d.getTime() === now.getTime()) groups.today.push(t);
      else if (d.getTime() === tomorrow.getTime()) groups.tomorrow.push(t);
      else groups.upcoming.push(t);
    });

    return groups;
  }, [filteredTasks, isGrouped]);

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const paginatedTasks = sortedTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const taskIds = newItems.map(t => t.id);
        reorderTasks(taskIds).catch(err => console.error("Failed to reorder", err));
        
        return newItems;
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPriority(0);
    setSelectedTag(null);
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-7xl">
      <PageHeader title="Zadania" subtitle="Lista rzeczy do zrobienia" />

      {/* Top Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition shadow-lg shadow-teal-900/20"
        >
          <Plus className="w-5 h-5" />
          Dodaj zadanie
        </button>
        
        <div className="flex items-center gap-2 w-full xl:w-auto flex-wrap xl:flex-nowrap">
          <div className="relative w-full xl:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Szukaj..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1c1c1e] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500 w-full xl:w-48"
            />
          </div>

          <div className="flex bg-[#1c1c1e] rounded-lg p-1 border border-white/10">
            <button
              onClick={() => { setViewMode('list'); setIsGrouped(true); }}
              className={`p-1.5 rounded-md transition ${viewMode === 'list' && isGrouped ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Grupuj wg daty"
            >
              <CalendarClock className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setViewMode('list'); setIsGrouped(false); }}
              className={`p-1.5 rounded-md transition ${viewMode === 'list' && !isGrouped ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Widok listy"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Widok tabeli (Backlog)"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(parseInt(e.target.value))}
            className="bg-[#1c1c1e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500 flex-1 xl:flex-none"
          >
            <option value={0}>Priorytet: Wszystkie</option>
            <option value={3}>Wysoki</option>
            <option value={2}>Średni</option>
            <option value={1}>Niski</option>
          </select>

          <select
            value={selectedTag || ''}
            onChange={(e) => setSelectedTag(e.target.value || null)}
            className="bg-[#1c1c1e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500 flex-1 xl:flex-none max-w-[150px]"
          >
            <option value="">Tagi: Wszystkie</option>
            {allTags.map(([tag, count]) => (
              <option key={tag} value={tag}>{tag} ({count})</option>
            ))}
          </select>

          {(searchQuery || filterPriority !== 0 || selectedTag) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition border border-red-400/20"
            >
              <X className="w-3 h-3" />
              Wyczyść
            </button>
          )}
        </div>
      </div>

      {/* Lista zadań */}
      <div className="space-y-2 pb-20 xl:pb-0">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Ładowanie zadań...</div>
        ) : filteredTasks.length === 0 ? (
          tasks.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-[#1c1c1e] rounded-xl border border-white/5">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Wszystko zrobione! Dodaj nowe zadanie.</p>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 bg-[#1c1c1e] rounded-xl border border-white/5">
              <p>Brak zadań spełniających kryteria.</p>
            </div>
          )
        ) : viewMode === 'list' && isGrouped && groupedTasks ? (
          <div className="space-y-6">
            {[
              { id: 'pinned', label: 'Przypięte', items: groupedTasks.pinned, color: 'text-purple-400' },
              { id: 'overdue', label: 'Zaległe', items: groupedTasks.overdue, color: 'text-red-400' },
              { id: 'today', label: 'Dziś', items: groupedTasks.today, color: 'text-teal-400' },
              { id: 'tomorrow', label: 'Jutro', items: groupedTasks.tomorrow, color: 'text-yellow-400' },
              { id: 'upcoming', label: 'Nadchodzące', items: groupedTasks.upcoming, color: 'text-green-400' },
              { id: 'noDate', label: 'Bez terminu', items: groupedTasks.noDate, color: 'text-gray-400' },
              { id: 'completed', label: 'Zakończone', items: groupedTasks.completed, color: 'text-gray-500' },
            ].map(group => (
              group.items.length > 0 && (
                <div key={group.id}>
                  <h4 className={`text-xs font-bold mb-3 uppercase tracking-wider ${group.color} flex items-center gap-2`}>
                    {group.label} <span className="text-white/50 font-normal ml-1">({group.items.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {group.items.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sortedTasks.map(t => t.id)} 
              strategy={verticalListSortingStrategy}
              disabled={filterPriority !== 0 || sortConfig !== null}
            >
              {sortedTasks.map(task => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="bg-[#1c1c1e] rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase text-gray-400 font-medium">
                  <tr>
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 w-12 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('is_completed')}>
                      <div className="flex items-center gap-1">
                        Status
                        {sortConfig?.key === 'is_completed' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-3 w-16 text-center text-gray-500">ID</th>
                    <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-1">
                        Zadanie
                        {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-3 w-32 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('priority')}>
                      <div className="flex items-center gap-1">
                        Priorytet
                        {sortConfig?.key === 'priority' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-3 w-40 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('due_date')}>
                      <div className="flex items-center gap-1">
                        Termin
                        {sortConfig?.key === 'due_date' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-4 py-3 w-24 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedTasks.map(task => (
                    <tr key={task.id} className={`hover:bg-white/5 transition group ${task.is_pinned ? 'bg-purple-500/5' : ''}`}>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePin(task)}
                          className={`transition-colors ${task.is_pinned ? 'text-purple-400' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                          <Pin className={`w-4 h-4 ${task.is_pinned ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleTask(task)}
                          className={`transition-colors ${task.is_completed ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
                        >
                          {task.is_completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-gray-600">
                        #{task.id}
                      </td>
                      <td className="px-4 py-3">
                        {editingTaskId === task.id ? (
                          <div className="space-y-2 min-w-[200px]">
                            <input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-teal-500"
                              autoFocus
                              placeholder="Tytuł"
                            />
                            <textarea
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500 resize-none h-16"
                              placeholder="Opis..."
                            />
                            <input
                              value={editingTags}
                              onChange={(e) => setEditingTags(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                              placeholder="Tagi..."
                            />
                            <div className="flex gap-2">
                               <button onClick={() => saveDescription(task.id)} className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded hover:bg-green-600/30">Zapisz</button>
                               <button onClick={cancelEditing} className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded hover:bg-white/20">Anuluj</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : 'text-white'}`}>
                              {task.title}
                            </span>
                            {task.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{task.description}</p>}
                            {task.tags && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {task.tags.split(',').filter(Boolean).map((tag, i) => (
                                  <button
                                    key={i}
                                    onClick={() => startEditing(task)}
                                    className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer ${getTagColor(tag.trim())}`}
                                    title="Kliknij, aby edytować"
                                  >
                                    <Tag className="w-2.5 h-2.5" /> {tag.trim()}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative w-fit">
                          <select
                            value={task.priority}
                            onChange={(e) => handlePriorityChange(task.id, parseInt(e.target.value) as 1 | 2 | 3)}
                            className={`appearance-none pl-7 pr-6 py-1 rounded-md text-xs font-medium bg-white/5 border border-transparent hover:bg-white/10 focus:border-teal-500 focus:outline-none cursor-pointer ${getPriorityColor(task.priority)}`}
                          >
                            <option value={1} className="bg-[#1c1c1e] text-blue-500">Niski</option>
                            <option value={2} className="bg-[#1c1c1e] text-yellow-500">Średni</option>
                            <option value={3} className="bg-[#1c1c1e] text-red-500">Wysoki</option>
                          </select>
                          <Flag className={`w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${getPriorityColor(task.priority)}`} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        <div className="flex flex-col gap-1">
                          <input
                            type="datetime-local"
                            value={formatForInput(task.due_date)}
                            onChange={(e) => handleDateChange(task.id, e.target.value)}
                            className={`bg-transparent border border-transparent hover:border-white/10 rounded px-1 py-0.5 text-xs focus:bg-[#2c2c2e] focus:border-teal-500 focus:outline-none transition-colors w-full ${
                              !task.is_completed && task.due_date && new Date(task.due_date) < new Date() ? 'text-red-400' : 'text-gray-400'
                            }`}
                            title="Termin wykonania"
                          />
                          <div className="flex items-center gap-1">
                            <Bell className={`w-3 h-3 ${task.reminder_date ? 'text-teal-500' : 'text-gray-600'}`} />
                            <input
                              type="datetime-local"
                              value={formatForInput(task.reminder_date)}
                              onChange={(e) => handleTaskUpdate(task.id, { reminder_date: e.target.value })}
                              className={`bg-transparent border border-transparent hover:border-white/10 rounded px-1 py-0.5 text-[10px] focus:bg-[#2c2c2e] focus:border-teal-500 focus:outline-none transition-colors w-full ${task.reminder_date ? 'text-teal-400' : 'text-gray-600'}`}
                              title="Przypomnienie"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingTaskId !== task.id && (
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditing(task)} className="p-1.5 text-gray-400 hover:text-teal-500 rounded-md hover:bg-white/10">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(task.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-white/10">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-white/10">
                <span className="text-xs text-gray-500">
                  Strona {currentPage} z {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTaskId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-2">Usunąć zadanie?</h3>
            <p className="text-gray-400 text-sm mb-6">Tej operacji nie można cofnąć.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingTaskId(null)}
                className="flex-1 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white rounded-lg font-medium transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Nowe zadanie</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tytuł</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Co masz do zrobienia?"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Opis</label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Szczegóły zadania..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Termin</label>
                  <input
                    type="datetime-local"
                    value={newTaskDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTaskDate(val);
                      if (val) {
                        const d = new Date(val);
                        const reminder = new Date(d);
                        reminder.setDate(reminder.getDate() - 1);
                        reminder.setHours(20, 0, 0, 0);
                        setNewTaskReminder(toLocalISO(reminder));
                      } else {
                        setNewTaskReminder('');
                      }
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Przypomnienie</label>
                  <input
                    type="datetime-local"
                    value={newTaskReminder}
                    onChange={(e) => setNewTaskReminder(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priorytet</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(parseInt(e.target.value) as 1 | 2 | 3)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500"
                  >
                    <option value={1}>Niski</option>
                    <option value={2}>Średni</option>
                    <option value={3}>Wysoki</option>
                  </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tagi</label>
                <div className="relative">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newTaskTags.split(',').filter(Boolean).map(tag => (
                      <span key={tag} className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${getTagColor(tag.trim())}`}>
                        {tag.trim()}
                        <button type="button" onClick={() => removeTag(tag.trim())} className="hover:text-white"><X className="w-3 h-3"/></button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
                    onKeyDown={handleTagInputKeyDown}
                    onFocus={() => setShowTagSuggestions(true)}
                    placeholder="Wpisz tag i naciśnij Enter lub wybierz z listy..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-teal-500"
                  />
                  {showTagSuggestions && (tagInput || availableTags.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-[#252528] border border-white/10 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                      {availableTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !newTaskTags.includes(t)).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                        >
                          {tag}
                        </button>
                      ))}
                      {availableTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !newTaskTags.includes(t)).length === 0 && tagInput && (
                         <div className="px-3 py-2 text-xs text-gray-500 italic">Naciśnij Enter aby dodać "{tagInput}"</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAdding || !newTaskTitle.trim()}
                  className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Zapisz Zadanie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
