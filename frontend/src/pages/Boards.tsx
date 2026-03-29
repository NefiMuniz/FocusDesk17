import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./Boards.module.css";
import { SquareDashedKanban, BadgeCheck, BadgeAlert, ShieldAlert, Goal, CalendarCheck2, PlusCircle, LayoutDashboard } from "lucide-react";
import { getBoards } from "../api/boards";
import { Board, Task } from "../types";
import CreateBoardModal from "../components/CreateBoardModal";
import CreateTaskModal from "../components/CreateTaskModal";
import { getUserFromToken } from "../api/auth";
import { useNavigate } from "react-router-dom";

const Boards = () => {
  useEffect(() => {
    document.title = "FocusDesk17 | Boards";
  }, []);

  const { data: boards = [], isLoading, isError } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: () => getBoards().then(res => res.data),
  });

  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split("T")[0];

  const allTasks: Task[] = [];

  const overdueTasks = allTasks.filter(t => t.due_date && t.due_date < today);
  const todayTasks = allTasks.filter(t => t.due_date === today);
  const upcomingTasks = allTasks.filter(t => t.due_date === tomorrow || t.due_date === dayAfter);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const boardsWithNoAction = boards.filter(b => b.updated_at < sevenDaysAgo).length;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);


  const user = getUserFromToken();

  return (
    <div className={styles.container}>

      <h1 className={styles.welcome}>Welcome, {user?.name ?? "User"}!</h1>

      <div className={styles.actions}>
        <button className={styles.button} onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} aria-hidden="true" />
          Add New Board
        </button>
        <button className={styles.button}>
          <LayoutDashboard size={18} aria-hidden="true" />
          Manage Boards
        </button>
        <button className={styles.button} onClick={() => setIsTaskModalOpen(true)}>
          <PlusCircle size={18} aria-hidden="true" />
          Add New Task
        </button>
      </div>

      {isLoading && <p className={styles.emptyMessage}>Loading...</p>}
      {isError && <p className={styles.error}>Failed to load data.</p>}

      <div className={styles.statsGrid}>
        <div className={styles.cardBorder}>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.iconCircle}>
              <SquareDashedKanban size={28} aria-hidden="true" />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statNumber}>{boards.length}</p>
              <p className={styles.statLabel}>Total Boards</p>
            </div>
          </div>
        </div>
        <div className={styles.cardBorder}>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.iconCircle}>
              <BadgeCheck size={28} aria-hidden="true" />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statNumber}>0%</p>
              <p className={styles.statLabel}>Completed on Time</p>
            </div>
          </div>
        </div>
        <div className={styles.cardBorder}>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.iconCircle}>
              <BadgeCheck size={28} aria-hidden="true" />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statNumber}>0%</p>
              <p className={styles.statLabel}>Completed Late</p>
            </div>
          </div>
        </div>
        <div className={styles.cardBorder}>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.iconCircle}>
              <BadgeAlert size={28} aria-hidden="true" />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statNumber}>{boardsWithNoAction}</p>
              <p className={styles.statLabel}>No Action Boards</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.largeGrid}>

        <div className={styles.cardBorder}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <div className={styles.iconCircle}>
                <ShieldAlert size={20} aria-hidden="true" />
              </div>
              <h2>Need Immediate Attention</h2>
            </div>
            <div className={styles.taskList}>
              {overdueTasks.length === 0 && todayTasks.length === 0 && (
                <p className={styles.emptyMessage}>No urgent tasks.</p>
              )}
              {overdueTasks.map(task => (
                <div key={task.id} className={`${styles.task} ${styles.overdue}`}>
                  <Goal size={20} className={styles.iconOverdue} aria-hidden="true" />
                  {task.title}
                </div>
              ))}
              {todayTasks.map(task => (
                <div key={task.id} className={`${styles.task} ${styles.today}`}>
                  <Goal size={20} className={styles.iconToday} aria-hidden="true" />
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.cardBorder}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <div className={styles.iconCircle}>
                <CalendarCheck2 size={20} aria-hidden="true" />
              </div>
              <h2>Next Tasks</h2>
            </div>
            <div className={styles.taskList}>
              {upcomingTasks.length === 0 && (
                <p className={styles.emptyMessage}>No upcoming tasks.</p>
              )}
              {upcomingTasks.map(task => (
                <div key={task.id} className={`${styles.task} ${styles.upcoming}`}>
                  <Goal size={20} className={styles.iconUpcoming} aria-hidden="true" />
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
        <div className={styles.boardsSection}>
        <h2><span className={styles.sectionTitle}>My Boards</span></h2>
        <div className={styles.boardsGrid}>
          {boards.length === 0 && (
            <p className={styles.emptyMessage}>No boards yet. Create your first board!</p>
          )}
          {boards.map(board => (
            <div key={board.id} className={styles.cardBorder} onClick={() => navigate(`/board/${board.id}`)}>
              <div className={styles.boardCard}>
                <h3 className={styles.boardName}>{board.name}</h3>
                <p className={styles.boardDescription}>{board.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && <CreateBoardModal onClose={() => setIsModalOpen(false)} />}
      {isTaskModalOpen && <CreateTaskModal onClose={() => setIsTaskModalOpen(false)} />}
    </div>
  );
};

export default Boards;