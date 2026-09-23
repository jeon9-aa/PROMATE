import React, { useState, useEffect } from 'react';
import { ClipboardList, SquarePen, Users } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Calendar from '../../components/Calendar/Calendar';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import moreIcon from '../../assets/moreIcon.svg';
import NewTaskModal from '../../components/NewTaskModal/NewTaskModal.jsx';
import TaskDetailModal from './components/TaskDetailModal.jsx';
import { 
  getProjectMembers, 
  getProjectTasks, 
  getProjectPosts, 
  getTaskDetail,
  createProjectTask,
  updateProjectTask,
  updateTaskStatus,
  deleteProjectTask
} from '../../api/TeamPage';
import './TeamPage.css';


const INITIAL_VISIBLE_COUNT = 3;
const TASK_STATUS_LABELS = {
  TODO: '진행 전',
  IN_PROGRESS: '진행 중',
  DONE: '진행 완료'
};
const NO_ASSIGNED_TASKS_MESSAGE = '해당 프로젝트에 할당된 태스크를 찾을 수 없어 진행률을 계산할 수 없습니다';

const getTaskStatusLabel = (status) => TASK_STATUS_LABELS[status] || status;

function TeamPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [tasks, setTasks] = useState([]);
  const [projectProgress, setProjectProgress] = useState(0);
  const [projectTitle, setProjectTitle] = useState(location.state?.projectTitle || '프로젝트');
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailLoading, setIsTaskDetailLoading] = useState(false);
  const [taskDetailError, setTaskDetailError] = useState(null);

  const [members, setMembers] = useState([]);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(null);

  const [boardPosts, setBoardPosts] = useState([]);
  const [isBoardLoading, setIsBoardLoading] = useState(true);
  const [boardError, setBoardError] = useState(null);

  const [visibleTaskCount, setVisibleTaskCount] = useState(INITIAL_VISIBLE_COUNT);
  const [visiblePostCount, setVisiblePostCount] = useState(INITIAL_VISIBLE_COUNT);
  
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const idToFetch = Number(projectId);
  const projectDueDate = location.state?.dueDate || '마감일 미정';

  const completedTasksCount = tasks.filter(task => task.status === 'DONE').length;
  const pendingTasksCount = tasks.filter(task => task.status !== 'DONE').length;
  
  const visibleTasks = tasks.slice(0, visibleTaskCount);
  const visiblePosts = boardPosts.slice(0, visiblePostCount);
  const canToggleTasks = tasks.length > INITIAL_VISIBLE_COUNT;
  const canTogglePosts = boardPosts.length > INITIAL_VISIBLE_COUNT;

  const isTaskExpanded = visibleTaskCount >= tasks.length;
  const isBoardExpanded = visiblePostCount >= boardPosts.length;

  const fetchTasks = async () => {
    try {
      setIsTasksLoading(true);
      setTasksError(null);
      const data = await getProjectTasks(idToFetch);
      setTasks(data.taskList || []);
      setProjectProgress(data.projectProgress || 0);
      if (data.projectTitle) setProjectTitle(data.projectTitle);
    } catch (err) {
      if (err.message?.includes(NO_ASSIGNED_TASKS_MESSAGE)) {
        setTasks([]);
        setProjectProgress(0);
        return;
      }

      setTasksError(err.message);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setIsBoardLoading(true);
      setBoardError(null);
      const postList = await getProjectPosts(idToFetch);
      setBoardPosts(postList);
    } catch (err) {
      setBoardError(err.message);
    } finally {
      setIsBoardLoading(false);
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsMembersLoading(true);
        setMembersError(null);
        const data = await getProjectMembers(idToFetch);
        setMembers(data);
      } catch (err) {
        setMembersError(err.message);
      } finally {
        setIsMembersLoading(false);
      }
    };

    fetchMembers();
  }, [idToFetch]);

  useEffect(() => {
    fetchTasks();
  }, [idToFetch]);

  useEffect(() => {
    fetchPosts();
  }, [idToFetch]);

  const handleTaskClick = async (taskId) => {
    try {
      setIsTaskDetailLoading(true);
      setTaskDetailError(null);
      setSelectedTask({ taskId });
      const data = await getTaskDetail(idToFetch, taskId);
      setSelectedTask(data);
    } catch (err) {
      setTaskDetailError(err.message);
    } finally {
      setIsTaskDetailLoading(false);
    }
  };

  const handleAddTaskSubmit = async (newTaskData) => {
    try {
      const formattedDate = newTaskData.dueDate.replace(/\./g, '-');
      await createProjectTask(idToFetch, {
        managerId: newTaskData.managerId,
        title: newTaskData.title,
        description: newTaskData.description || '',
        dueDate: formattedDate,
      });
      setIsNewTaskModalOpen(false);
      await fetchTasks();
    } catch (err) {
      alert(`태스크 생성에 실패했습니다: ${err.message}`);
    }
  };

  const handleUpdateTaskStatus = async (taskId, currentTask, nextStatus) => {
    try {
      const data = await updateTaskStatus(idToFetch, taskId, { status: nextStatus });
      setSelectedTask((prev) => prev && prev.taskId === taskId ? { ...prev, status: nextStatus } : prev);
      setProjectProgress(data.projectProgress || 0);
      await fetchTasks();
    } catch (err) {
      alert(`태스크 상태 변경에 실패했습니다: ${err.message}`);
    }
  };

  const handleUpdateTaskDetails = async (taskId, updatedData) => {
    try {
      setIsTaskDetailLoading(true);
      await updateProjectTask(idToFetch, taskId, updatedData);
      
      const data = await getTaskDetail(idToFetch, taskId);
      setSelectedTask(data);
      await fetchTasks();
    } catch (err) {
      alert(`태스크 수정에 실패했습니다: ${err.message}`);
    } finally {
      setIsTaskDetailLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!window.confirm('정말로 이 태스크를 삭제하시겠습니까?')) return;

    try {
      setIsTaskDetailLoading(true);
      await deleteProjectTask(idToFetch, selectedTask.taskId);
      setSelectedTask(null);
      await fetchTasks();
    } catch (err) {
      alert(`태스크 삭제에 실패했습니다: ${err.message}`);
    } finally {
      setIsTaskDetailLoading(false);
    }
  };

  const handlePostClick = (postId) => {
    const params = new URLSearchParams({
      projectId: String(idToFetch),
      projectTitle,
    });
    navigate(`/board/${postId}?${params.toString()}`, {
      state: { projectTitle, dueDate: projectDueDate },
    });
  };

  const openCreatePage = () => {
    const params = new URLSearchParams({ projectId: String(idToFetch), projectTitle });
    navigate(`/board/new?${params.toString()}`, {
      state: { projectTitle, dueDate: projectDueDate, fromProject: true },
    });
  };

  const openTaskBoard = (status) => {
    navigate(`/task-board?projectId=${idToFetch}&status=${status}`, { state: { projectTitle, dueDate: projectDueDate } });
  };

  const openBoard = () => {
    const boardParams = new URLSearchParams({
      projectId: String(idToFetch),
      projectTitle,
    });
    navigate(`/board?${boardParams.toString()}`, { state: { projectTitle, dueDate: projectDueDate } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  return (
    <div className="team-page-container">
      <h1 className="team-page-title">{projectTitle}</h1>

      <div className={`team-page-grid ${isTaskExpanded ? 'team-task-expanded' : ''}`}>
        <section
          className="team-card team-progress-card team-card-clickable"
          role="button"
          tabIndex={0}
          onClick={() => openTaskBoard('all')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openTaskBoard('all');
            }
          }}
        >
        <SummaryCard 
          title="프로젝트 현황" 
          count={projectProgress} 
          unit="%"
          subtitle={`마감일: ${projectDueDate}`}
          isAllEmpty={true}
        />
          <ProgressBar percent={projectProgress} />
        </section>

        <section className={`team-card team-task-board ${isTaskExpanded ? 'team-card-expanded' : ''}`}>
        <SummaryCard 
          title="태스크 보드" 
          count={tasks.length}
          unit="개"
          isAllEmpty={true}
          actionButton={
            <button
              type="button"
              className="team-board-write-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsNewTaskModalOpen(true);
              }}
            >
              <SquarePen size={12} />
              <span>태스크 쓰기</span>
            </button>
          }
        />

          <div className="team-task-list">
            {isTasksLoading && <div className="team-member-status">불러오는 중...</div>}
            {tasksError && <div className="team-member-status" style={{ color: 'red' }}>{tasksError}</div>}
            
            {!isTasksLoading && !tasksError && tasks.length === 0 && (
              <div className="team-empty-state">등록된 태스크가 없습니다.</div>
            )}

            {!isTasksLoading && !tasksError && visibleTasks.map((task) => (
              <article 
                className="team-task-item" 
                key={task.taskId}
                role="button"
                tabIndex={0}
                onClick={() => handleTaskClick(task.taskId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleTaskClick(task.taskId);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <h3>{task.title}</h3>
                  <p>마감일: {task.dueDate?.replace(/-/g, '.')}</p>
                </div>
                <span
                  style={{
                    backgroundColor:
                      task.status === 'TODO' ? '#80D366' :
                      task.status === 'IN_PROGRESS' ? '#FFD748' :
                      '#D9D9D9'
                  }}
                >
                  {getTaskStatusLabel(task.status)}
                </span>
              </article>
            ))}
          </div>

          {canToggleTasks && (
            <MoreButton
              isExpanded={isTaskExpanded}
              onClick={() => isTaskExpanded 
                ? setVisibleTaskCount(INITIAL_VISIBLE_COUNT) 
                : setVisibleTaskCount(prev => prev + 3)}
            />
          )}
        </section>

        <div
          className="team-card team-metric-card team-metric-card-urgent team-card-clickable"
          role="button"
          tabIndex={0}
          onClick={() => openTaskBoard('IN_PROGRESS')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openTaskBoard('IN_PROGRESS');
            }
          }}
        >
          <SummaryCard title="진행 및 예정 태스크" count={pendingTasksCount} isAllEmpty={true} />
        </div>
        <div
          className="team-card team-metric-card team-metric-card-completed team-card-clickable"
          role="button"
          tabIndex={0}
          onClick={() => openTaskBoard('DONE')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openTaskBoard('DONE');
            }
          }}
        >
          <SummaryCard title="완료한 태스크" count={completedTasksCount} isAllEmpty={true} />
        </div>

        <div className="team-calendar">
          <Calendar projectId={idToFetch} projectTitle={projectTitle} />
        </div>

        <section className={`team-card team-board-card ${isBoardExpanded ? 'team-card-expanded' : ''}`}>
          <div className="team-board-header team-board-header-clickable" onClick={openBoard}>
            <PanelTitle icon={<ClipboardList size={18} />} title="게시판" onClick={openBoard} />
            <button
              type="button"
              className="team-board-write-button"
              onClick={(event) => {
                event.stopPropagation();
                openCreatePage();
              }}
            >
              <SquarePen size={12} />
              <span>글쓰기</span>
            </button>
          </div>
          <div className="team-board-list">
            {isBoardLoading && <div className="team-member-status">불러오는 중...</div>}
            {boardError && <div className="team-member-status" style={{ color: 'red' }}>{boardError}</div>}
            
            {!isBoardLoading && !boardError && boardPosts.length === 0 && (
              <div className="team-empty-state">등록된 게시글이 없습니다.</div>
            )}

            {!isBoardLoading && !boardError && visiblePosts.map((post) => (
              <article
                className="team-board-post"
                key={post.postId}
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  handlePostClick(post.postId);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    handlePostClick(post.postId);
                  }
                }}
              >
                <h3>{post.title}</h3>
                <time>{formatDate(post.createdAt)}</time>
              </article>
            ))}
          </div>
          {canTogglePosts && (
            <MoreButton
              isExpanded={isBoardExpanded}
              onClick={() => isBoardExpanded 
                ? setVisiblePostCount(INITIAL_VISIBLE_COUNT) 
                : setVisiblePostCount(prev => prev + 3)}
            />
          )}
        </section>

        <section className="team-card team-members-card">
          <PanelTitle icon={<Users size={18} />} title="프로젝트 팀원" />
          <div className="team-members-list">
            {isMembersLoading && <div className="team-member-status">불러오는 중...</div>}
            {membersError && <div className="team-member-status" style={{ color: 'red' }}>{membersError}</div>}
            
            {!isMembersLoading && !membersError && members.length === 0 && (
              <div className="team-empty-state">참여 중인 팀원이 없습니다.</div>
            )}

            {!isMembersLoading && !membersError && members.map((member) => (
              <div className="team-member" key={member.userId}>
                <strong>{member.name}</strong>
                <span>{member.role || '팀원'}</span>
              </div>
            ))}
          </div>
        </section>
      </div>



      <TaskDetailModal
        isOpen={!!selectedTask}
        task={selectedTask}
        isLoading={isTaskDetailLoading}
        error={taskDetailError}
        members={members}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleUpdateTaskStatus}
        onDelete={handleDeleteTask}
        onUpdate={handleUpdateTaskDetails}
      />

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSubmit={handleAddTaskSubmit}
        projectId={idToFetch}
        members={members}
      />
    </div>
  );
}

function MoreButton({ isExpanded, onClick }) {
  return (
    <button
      className="team-more-button"
      type="button"
      aria-expanded={isExpanded}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <span>{isExpanded ? '접기' : '더보기'}</span>
      <img src={moreIcon} alt="" aria-hidden="true" />
    </button>
  );
}

function PanelTitle({ icon, title, onClick }) {
  if (onClick) {
    return (
      <div
        className="team-panel-title team-panel-title-button"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        }}
      >
        {icon}
        <h2>{title}</h2>
      </div>
    );
  }

  return (
    <div className="team-panel-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

export default TeamPage;
