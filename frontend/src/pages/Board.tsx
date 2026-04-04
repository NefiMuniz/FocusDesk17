import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CirclePlus, ListPlus, Search, Pencil, Trash2, Grip, Check, X } from "lucide-react";
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners, DragOverlay } from "@dnd-kit/core";
import styles from "./Board.module.css";
import { getBoard, deleteBoard } from "../api/boards";
import { getLists, deleteList } from "../api/lists";
import { getLabels, updateLabel, deleteLabel } from "../api/labels";
import { reorderTask } from "../api/tasks";
import { Board as BoardType, TaskList, Label, Task } from "../types";
import TaskCard from "../components/TaskCard";
import DroppableList from "../components/DroppableList";
import AddListModal from "../components/AddListModal";
import CreateTaskModal from "../components/CreateTaskModal";
import { useNavigate } from "react-router-dom";
import EditBoardModal from "../components/EditBoardModal";
import { useQueries } from "@tanstack/react-query";
import { getTasks } from "../api/tasks";

const Board = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isEditBoardModalOpen, setIsEditBoardModalOpen] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState("");
  const [editingLabelColor, setEditingLabelColor] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [filterLabelId, setFilterLabelId] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const { data: board, isLoading: boardLoading, isError: boardError } = useQuery<BoardType>({
    queryKey: ["boards", id],
    queryFn: () => getBoard(id!).then(res => res.data),
    enabled: !!id,
  });

  const { data: labelsData = [] } = useQuery<Label[]>({
    queryKey: ["labels"],
    queryFn: () => getLabels().then(res => res.data),
  });
  const labels = [...labelsData].sort((a, b) => a.name.localeCompare(b.name));

  const { data: lists = [], isLoading: listsLoading } = useQuery<TaskList[]>({
    queryKey: ["lists", id],
    queryFn: () => getLists(id!).then(res => res.data),
    enabled: !!id,
  });

  const taskQueries = useQueries({
    queries: lists.map(list => ({
      queryKey: ["tasks", list.id],
      queryFn: () => getTasks(list.id).then(res => res.data),
      enabled: lists.length > 0,
    })),
  });
  
  const allTasks: Task[] = taskQueries.flatMap(q => q.data ?? []);

  const filteredCount = allTasks.filter((task) => {
    const matchesSearch =
      activeSearch === "" ||
      task.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      task.description?.toLowerCase().includes(activeSearch.toLowerCase());
  
    const matchesLabel = !filterLabelId || task.labels.some(l => l.id === filterLabelId);
  
    const taskDueDate = task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : null;
  
    const matchesDueDate = (() => {
      if (!filterDueDate) return true;
      if (!taskDueDate) return false;
      if (filterDueDate === "today") return taskDueDate === today;
      if (filterDueDate === "week") return taskDueDate > today && taskDueDate <= endOfWeek;
      if (filterDueDate === "next_week") return taskDueDate > endOfWeek && taskDueDate <= endOfNextWeek;
      if (filterDueDate === "overdue") return taskDueDate < today;
      return true;
    })();
  
    return matchesSearch && matchesLabel && matchesDueDate;
  }).length;
  
  const today = new Date().toISOString().split("T")[0];
  const endOfWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const endOfNextWeek = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  
  const availableCount = allTasks.length;
  const dueTodayCount = allTasks.filter(t => t.due_date === today).length;
  const dueThisWeekCount = allTasks.filter(t => t.due_date && t.due_date > today && t.due_date <= endOfWeek).length;
  const dueNextWeekCount = allTasks.filter(t => t.due_date && t.due_date > endOfWeek && t.due_date <= endOfNextWeek).length;


  const deleteMutation = useMutation({
    mutationFn: () => deleteBoard(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      navigate("/boards");
    },
    onError: (error) => {
      alert("Error while deleting the board. Try again");
      console.error(error);
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      deleteMutation.mutate();
    }
  };

  const deleteListMutation = useMutation({
    mutationFn: (listId: string) => deleteList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", id] });
    },
    onError: (error) => {
      alert("Error while deleting the list.");
      console.error(error);
    }
  });

  const handleDeleteList = (list: TaskList) => {
    if (window.confirm("Are you sure you want to delete this list? All the tasks from this list will be deleted.")) {
      deleteListMutation.mutate(list.id);
    }
  };

  const updateLabelMutation = useMutation({
    mutationFn: (label: { id: string; name: string; color: string }) =>
      updateLabel(label.id, { name: label.name, color: label.color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingLabelId(null);
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: (labelId: string) => deleteLabel(labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleEditLabel = (label: Label) => {
    setEditingLabelId(label.id);
    setEditingLabelName(label.name);
    setEditingLabelColor(label.color ?? "#EF476F");
  };

  const handleSaveLabel = () => {
    if (!editingLabelId || editingLabelName.trim().length < 1) return;
    updateLabelMutation.mutate({
      id: editingLabelId,
      name: editingLabelName.trim(),
      color: editingLabelColor,
    });
  };

  const handleDeleteLabel = (labelId: string) => {
    if (window.confirm("Delete this label? It will be removed from all tasks.")) {
      deleteLabelMutation.mutate(labelId);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const allTasks = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });
    for (const [, tasks] of allTasks) {
      const found = tasks?.find(t => t.id === active.id);
      if (found) { setActiveTask(found); break; }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const sourceListId = active.data.current?.listId as string;
    const destinationListId = (over.data.current?.listId as string) ?? overId;

    if (!sourceListId || !destinationListId) return;

    const destinationTasks = queryClient.getQueryData<Task[]>(["tasks", destinationListId]) ?? [];
    let newPosition = destinationTasks.findIndex(t => t.id === overId);
    if (newPosition === -1) newPosition = destinationTasks.length;

    if (sourceListId === destinationListId) {
      const sourceTasks = [...destinationTasks];
      const oldIndex = sourceTasks.findIndex(t => t.id === activeId);
      const [moved] = sourceTasks.splice(oldIndex, 1);
      sourceTasks.splice(newPosition, 0, moved);
      queryClient.setQueryData(["tasks", sourceListId], sourceTasks);
    } else {
      const sourceTasks = [...(queryClient.getQueryData<Task[]>(["tasks", sourceListId]) ?? [])];
      const movedTask = sourceTasks.find(t => t.id === activeId)!;
      const newSourceTasks = sourceTasks.filter(t => t.id !== activeId);
      const newDestTasks = [...destinationTasks];
      newDestTasks.splice(newPosition, 0, movedTask);
      queryClient.setQueryData(["tasks", sourceListId], newSourceTasks);
      queryClient.setQueryData(["tasks", destinationListId], newDestTasks);
    }

    try {
      await reorderTask(activeId, destinationListId, newPosition);
    } catch {
      queryClient.invalidateQueries({ queryKey: ["tasks", sourceListId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", destinationListId] });
    }
  };

  useEffect(() => {
    document.title = board ? `FocusDesk17 | ${board.name}` : "FocusDesk17 | Board";
  }, [board]);

  if (boardLoading || listsLoading) return <p className={styles.message}>Loading...</p>;
  if (boardError) return <p className={styles.message}>Board not found.</p>;

  return (
    <DndContext sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{board?.name}</h1>
          <button className={styles.deleteButton} aria-label="Delete board" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
        </div>

        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search for tasks"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveSearch(e.target.value); }}
            onKeyDown={(e) => e.key === "Enter" && setActiveSearch(search)}
            aria-label="Search tasks"
          />
          <button 
            className={styles.editButton} 
            aria-label="Search"
            onClick={() => setActiveSearch(search)}
          >
            <Search size={16} />
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <p className={styles.statNumber}>{availableCount}</p>
            <p className={styles.statLabel}>Available Tasks</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statNumber}>{dueTodayCount}</p>
            <p className={styles.statLabel}>Due Today</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statNumber}>{dueThisWeekCount}</p>
            <p className={styles.statLabel}>Due This Week</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statNumber}>{dueNextWeekCount}</p>
            <p className={styles.statLabel}>Due Next Week</p>
          </div>
        </div>

        <div className={styles.filterAndSearchRow}>
          <div
          className={styles.searchResultText}
          >
            {filteredCount} {filteredCount === 1 ? "task" : "tasks"} found
          </div>
          <div
          className={styles.filters}
          >
            <select
              className={styles.filterSelect}
              value={filterLabelId}
              onChange={(e) => setFilterLabelId(e.target.value)}
              aria-label="Filter by label"
            >
              <option value="">All Labels</option>
              {labels.map(label => (
                <option key={label.id} value={label.id}>{label.name}</option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={filterDueDate}
              onChange={(e) => setFilterDueDate(e.target.value)}
              aria-label="Filter by due date"
            >
              <option value="">All Dates</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
              <option value="next_week">Due Next Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className={styles.buttonRow}>
          <div className={styles.buttonRowLeft}>
            <button
              className={styles.addTaskButton}
              onClick={() => setIsTaskModalOpen(true)}
              disabled={lists.length === 0}
              aria-label="Add new task"
            >
              <CirclePlus size={16} />
              Add Task
            </button>
          </div>

          <div className={styles.buttonRowRight}>
            <button className={styles.editButton} onClick={() => setIsEditBoardModalOpen(true)} aria-label="Edit board">
              <Pencil size={16} />
              Edit Board
            </button>
          </div>
        </div>

        {lists.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.cardBorder}>
              <div className={styles.emptyCard}>
                <p className={styles.emptyMessage}>Please, create a list to add a task.</p>
                <button className={styles.createListButton} onClick={() => setIsAddListModalOpen(true)}>
                  <ListPlus size={16} />
                  Create List
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.listsContainer}>
            {lists.map(list => (
              <div key={list.id} className={styles.listWrapper}>
                <div className={styles.listColumn}>
                  <div className={styles.listHeader}>
                    <h2 className={styles.listName}>{list.name}</h2>
                    <button className={styles.listOptionsButton} aria-label="List options">
                    <Grip size={18} />
                    </button>
                  </div>
                  <DroppableList listId={list.id} className={styles.taskList}>
                  <TaskCard listId={list.id} searchQuery={activeSearch} filterLabelId={filterLabelId} filterDueDate={filterDueDate} />
                  </DroppableList>
                  <div className={styles.listFooter}>
                    <button className={styles.listFooterButton} aria-label="Edit list">
                      <Pencil size={16} />
                    </button>
                    <button
                      className={styles.deleteButtonFooter}
                      aria-label="Delete list"
                      onClick={() => handleDeleteList(list)}
                      disabled={list.tasks && list.tasks.length > 0}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <button
                  className={styles.addListButton}
                  onClick={() => setIsAddListModalOpen(true)}
                  aria-label="Add new list"
                >
                  <ListPlus size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {labels.length > 0 && (
          <div className={styles.bottomSection}>
            <div className={styles.labelsLegend}>
              {labels.map(label => (
                <div key={label.id} className={styles.legendItem}>
                  {editingLabelId === label.id ? (
                    <>
                      <div className={styles.legendEditColorWrapper}>
                        <div
                          className={styles.legendEditColorCircle}
                          style={{ backgroundColor: editingLabelColor }}
                        >
                          <Pencil size={10} className={styles.legendEditColorPencil} />
                          <input
                            type="color"
                            value={editingLabelColor}
                            onChange={(e) => setEditingLabelColor(e.target.value)}
                            className={styles.legendColorInput}
                          />
                        </div>
                      </div>
                      <input
                        className={styles.legendEditInput}
                        value={editingLabelName}
                        onChange={(e) => setEditingLabelName(e.target.value)}
                        autoFocus
                      />
                      <button className={styles.legendIconButton} onClick={handleSaveLabel} aria-label="Save label" disabled={updateLabelMutation.isPending}>
                        <Check size={14} />
                      </button>
                      <button className={styles.legendIconButton} onClick={() => setEditingLabelId(null)} aria-label="Cancel edit">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={styles.legendColor} style={{ backgroundColor: label.color }} />
                      <span className={styles.legendName}>{label.name}</span>
                      <div className={styles.legendItemActions}>
                        <button className={styles.legendIconButton} onClick={() => handleEditLabel(label)} aria-label="Edit label">
                          <Pencil size={13} />
                        </button>
                        <button className={styles.legendIconDeleteButton} onClick={() => handleDeleteLabel(label.id)} aria-label="Delete label">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isAddListModalOpen && <AddListModal boardId={id!} onClose={() => setIsAddListModalOpen(false)} />}
        {isTaskModalOpen && <CreateTaskModal onClose={() => setIsTaskModalOpen(false)} preselectedBoardId={id} />}
        {isEditBoardModalOpen && board && <EditBoardModal board={board} onClose={() => setIsEditBoardModalOpen(false)} />}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className={styles.dragOverlayCard}>
            <div className={styles.cardHeader}>
              <span className={styles.taskTitle}>{activeTask.title}</span>
              {activeTask.labels.length > 0 && (
                <span
                  className={styles.labelBadge}
                  style={{ backgroundColor: activeTask.labels[0].color }}
                />
              )}
            </div>
            {activeTask.due_date && (
              <p className={styles.dueDate}>Due date: {activeTask.due_date}</p>
            )}
            {activeTask.description && (
              <p className={styles.description}>{activeTask.description}</p>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;