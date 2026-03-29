import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, GripVertical } from "lucide-react";
import styles from "./Board.module.css";
import { getBoard, deleteBoard } from "../api/boards";
import { getLists, deleteList } from "../api/lists";
import { getLabels } from "../api/labels";
import { Board as BoardType, TaskList, Label } from "../types";
import TaskCard from "../components/TaskCard";
import AddListModal from "../components/AddListModal";
import CreateTaskModal from "../components/CreateTaskModal";
import { useNavigate } from "react-router-dom";

const Board = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: board, isLoading: boardLoading, isError: boardError } = useQuery<BoardType>({
    queryKey: ["boards", id],
    queryFn: () => getBoard(id!).then(res => res.data),
    enabled: !!id,
  });

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
    /*if (list.tasks && list.tasks.length > 0) {
      alert("Please, move or delete the tasks from this list before deleting.");
      return;
    } ******* Will use this part if we have a change on tasks.py to count the tasks on this list*/ 
    if (window.confirm("Are you sure you want to delete this list? All the tasks from this list will be deleted.")) {
      deleteListMutation.mutate(list.id);
    }
  };

  const { data: lists = [], isLoading: listsLoading } = useQuery<TaskList[]>({
    queryKey: ["lists", id],
    queryFn: () => getLists(id!).then(res => res.data),
    enabled: !!id,
  });

  const { data: labels = [] } = useQuery<Label[]>({
    queryKey: ["labels"],
    queryFn: () => getLabels().then(res => res.data),
  });

  useEffect(() => {
    document.title = board ? `FocusDesk17 | ${board.name}` : "FocusDesk17 | Board";
  }, [board]);

  if (boardLoading || listsLoading) return <p className={styles.message}>Loading...</p>;
  if (boardError) return <p className={styles.message}>Board not found.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{board?.name}</h1>
        <button 
          className={styles.deleteButton} 
          aria-label="Delete board"
          onClick={handleDelete}>
          <Trash2 size={16} />
        </button>
      </div>
      <div className={styles.searchBar}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search for tasks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search tasks"
          />
          <button className={styles.editButton} aria-label="Edit board">
            Search
          </button>

      </div>

      <div className={styles.buttonRow}>
        <div className={styles.buttonRowLeft}>
          <button
            className={styles.addTaskButton}
            onClick={() => setIsTaskModalOpen(true)}
            disabled={lists.length === 0}
            aria-label="Add new task"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        <div className={styles.buttonRowRight}>
          <button className={styles.editButton} aria-label="Edit board">
            Edit Board
          </button>
        </div>
      </div>

      {lists.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.cardBorder}>
            <div className={styles.emptyCard}>
              <p className={styles.emptyMessage}>Please, create a list to add a task.</p>
              <button
                className={styles.createListButton}
                onClick={() => setIsAddListModalOpen(true)}
              >
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
                    <GripVertical size={18} />
                  </button>
                </div>
                <div className={styles.taskList}>
                  <TaskCard listId={list.id} searchQuery={search} />
                </div>
                <div className={styles.listFooter}>
                  <button className={styles.listFooterButton} aria-label="Edit list">
                    <Pencil size={16} />
                  </button>
                  <button 
                  className={styles.listFooterButton} 
                  aria-label="Delete list"
                  onClick={() => handleDeleteList(list)}
                  disabled={list.tasks && list.tasks.length > 0}>
                     <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <button
                className={styles.addListButton}
                onClick={() => setIsAddListModalOpen(true)}
                aria-label="Add new list"
              >
                <Plus size={14} />
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
                <span
                  className={styles.legendColor}
                  style={{ backgroundColor: label.color ?? "#9CA3AF" }}
                />
                <span className={styles.legendName}>{label.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAddListModalOpen && (
        <AddListModal boardId={id!} onClose={() => setIsAddListModalOpen(false)} />
      )}

      {isTaskModalOpen && (
        <CreateTaskModal
          onClose={() => setIsTaskModalOpen(false)}
          preselectedBoardId={id}
        />
      )}
    </div>
  );
};

export default Board;