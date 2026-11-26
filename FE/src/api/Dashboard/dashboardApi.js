import apiClient from '../apiClient';
import { getProjectTasks } from '../TeamPage';

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
  const tasksByProject = await Promise.all(projects.map(async (project) => {
    const data = await getProjectTasks(project.projectId);
    return (data.taskList || [])
      .filter((task) => ['TODO', 'IN_PROGRESS'].includes(task.status))
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