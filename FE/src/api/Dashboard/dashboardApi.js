import apiClient from '../apiClient';
import { getProjectTasks } from '../TeamPage';
import { getUserInfo } from '../User/userProfileApi';

export const getDashboardProjects = () => {
  return apiClient.get('/dashboard/projects/me');
};

export const getDashboardUrgentTasks = () => {
  return apiClient.get('/dashboard/tasks/deadline');
};

export const getDashboardCompletedTasks = () => {
  return apiClient.get('/dashboard/tasks/completed');
};

export const getDashboardInProgressTasks = async (projects) => {
  if (projects.length === 0) return [];

  const response = await getUserInfo();
  const userId = response.data?.userId ?? response.data?.id;
  if (userId == null) {
    throw new Error('로그인 사용자 ID를 확인할 수 없습니다.');
  }

  const tasksByProject = await Promise.all(projects.map(async (project) => {
    const data = await getProjectTasks(project.projectId);
    return (data.taskList || [])
      .filter((task) =>
        task.managerId != null &&
        String(task.managerId) === String(userId) &&
        ['TODO', 'IN_PROGRESS'].includes(task.status)
      )
      .map((task) => ({
        ...task,
        projectId: project.projectId,
        projectTitle: project.title,
        taskStatus: task.status,
      }));
  }));
  return tasksByProject.flat().sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
};

export const getDashboardProjectStatuses = () => {
  return apiClient.get('/dashboard/projects/status');
};