/**
 * ・フェーズグループマスタ
 * ・フェーズマスタ
 * ・タスクマスタ
 */

import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase-config";
import { COLLECTION_NAMES, Phase, PhaseGroup, TaskMaster } from "@/types";
import dayjs from "dayjs";
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { useCallback } from "react";

export const useMaster = () => {
	const { state: appData, dispatch } = useApp();
	const { state: userData } = useAuth();

	// 全マスタの取得
	const fecthAllMasters = async () => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const groupsSnapshot = await getDocs(
				query(
					collection(db, COLLECTION_NAMES.PHASE_GROUPS),
					orderBy('updatedAt', 'asc')
				)
			);
			const phasesSnapshot = await getDocs(
				query(
					collection(db, COLLECTION_NAMES.PHASES),
					orderBy('updatedAt', 'asc')
				)
			);
			const tasksSnapshot = await getDocs(
				query(
					collection(db, COLLECTION_NAMES.TASK_MASTERS),
					orderBy('updatedAt', 'asc')
				)
			);

			const groupsData = groupsSnapshot.docs.map(doc => doc.data() as PhaseGroup);
			const phasesData = phasesSnapshot.docs.map(doc => doc.data() as Phase);
			const tasksData = tasksSnapshot.docs.map(doc => doc.data() as TaskMaster);

			dispatch({ type: 'SET_PHASE_GROUPS', payload: groupsData });
			dispatch({ type: 'SET_PHASES', payload: phasesData });
			dispatch({ type: 'SET_TASK_MASTERS', payload: tasksData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'マスタの取得中にエラーが発生しました';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}

	// グループマスタの追加
	const addPhaseGroup = useCallback(async (data: Omit<PhaseGroup, 'uid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const rawId = crypto.randomUUID();
			const customUid = `pg-${rawId}`;

			const newData: PhaseGroup = {
				...data,
				uid: customUid,
				createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				createdBy: userData.user?.uid || '',
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			}

			const ref = doc(db, COLLECTION_NAMES.PHASE_GROUPS, customUid);
			await setDoc(ref, newData);

			dispatch({ type: 'ADD_PHASE_GROUP', payload: newData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'フェーズグループの作成中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// グループマスタの更新
	const updatePhaseGroup = useCallback(async (uid: string, updates: PhaseGroup) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// 更新対象の取得
			const ref = doc(db, COLLECTION_NAMES.PHASE_GROUPS, uid);
			const newData = {
				...updates,
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			};

			await updateDoc(ref, newData);

			dispatch({ type: 'UPDATE_PHASE_GROUP', payload: newData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'フェーズグループの更新中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// グループマスタの削除
	const deletePhaseGroup = useCallback(async (uid: string) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			let phases = appData.phases;
			let tasks = appData.taskMasters;

			// Firestoreコレクション参照
			const groupCol = collection(db, COLLECTION_NAMES.PHASE_GROUPS);
			const phaseCol = collection(db, COLLECTION_NAMES.PHASES);
			const taskCol = collection(db, COLLECTION_NAMES.TASK_MASTERS);

			// Firestore バッチ処理
			const batch = writeBatch(db);

			// 1. フェーズ取得（グループに紐づく）
			const phaseQuery = query(phaseCol, where('parentGroupUid', '==', uid));
			const phaseSnapshot = await getDocs(phaseQuery);

			for (const phaseDoc of phaseSnapshot.docs) {
				const phaseId = phaseDoc.id;

				// 2. タスク取得（フェーズに紐づく）
				const taskQuery = query(taskCol, where('phaseUid', '==', phaseId));
				const taskSnapshot = await getDocs(taskQuery);

				for (const taskDoc of taskSnapshot.docs) {
					batch.delete(doc(taskCol, taskDoc.id)); // タスク削除
					tasks = tasks.filter(t => t.uid !== taskDoc.id);
				}

				batch.delete(doc(phaseCol, phaseId)); // フェーズ削除
				phases = phases.filter(p => p.uid !== phaseDoc.id);
			}

			// 3. 子グループ取得（親グループに紐づく）
			const childGroupQuery = query(groupCol, where('parentGroupUid', '==', uid));
			const childGroupSnapshot = await getDocs(childGroupQuery);

			for (const childGroupDoc of childGroupSnapshot.docs) {
				await deletePhaseGroup(childGroupDoc.id); // 再帰で子グループ処理
			}

			// 4. 最後にこのグループ自体を削除
			batch.delete(doc(groupCol, uid));

			// 5. 一括で削除を実行
			await batch.commit();
			console.log(`Deleted group ${uid} and all descendants`);

			dispatch({ type: 'DELETE_PHASE_GROUP', payload: uid });
			dispatch({ type: 'SET_PHASES', payload: phases });
			dispatch({ type: 'SET_TASK_MASTERS', payload: tasks });
		} catch (err) {
			const error = err instanceof Error ? err.message : 'フェーズグループの削除中にエラーが発生しました';
			dispatch({ type: 'SET_ERROR', payload: error });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [appData.phases, appData.taskMasters, dispatch]);

	// フェーズマスタの追加
	const addPhase = useCallback(async (data: Omit<Phase, 'uid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const rawId = crypto.randomUUID();
			const customUid = `p-${rawId}`;

			const newData: Phase = {
				...data,
				uid: customUid,
				createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				createdBy: userData.user?.uid || '',
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			}

			const ref = doc(db, COLLECTION_NAMES.PHASES, customUid);
			await setDoc(ref, newData);

			dispatch({ type: 'ADD_PHASE', payload: newData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'フェーズの作成中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// フェーズマスタの更新
	const updatePhase = useCallback(async (uid: string, updates: Phase) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// 更新対象の取得
			const ref = doc(db, COLLECTION_NAMES.PHASES, uid);
			const newData = {
				...updates,
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			};

			await updateDoc(ref, newData);

			dispatch({ type: 'UPDATE_PHASE', payload: newData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'フェーズの更新中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// フェーズマスタの削除
	const deletePhase = useCallback(async (uid: string) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			let tasks = appData.taskMasters;

			// Firestoreコレクション参照
			const phaseCol = collection(db, COLLECTION_NAMES.PHASES);
			const taskCol = collection(db, COLLECTION_NAMES.TASK_MASTERS);

			// Firestore バッチ処理
			const batch = writeBatch(db);

			// 1. タスク取得（フェーズに紐づく）
			const taskQuery = query(taskCol, where('phaseUid', '==', uid));
			const taskSnapshot = await getDocs(taskQuery);

			for (const taskDoc of taskSnapshot.docs) {
				batch.delete(doc(taskCol, taskDoc.id)); // タスク削除
				tasks = tasks.filter(t => t.uid !== taskDoc.id);
			}

			// 2. 最後にフェーズ自体を削除
			batch.delete(doc(phaseCol, uid));

			// 3. 一括で削除を実行
			await batch.commit();
			console.log(`Deleted phase ${uid} and all descendants`);

			dispatch({ type: 'DELETE_PHASE', payload: uid });
			dispatch({ type: 'SET_TASK_MASTERS', payload: tasks });
		} catch (err) {
			const error = err instanceof Error ? err.message : 'フェーズグループの削除中にエラーが発生しました';
			dispatch({ type: 'SET_ERROR', payload: error });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [appData.taskMasters, dispatch]);

	// タスクマスタの追加
	const addTask = useCallback(async (data: Omit<TaskMaster, 'uid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const rawId = crypto.randomUUID();
			const customUid = `tm-${rawId}`;

			const newData: TaskMaster = {
				...data,
				uid: customUid,
				createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				createdBy: userData.user?.uid || '',
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			}

			const ref = doc(db, COLLECTION_NAMES.TASK_MASTERS, customUid);
			await setDoc(ref, newData);

			dispatch({ type: 'ADD_TASK_MASTER', payload: newData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'タスクマスタの作成中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// タスクマスタの更新
	const updateTask = useCallback(async (uid: string, updates: TaskMaster) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			// 更新対象の取得
			const ref = doc(db, COLLECTION_NAMES.TASK_MASTERS, uid);
			const newData = {
				...updates,
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			};

			await updateDoc(ref, newData);

			dispatch({ type: 'UPDATE_TASK_MASTER', payload: newData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'タスクマスタの更新中にエラーが発生しました。';
			dispatch({ type: 'SET_ERROR', payload: errMsg });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// タスクマスタの削除
	const deleteTask = useCallback(async (uid: string) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			await deleteDoc(doc(db, COLLECTION_NAMES.TASK_MASTERS, uid));

			dispatch({ type: 'DELETE_TASK_MASTER', payload: uid });
		} catch (err) {
			const error = err instanceof Error ? err.message : 'タスクマスタの削除中にエラーが発生しました';
			dispatch({ type: 'SET_ERROR', payload: error });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [dispatch]);

	return {
		phaseGroups: appData.phaseGroups,
		phases: appData.phases,
		taskMasters: appData.taskMasters,
		loading: appData.loading,
		error: appData.error,
		fecthAllMasters,
		addPhaseGroup,
		updatePhaseGroup,
		deletePhaseGroup,
		addPhase,
		updatePhase,
		deletePhase,
		addTask,
		updateTask,
		deleteTask
	};
}