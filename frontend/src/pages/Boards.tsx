import { useQueries, useQuery } from "@tanstack/react-query";
import { BadgeAlert, BadgeCheck, CalendarCheck2, Goal, LayoutDashboard, Pencil, PlusCircle, ShieldAlert, SquareDashedKanban } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getBoards } from "../api/boards";
import { getLists } from "../api/lists";
import { getAllTasks } from "../api/tasks";
import CreateBoardModal from "../components/CreateBoardModal";
import CreateTaskModal from "../components/CreateTaskModal";
import EditProfileModal from "../components/EditProfileModal";
import { useAuth } from "../context/AuthContext";
import { Board, Task, TaskList } from "../types";
import styles from "./Boards.module.css";

const COLORS = {
  green: "#06D6A0",
  red: "#EF476F",
  yellow: "#FFD166",
  blue: "#118AB2",
  dark: "#07384C",
};

const legendFormatter = (value: string | number) => (
  <span style={{ fontFamily: "Poppins", fontSize: "0.78rem", fontWeight: "600", color: "#07384C" }}>
    {value}
  </span>
);

const tooltipStyle = {
  background: "#EEF5FB",
  border: "1px solid #06D6A0",
  borderRadius: "0.5rem",
  fontFamily: "Poppins",
  fontSize: "0.8rem",
  color: "#07384C",
};

const Boards = () => {
  useEffect(() => {
    document.title = "FocusDesk17 | Boards";
  }, []);

  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const { data: boards = [], isLoading, isError } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: () => getBoards().then(res => res.data),
  });

  const { data: allTasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["tasks", "all"],
    queryFn: () => getAllTasks().then(res => res.data),
  });

  const listQueries = useQueries({
    queries: boards.map(board => ({
      queryKey: ["lists", board.id],
      queryFn: () => getLists(board.id).then(res => res.data),
      enabled: boards.length > 0,
    })),
  });

  const allLists: TaskList[] = listQueries.flatMap(q => q.data ?? []);

  const getTaskBoard = (task: Task): string => {
    const list = allLists.find(l => l.id === task.list_id);
    const board = boards.find(b => b.id === list?.board_id);
    return board?.name ?? "Unknown";
  };

  const today = new Date().toISOString().split("T")[0];

  const overdueTasks = allTasks.filter(t => t.due_date && t.due_date < today && t.status !== "done");
  const todayTasks = allTasks.filter(t => t.due_date === today && t.status !== "done");
  const nextTasks = allTasks
    .filter(t => t.due_date && t.due_date > today && t.status !== "done")
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .slice(0, 10);

  const sevenDaysAgoDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const boardsWithNoAction = boards.filter(board => {
    const boardLists = allLists.filter(l => l.board_id === board.id);

    if (boardLists.length === 0) return true;

    const boardTasks = allTasks.filter(t =>
      boardLists.some(l => l.id === t.list_id)
    );

    if (boardTasks.length === 0) return true;

    const hasRecentTask = boardTasks.some(task => {
      const date = new Date(task.updated_at || task.created_at);
      return date >= sevenDaysAgoDate;
    });

    return !hasRecentTask;
  }).length;

  const doneTasks = allTasks.filter(t => t.status === "done");
  const completedOnTime = doneTasks.filter(t => !t.due_date || t.updated_at.split("T")[0] <= t.due_date).length;
  const completedLate = doneTasks.filter(t => t.due_date && t.updated_at.split("T")[0] > t.due_date).length;
  const totalDone = doneTasks.length;

  const completedOnTimePct = totalDone > 0 ? Math.round((completedOnTime / totalDone) * 100) : 0;
  const completedLatePct = totalDone > 0 ? Math.round((completedLate / totalDone) * 100) : 0;

  const todoCount = allTasks.filter(t => t.status === "todo").length;
  const inProgressCount = allTasks.filter(t => t.status === "in_progress").length;
  const doneCount = doneTasks.length;

  const statusPieData = [
    { name: "To-Do", value: todoCount },
    { name: "In Progress", value: inProgressCount },
    { name: "Done", value: doneCount },
  ].filter(d => d.value > 0);

  const completionPieData = [
    { name: "On Time", value: completedOnTime },
    { name: "Late", value: completedLate },
  ].filter(d => d.value > 0);

  const boardBarData = boards.map(board => {
    const boardListIds = allLists.filter(l => l.board_id === board.id).map(l => l.id);
    const boardTasks = allTasks.filter(t => boardListIds.includes(t.list_id));
    const done = boardTasks.filter(t => t.status === "done").length;
    const overdue = boardTasks.filter(t => t.due_date && t.due_date < today && t.status !== "done").length;
    const total = done + overdue;

    return {
      name: board.name.length > 10 ? board.name.slice(0, 10) + "…" : board.name,
      Done: total > 0 ? Math.round((done / total) * 100) : 0,
      Overdue: total > 0 ? Math.round((overdue / total) * 100) : 0,
    };
  });

  return (
    <div className={styles.container}>

      <div className={styles.welcomeContainer}>
        <h1 className={styles.welcome}>Welcome, {user?.name ?? "User"}!</h1>
        <button className={styles.profileEditButton} aria-label="Edit profile" onClick={() => setIsEditProfileOpen(true)}>
          <Pencil size={16} />
        </button>
      </div>

      <div className={styles.actions}>
        <button className={styles.button} onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} aria-hidden="true" /> Add New Board
        </button>
        <button className={styles.button}>
          <LayoutDashboard size={18} aria-hidden="true" /> Manage Boards
        </button>
        <button className={styles.button} onClick={() => setIsTaskModalOpen(true)}>
          <PlusCircle size={18} aria-hidden="true" /> Add New Task
        </button>
      </div>

      {isLoading && <p className={styles.emptyMessage}>Loading...</p>}
      {isError && <p className={styles.error}>Failed to load data.</p>}

      <div className={styles.statsGrid}>
        <div className={styles.cardBorder}>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.iconCircle}><SquareDashedKanban size={28} aria-hidden="true" /></div>
            <div className={styles.statInfo}>
              <p className={styles.statNumber}>{boards.length}</p>
              <p className={styles.statLabel}>Total Boards</p>
            </div>
          </div>
        </div>
        <div className={styles.cardBorder}>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.iconCircle}><BadgeCheck size={28} aria-hidden="true" /></div>
            <div className={styles.statInfo}>
              <p className={styles.statNumber}>{completedOnTimePct}%</p>
              <p className={styles.statLabel}>Completed on Time</p>
            </div>
          </div>
        </div>
        <div className={styles.cardBorder}>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.iconCircle}><BadgeCheck size={28} aria-hidden="true" /></div>
            <div className={styles.statInfo}>
              <p className={styles.statNumber}>{completedLatePct}%</p>
              <p className={styles.statLabel}>Completed Late</p>
            </div>
          </div>
        </div>
        <div className={styles.cardBorder}>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.iconCircle}><BadgeAlert size={28} aria-hidden="true" /></div>
            <div className={styles.statInfo}>
              <p className={styles.statNumber}>{boardsWithNoAction}</p>
              <p className={styles.statLabel}>No Action Boards</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.boardsSection}>
        <h2><span className={styles.sectionTitle}>My Boards</span></h2>
        <div className={styles.boardsGrid}>
          {boards.length === 0 && <p className={styles.emptyMessage}>No boards yet. Create your first board!</p>}
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

      <div className={styles.tasksSection}>
        <h2><span className={styles.sectionTitle}>Tasks Summary</span></h2>
        <div className={styles.tasksGrid}>
          <div className={styles.cardBorder}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <div className={styles.iconCircle}><ShieldAlert size={20} aria-hidden="true" /></div>
                <h2>Need Immediate Attention</h2>
              </div>
              <div className={styles.taskList}>
                {overdueTasks.length === 0 && todayTasks.length === 0 && (
                  <p className={styles.emptyMessage}>No urgent tasks.</p>
                )}
                {overdueTasks.map(task => (
                  <div key={task.id} className={`${styles.task} ${styles.overdue}`}>
                    <Goal size={16} className={styles.iconOverdue} aria-hidden="true" />
                    <span>{task.title}</span>
                    <span className={styles.taskBoard}>{getTaskBoard(task)}</span>
                  </div>
                ))}
                {todayTasks.map(task => (
                  <div key={task.id} className={`${styles.task} ${styles.today}`}>
                    <Goal size={16} className={styles.iconToday} aria-hidden="true" />
                    <span>{task.title}</span>
                    <span className={styles.taskBoard}>{getTaskBoard(task)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.cardBorder}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <div className={styles.iconCircle}><CalendarCheck2 size={20} aria-hidden="true" /></div>
                <h2>Next Tasks</h2>
              </div>
              <div className={styles.taskList}>
                {nextTasks.length === 0 && (
                  <p className={styles.emptyMessage}>No upcoming tasks.</p>
                )}
                {nextTasks.map(task => (
                  <div key={task.id} className={`${styles.task} ${styles.upcoming}`}>
                    <Goal size={16} className={styles.iconUpcoming} aria-hidden="true" />
                    <span>{task.title}</span>
                    <span className={styles.taskDueDate}>{task.due_date}</span>
                    <span className={styles.taskBoard}>{getTaskBoard(task)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsSection}>
        <h2><span className={styles.sectionTitle}>Analytics</span></h2>
        {tasksLoading ? (
          <div className={styles.chartsGrid}>
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : allTasks.length > 0 ? (
          <div className={styles.chartsGrid}>

            <div className={styles.cardBorder}>
              <div className={styles.card}>
                <h3 className={styles.chartTitle}>Task Status Overview</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie 
                      data={statusPieData} 
                      cx="50%" 
                      cy="42%" 
                      innerRadius={50} 
                      outerRadius={80} 
                      paddingAngle={3} 
                      dataKey="value"
                      label={({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name, percent = 0 }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 20;
                      
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                        const value = percent * 100;
                      
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#07384C"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            style={{
                              fontFamily: "Poppins",
                              fontSize: "0.75rem",
                              fontWeight: "600"
                            }}
                          >
                            {`${name}: ${value.toFixed(0)}%`}
                          </text>
                        );
                      }}
                      labelLine={{ stroke: "#07384C", strokeWidth: 1  }}
                      style={{ fontFamily: "Poppins", fontSize: "0.75rem", fontWeight: "600" }}
                      >
                     {statusPieData.map((entry, index) => {
                        let color;
                        if (entry.name === "To-Do") color = COLORS.yellow;
                        else if (entry.name === "In Progress") color = COLORS.blue;
                        else color = COLORS.green; 
                        
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value: any) => {
                        const n = Number(value ?? 0);
                        const total = statusPieData.reduce((s, d) => s + d.value, 0);
                        const percentage = total > 0 ? Math.round((n / total) * 100) : 0;
                        return [`${n} (${percentage}%)`];
                      }}
                    />
                    <Legend formatter={legendFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.cardBorder}>
              <div className={styles.card}>
                <h3 className={styles.chartTitle}>Completion Rate</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie 
                      data={completionPieData} 
                      cx="50%" 
                      cy="42%" 
                      innerRadius={50} 
                      outerRadius={80} 
                      paddingAngle={3} 
                      dataKey="value"
                      label={({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name, percent = 0 }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 20;
                    
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                        const value = percent * 100;
                    
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#07384C"
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            style={{
                              fontFamily: "Poppins",
                              fontSize: "0.75rem",
                              fontWeight: "600"
                            }}
                          >
                            {`${name}: ${value.toFixed(0)}%`}
                          </text>
                        );
                      }}
                      labelLine={{ stroke: "#07384C", strokeWidth: 1 }}
                      >
                      {completionPieData.map((entry, index) => {
                        const color = entry.name === "On Time" ? COLORS.green : COLORS.red;
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(value: any, name: any) => {
                        const n = Number(value ?? 0);
                        return [n.toString(), name];
                      }}
                    />
                    <Legend formatter={legendFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.cardBorder}>
              <div className={styles.card}>
                <h3 className={styles.chartTitle}>Done vs Overdue by Board</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={boardBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,138,178,0.15)" />
                    <XAxis dataKey="name" tick={{ fontFamily: "Poppins", fontSize: "0.75rem", fill: COLORS.dark }} />
                    <YAxis tick={{ fontFamily: "Poppins", fontSize: "0.75rem", fill: COLORS.dark }} 
                      unit="%" 
                      domain={[0, 100]}
                    />
                    <Tooltip contentStyle={tooltipStyle} 
                      formatter={(value: any) => [`${value}%`]}
                    />
                    <Legend formatter={legendFormatter} />
                    <Bar dataKey="Done" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Overdue" fill={COLORS.red} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        ) : (
          <p className={styles.emptyMessage}>No tasks yet to analyze.</p>
        )}
      </div>

      {isModalOpen && <CreateBoardModal onClose={() => setIsModalOpen(false)} />}
      {isTaskModalOpen && <CreateTaskModal onClose={() => setIsTaskModalOpen(false)} />}
      {isEditProfileOpen && <EditProfileModal onClose={() => setIsEditProfileOpen(false)} />}
    </div>
  );
};

export default Boards;