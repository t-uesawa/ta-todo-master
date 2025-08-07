import { useApp } from "@/contexts/AppContext"
import { db } from "@/firebase-config";
import { COLLECTION_NAMES, Project, Task } from "@/types";
import { collection, doc, getDocs, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { useCallback } from "react";

/**
 * プロジェクトのカスタムフック
 * (タスク単体で追加・更新・削除は考えない)
 */
export const useProject = () => {
	const { state: appData, dispatch } = useApp();

	// プロジェクトの初回取得(未完了プロジェクトとタスクを全取得)
	const fetchProjects = async () => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const projects: Project[] = [];
			const tasks: Task[] = [];

			// 未完了の全プロジェクトを取得
			const projectsSnapshot = await getDocs(
				query(
					collection(db, COLLECTION_NAMES.PROJECTS),
					where('isCompleted', '==', false),
					where('deletedAt', '==', ''),
					orderBy('updatedAt', 'asc')
				)
			);

			// 未完了プロジェクトに紐づく全タスクを取得
			projectsSnapshot.forEach(async doc => {
				const projectData = doc.data() as Project;
				const project: Project = {
					...projectData,
					uid: doc.id,
				};

				projects.push(project);
				tasks.push(...project.tasks.filter(task => !task.deletedAt));
			});

			console.log(`get projects count: ${projects.length}`);

			dispatch({ type: 'SET_PROJECTS', payload: projects });
			dispatch({ type: 'SET_TASKS', payload: tasks });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'プロジェクトの取得中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	};

	// プロジェクトの追加(タスク配列の追加)
	const addProject = useCallback(async (
		newProject: Omit<Project, 'tasks'>,
		newTasks: Task[]
	) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// プロジェクト作成
			const newProjectData = {
				...newProject,
				tasks: newTasks,
			}

			const ref = doc(db, COLLECTION_NAMES.PROJECTS, newProject.uid);
			await setDoc(ref, newProjectData);

			dispatch({ type: 'ADD_PROJECT', payload: newProjectData });
			dispatch({ type: 'SET_TASKS', payload: newTasks });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'プロジェクトの作成中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [dispatch]);

	// プロジェクトの更新(タスク配列の更新)
	const updateProject = useCallback(async (updateProj: Project) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// 更新対象プロジェクトの取得
			const projectRef = doc(db, COLLECTION_NAMES.PROJECTS, updateProj.uid);

			await updateDoc(projectRef, { ...updateProj });

			dispatch({ type: 'UPDATE_PROJECT', payload: updateProj });
			dispatch({ type: 'SET_TASKS', payload: updateProj.tasks });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'プロジェクトの更新中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [dispatch]);

	// プロジェクトの削除(関連するタスクも全て削除)
	const deleteProject = useCallback(async (deleteProj: Project) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// 削除対象プロジェクトの取得
			const projectRef = doc(db, COLLECTION_NAMES.PROJECTS, deleteProj.uid);

			await updateDoc(projectRef, { ...deleteProj });

			dispatch({ type: 'DELETE_PROJECT', payload: deleteProj.uid });
			dispatch({ type: 'DELETE_TASKS', payload: deleteProj.tasks.map(task => task.uid) });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'プロジェクトの削除中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [dispatch]);

	// タスクの更新(プロジェクトのタスク配列の更新)
	const updateTask = useCallback(async (updateProj: Project, updateTask: Task) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// 更新対象プロジェクトの取得
			const projectRef = doc(db, COLLECTION_NAMES.PROJECTS, updateProj.uid);

			await updateDoc(projectRef, { ...updateProj });

			dispatch({ type: 'UPDATE_PROJECT', payload: updateProj });
			dispatch({ type: 'UPDATE_TASK', payload: updateTask });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'タスクの更新中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [dispatch]);

	return {
		projects: appData.projects,
		tasks: appData.tasks,
		loading: appData.loading,
		error: appData.error,
		fetchProjects,
		addProject,
		updateProject,
		deleteProject,
		updateTask
	};
};