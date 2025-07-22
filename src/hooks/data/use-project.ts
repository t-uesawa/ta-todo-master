import { useApp } from "@/contexts/AppContext"
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase-config";
import { COLLECTION_NAMES, Project, Task } from "@/types";
import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { useCallback, useEffect } from "react";
import dayjs from 'dayjs';

/**
 * プロジェクトのカスタムフック
 */
export const useProject = () => {
	const { state: appData, dispatch } = useApp();
	const { state: userData } = useAuth();

	// プロジェクトの初回取得(タスクを含む)
	const fetchData = async () => {
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

				const tasksSnapshot = await getDocs(
					query(
						collection(db, COLLECTION_NAMES.TASKS),
						where('projectUid', '==', doc.id),
						orderBy('updatedAt', 'asc')
					)
				);
				const tasksData: Task[] = tasksSnapshot.docs.map(doc => {
					const taskData = doc.data() as Task;
					return {
						...taskData,
						uid: doc.id,
					}
				});

				projects.push(project);
				tasks.push(...tasksData);
			});

			dispatch({ type: 'SET_PROJECTS', payload: projects });
			dispatch({ type: 'SET_TASKS', payload: tasks });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'データの取得中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	};
	useEffect(() => {
		if (!userData.user) return;

		// 初回データ取得
		fetchData();
	}, [userData]);

	// プロジェクトの追加
	const addProject = useCallback(async (newProject: Omit<Project, 'uid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const newProjectData = {
				...newProject,
				createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				createdBy: userData.user?.uid || '',
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			}

			const projectRef = collection(db, COLLECTION_NAMES.PROJECTS);
			const docRef = await addDoc(projectRef, newProjectData);

			// uidを含めるため再度更新
			await updateProject(docRef.id, { ...newProjectData, uid: docRef.id });

			dispatch({ type: 'ADD_PROJECT', payload: { ...newProjectData, uid: docRef.id } });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'プロジェクトの作成中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// プロジェクトの更新
	const updateProject = useCallback(async (uid: string, updates: Project) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// 更新対象プロジェクトの取得
			const projectRef = doc(db, COLLECTION_NAMES.PROJECTS, uid);
			const newProjectData = {
				...updates,
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

	return {
		projects: appData.projects,
		tasks: appData.tasks,
		loading: appData.loading,
		error: appData.error,
		addProject,
		updateProject,
		deleteProject,
	};
};