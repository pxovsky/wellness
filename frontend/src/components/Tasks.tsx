import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { getTasks, addTask, updateTask, deleteTask, reorderTasks } from '../utils/storage';
import { PageHeader } from './PageHeader';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Flag, Loader2, Bell, Edit2, X, Check, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---

interface SortableTaskItemProps {
  task: Task;
  toggleTask: (task: Task) => void;
  startEditing: (task: Task) => void;
  handleDelete: (id: number) => void;
  editingTaskId: number | null;
  editingDescription: string;
  setEditingDescription: (desc: string) => void;
  cancelEditing: () => void;
  saveDescription: (id: number) => void;
  getPriorityColor: (p: number) => string;
  getPriorityLabel: (p: number) => string;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task, toggleTask, startEditing, handleDelete, editingTaskId, editingDescription, 
  setEditingDescription, cancelEditing, saveDescription, getPriorityColor, getPriorityLabel
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${
        task.is_completed
          ? 'bg-[#1c1c1e]/50 border-white/5 opacity-60'
          : 'bg-[#1c1c1e] border-white/10 hover:border-white/20'
      }`}
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400">
        <GripVertical className="w-5 h-5" />
      </div>

      <button
        onClick={() => toggleTask(task)}
        className={`flex-shrink-0 mt-0.5 transition-colors ${task.is_completed ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
      >
        {task.is_completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-600">#{task.id}</span>
          <p className={`font-medium truncate ${task.is_completed ? 'line-through text-gray-500' : 'text-white'}`}>
            {task.title}
          </p>
        </div>
        
        {editingTaskId === task.id ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-20"
              autoFocus
              placeholder="Wpisz opis..."
            />
            <div className="flex gap-2 justify-end">
              <button onClick={cancelEditing} className="p-1 text-gray-400 hover:text-white" title="Anuluj">
                <X className="w-4 h-4" />
              </button>
              <button onClick={() => saveDescription(task.id)} className="p-1 text-green-500 hover:text-green-400" title="Zapisz">
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          task.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )
        )}

        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
          {task.due_date && (
            <span className={`flex items-center gap-1 ${!task.is_completed && new Date(task.due_date) < new Date() ? 'text-red-400' : ''}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleString('pl-PL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {task.reminder_date && (
            <span className="flex items-center gap-1 text-yellow-500/80">
              <Bell className="w-3 h-3" />
              {new Date(task.reminder_date).toLocaleString('pl-PL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
            <Flag className="w-3 h-3" />
            {getPriorityLabel(task.priority)}
          </span>
        </div>
      </div>

      <div className="flex opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={() => startEditing(task)}
          className="p-2 text-gray-500 hover:text-blue-500"
          title="Edytuj opis"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleDelete(task.id)}
          className="p-2 text-gray-500 hover:text-red-500"
          title="Usuń"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const Tasks: React.FC<{ onTasksChange?: () => void }> = ({ onTasksChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<1 | 2 | 3>(1);
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskReminder, setNewTaskReminder] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [filterPriority, setFilterPriority] = useState<number>(0);

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
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority(1);
      setNewTaskDate('');
      setNewTaskReminder('');
      await loadTasks();
      onTasksChange?.();
    } catch (e) {
      console.error('Failed to add task', e);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTask = async (task: Task) => {
    // Optimistic update
    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { ...t, is_completed: t.is_completed ? 0 : 1 } : t
    );
    setTasks(updatedTasks);

    try {
      await updateTask(task.id, { is_completed: task.is_completed ? 0 : 1 });
      loadTasks(); // Reload to sort correctly
      onTasksChange?.();
    } catch (e) {
      console.error('Failed to update task', e);
      loadTasks(); // Revert on error
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Usunąć zadanie?')) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
      onTasksChange?.();
    } catch (e) {
      console.error('Failed to delete task', e);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingDescription(task.description || '');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingDescription('');
  };

  const saveDescription = async (taskId: number) => {
    try {
      await updateTask(taskId, { description: editingDescription });
      setEditingTaskId(null);
      loadTasks();
      onTasksChange?.();
    } catch (e) {
      console.error('Failed to update task description', e);
    }
  };

  const getPriorityColor = (p: number) => {
    if (p === 3) return 'text-red-500';
    if (p === 2) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getPriorityLabel = (p: number) => {
    if (p === 3) return 'Wysoki';
    if (p === 2) return 'Średni';
    return 'Niski';
  };

  const filteredTasks = tasks.filter(t => filterPriority === 0 || t.priority === filterPriority);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Wyślij nową kolejność do backendu
        const taskIds = newItems.map(t => t.id);
        reorderTasks(taskIds).catch(err => console.error("Failed to reorder", err));
        
        return newItems;
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 xl:pb-0 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <PageHeader title="Zadania" subtitle="Lista rzeczy do zrobienia" />

      {/* Formularz dodawania */}
      <form onSubmit={handleAddTask} className="bg-[#1c1c1e] p-4 rounded-xl border border-white/10 space-y-3">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Co masz do zrobienia?"
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isAdding || !newTaskTitle.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg flex items-center justify-center transition"
            >
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
            </button>
          </div>

          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Opis zadania (opcjonalnie)"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-20"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 pb-1">
          <div className="flex-1 min-w-[140px]">
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(parseInt(e.target.value) as 1 | 2 | 3)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value={1}>Priorytet: Niski</option>
              <option value={2}>Priorytet: Średni</option>
              <option value={3}>Priorytet: Wysoki</option>
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] text-gray-500 mb-1 px-1">Termin wykonania</label>
            <input
              type="datetime-local"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] text-gray-500 mb-1 px-1">Przypomnienie</label>
            <input
              type="datetime-local"
              value={newTaskReminder}
              onChange={(e) => setNewTaskReminder(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </form>

      <div className="flex justify-between items-center pt-2">
        <h3 className="text-lg font-bold text-white">Lista zadań</h3>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(parseInt(e.target.value))}
          className="bg-[#1c1c1e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
        >
          <option value={0}>Wszystkie priorytety</option>
          <option value={3}>Wysoki</option>
          <option value={2}>Średni</option>
          <option value={1}>Niski</option>
        </select>
      </div>

      {/* Lista zadań */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Ładowanie zadań...</div>
        ) : filteredTasks.length === 0 ? (
          tasks.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-[#1c1c1e] rounded-xl border border-white/5">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Wszystko zrobione! Dodaj nowe zadanie.</p>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>Brak zadań o wybranym priorytecie.</p>
            </div>
          )
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={filteredTasks.map(t => t.id)} 
              strategy={verticalListSortingStrategy}
              disabled={filterPriority !== 0} // Wyłącz sortowanie gdy aktywny filtr
            >
              {filteredTasks.map(task => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  toggleTask={toggleTask}
                  startEditing={startEditing}
                  handleDelete={handleDelete}
                  editingTaskId={editingTaskId}
                  editingDescription={editingDescription}
                  setEditingDescription={setEditingDescription}
                  cancelEditing={cancelEditing}
                  saveDescription={saveDescription}
                  getPriorityColor={getPriorityColor}
                  getPriorityLabel={getPriorityLabel}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};