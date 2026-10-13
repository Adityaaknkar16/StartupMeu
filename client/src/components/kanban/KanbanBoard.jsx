import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';
import TaskFilterBar from './TaskFilterBar';
import { BoardSkeleton } from '../common/SkeletonLoader';
import ErrorRetry from '../common/ErrorRetry';
import { useProjects } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import { MESSAGES } from '../../constants/messages';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

export const KanbanBoard = ({ searchInputRef, isCreateModalOpen, setIsCreateModalOpen }) => {
  const { activeProject, boardVersion, refreshBoard } = useProjects();
  const { showSuccess, showError, showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');

  // Modals state
  const [editingTask, setEditingTask] = useState(null);
  const [modalColumn, setModalColumn] = useState('todo');

  const fetchTasks = useCallback(async () => {
    if (!activeProject?._id) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      const params = {};
      if (search) params.search = search;
      if (priority) params.priority = priority;
      if (assignee) params.assignee = assignee;

      const res = await projectApi.getProjectTasks(activeProject._id, params);
      if (res.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      setLoadError(err.message || MESSAGES.SYSTEM.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [activeProject?._id, search, priority, assignee]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, boardVersion]);

  // Handle Drag & Drop with Optimistic Updates and Rollback
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 1. Snapshot previous state for rollback
    const previousTasks = [...tasks];

    // 2. Perform optimistic update locally
    const movedTask = tasks.find((t) => t._id === draggableId);
    if (!movedTask) return;

    const newStatus = destination.droppableId;
    const newOrder = destination.index;

    const updatedTasks = tasks.map((t) => {
      if (t._id === draggableId) {
        return { ...t, status: newStatus, order: newOrder };
      }
      return t;
    });

    setTasks(updatedTasks);

    // 3. Make backend API request
    try {
      const res = await taskApi.moveTask(draggableId, {
        status: newStatus,
        order: newOrder
      });

      if (res.success) {
        const displayStatus =
          newStatus === 'in-progress'
            ? 'In Progress'
            : newStatus === 'todo'
            ? 'To Do'
            : 'Done';

        showSuccess(res.message || MESSAGES.TASK.MOVE_SUCCESS(displayStatus));
        refreshBoard();
      }
    } catch (err) {
      // 4. ROLLBACK ON FAILURE
      console.error('Drag and drop move failed:', err);
      setTasks(previousTasks);
      showError(MESSAGES.TASK.MOVE_FAILED);
    }
  };

  // Handle Delete with Undo Toast
  const handleDeleteTask = async (taskToDelete) => {
    const previousTasks = [...tasks];

    // Optimistically remove from state
    setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));

    let undone = false;

    // Show toast with Undo button
    showToast({
      type: 'success',
      message: MESSAGES.TASK.DELETE_SUCCESS,
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          undone = true;
          setTasks(previousTasks); // Restore
          showSuccess('Task restored successfully');
        }
      }
    });

    // Execute backend delete after brief grace delay if not undone
    setTimeout(async () => {
      if (!undone) {
        try {
          await taskApi.deleteTask(taskToDelete._id);
          refreshBoard();
        } catch (err) {
          // If delete failed and not undone, put it back
          setTasks(previousTasks);
          showError('Failed to delete task from server');
        }
      }
    }, 4500);
  };

  const handleOpenNewTask = (columnId = 'todo') => {
    setModalColumn(columnId);
    setEditingTask(null);
    setIsCreateModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleTaskSaved = () => {
    fetchTasks();
    refreshBoard();
  };

  const handleResetFilters = () => {
    setSearch('');
    setPriority('');
    setAssignee('');
  };

  if (loadError) {
    return <ErrorRetry message={loadError} onRetry={fetchTasks} isRetrying={isLoading} />;
  }

  return (
    <div>
      {/* Filter & Search Bar */}
      <TaskFilterBar
        search={search}
        setSearch={setSearch}
        priority={priority}
        setPriority={setPriority}
        assignee={assignee}
        setAssignee={setAssignee}
        searchInputRef={searchInputRef}
        onReset={handleResetFilters}
      />

      {/* Board or Loading Skeleton */}
      {isLoading && tasks.length === 0 ? (
        <BoardSkeleton />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {COLUMNS.map((col) => {
              const columnTasks = tasks
                .filter((t) => t.status === col.id)
                .sort((a, b) => (a.order || 0) - (b.order || 0));

              return (
                <KanbanColumn
                  key={col.id}
                  columnId={col.id}
                  title={col.title}
                  tasks={columnTasks}
                  onNewTask={handleOpenNewTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        taskToEdit={editingTask}
        defaultStatus={modalColumn}
        onTaskSaved={handleTaskSaved}
      />
    </div>
  );
};

export default KanbanBoard;
