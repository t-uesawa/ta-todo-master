import { useApp } from "@/contexts/AppContext"
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase-config";
import { COLLECTION_NAMES, Project, Task } from "@/types";
import { collection, doc, getDocs, orderBy, query, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { useCallback } from "react";
import dayjs from 'dayjs';
import { toast } from "sonner";

/**
 * プロジェクトのカスタムフック
 * (タスク単体で追加・更新・削除は考えない)
 */
export const useProject = () => {
	const { state: appData, dispatch } = useApp();
	const { state: userData } = useAuth();

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
				tasks.push(...project.tasks);
			});

			toast(`${projects.length}件取得しました`);

			dispatch({ type: 'SET_PROJECTS', payload: projects });
			dispatch({ type: 'SET_TASKS', payload: tasks });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'プロジェクトの取得中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	};

	// プロジェクトの追加(タスク配列の追加)
	const addProject = useCallback(async (
		newProject: Omit<Project, 'tasks' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>,
		newTasks: Omit<Task, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[]
	) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';

			const newTasksData: Task[] =
				newTasks.map(task => ({
					...task,
					createdAt: now,
					createdBy: userUid,
					updatedAt: now,
					updatedBy: userUid,
				}));

			// プロジェクト作成
			const newProjectData = {
				...newProject,
				tasks: newTasksData,
				createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				createdBy: userData.user?.uid || '',
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			}
			const ref = doc(db, COLLECTION_NAMES.PROJECTS, newProject.uid);
			await setDoc(ref, newProjectData);

			dispatch({ type: 'ADD_PROJECT', payload: newProjectData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'プロジェクトの作成中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// プロジェクトの更新(タスク配列の更新)
	const updateProject = useCallback(async (
		updateProj: Project,
		updateTasks: Omit<Task, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[]
	) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';

			const newTasksData: Task[] =
				updateTasks.map(task => ({
					...task,
					createdAt: now,
					createdBy: userUid,
					updatedAt: now,
					updatedBy: userUid,
				}));

			// 更新対象プロジェクトの取得
			const projectRef = doc(db, COLLECTION_NAMES.PROJECTS, updateProj.uid);
			const newProjectData = {
				...updateProj,
				tasks: newTasksData,
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			};

			await updateDoc(projectRef, newProjectData);

			dispatch({ type: 'UPDATE_PROJECT', payload: newProjectData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'プロジェクトの更新中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// プロジェクトの削除(関連するタスクも全て削除)
	const deleteProject = useCallback(async (uid: string) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// トランザクションで削除するプロジェクトに紐づくタスクも削除
			const batch = writeBatch(db);

			// プロジェクトの削除
			const projectRef = doc(db, COLLECTION_NAMES.PROJECTS, uid);
			batch.delete(projectRef);

			// 関連タスクの削除
			let newTasks = appData.tasks;

			const tasksQuery = query(
				collection(db, COLLECTION_NAMES.TASKS),
				where('projectUid', '==', uid)
			);
			const taskSnapshot = await getDocs(tasksQuery);
			taskSnapshot.forEach(doc => {
				batch.delete(doc.ref);
				newTasks = newTasks.filter(t => t.uid !== doc.id);
			});

			await batch.commit();

			dispatch({ type: 'DELETE_PROJECT', payload: uid });
			dispatch({ type: 'SET_TASKS', payload: newTasks });
		} catch (err) {
			const error = err instanceof Error ? err.message : 'プロジェクトの削除中にエラーが発生しました';
			dispatch({ type: 'SET_ERROR', payload: error });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [appData.tasks, dispatch]);

	// タスクの追加
	const addTasks = useCallback(async (
		projectUid: string,
		newTasks: Omit<Task, 'uid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[]
	) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			newTasks.forEach(async (task) => {
				const rowId = crypto.randomUUID();
				const customUid = `task_${projectUid}_${rowId}`;

				const newTaskData: Task = {
					...task,
					uid: customUid,
					createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
					createdBy: userData.user?.uid || '',
					updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
					updatedBy: userData.user?.uid || '',
				}

				// const ref = doc(db, COLLECTION_NAMES.TASKS, customUid);
				// await setDoc(ref, newTaskData);

				dispatch({ type: 'ADD_TASK', payload: newTaskData });
			});
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'タスクの作成中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// タスクの更新
	const updateTasks = useCallback(async (projectUid: string, updateTasks: Task[]) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// 更新対象のプロジェクトUIDに紐づくタスクを全て取得
			const taskCol = collection(db, COLLECTION_NAMES.TASKS);
			const q = query(
				taskCol,
				where('projectUid', '==', projectUid)
			);
			const snapshot = await getDocs(q);
			const existingMap = new Map<string, Task>();
			snapshot.forEach((docSnap) => existingMap.set(docSnap.id, docSnap.data() as Task));

			// 更新データをMap化
			const newMap = new Map(
				updateTasks.map(task => [
					task.uid,
					{
						...task,
						updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
						updatedBy: userData.user?.uid || '',
					}
				])
			);

			// 差分に基づいて追加・更新・削除
			const batch = writeBatch(db);

			// 追加・更新
			for (const [id, task] of newMap) {
				const existing = existingMap.get(id);
				if (!existing || JSON.stringify(existing) !== JSON.stringify(task)) {
					batch.set(doc(taskCol, id), task);
				}
			}

			// 削除
			for (const [id] of existingMap) {
				if (!newMap.has(id)) {
					batch.delete(doc(taskCol, id));
				}
			}

			// 一括コミット
			await batch.commit();

			dispatch({ type: 'SET_TASKS', payload: updateTasks });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'タスクの更新中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// タスクの削除

	return {
		projects: appData.projects,
		tasks: appData.tasks,
		loading: appData.loading,
		error: appData.error,
		fetchProjects,
		addProject,
		updateProject,
		deleteProject,
		addTasks,
		updateTasks,
	};
};