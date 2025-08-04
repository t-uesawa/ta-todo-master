/**
 * ・フェーズグループマスタ
 * ・フェーズマスタ
 * ・タスクマスタ
 */

import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase-config";
import { generateUid } from "@/lib/generateUid";
import { COLLECTION_NAMES, Phase, PhaseGroup, TaskMaster } from "@/types";
import dayjs from "dayjs";
import { collection, doc, getDocs, orderBy, query, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { useCallback } from "react";

export const useMaster = () => {
	const { state: appData, dispatch } = useApp();
	const { state: userData } = useAuth();

	// 全マスタの取得
	const fetchAllMasters = async () => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const groupsSnapshot = await getDocs(
				query(
					collection(db, COLLECTION_NAMES.PHASE_GROUPS),
					where('deletedAt', '==', ''),
					orderBy('createdAt', 'asc')
				)
			);
			const phasesSnapshot = await getDocs(
				query(
					collection(db, COLLECTION_NAMES.PHASES),
					where('deletedAt', '==', ''),
					orderBy('createdAt', 'asc')
				)
			);
			const tasksSnapshot = await getDocs(
				query(
					collection(db, COLLECTION_NAMES.TASK_MASTERS),
					where('deletedAt', '==', ''),
					orderBy('createdAt', 'asc')
				)
			);

			const groupsData = groupsSnapshot.docs.map(doc => doc.data() as PhaseGroup);
			const phasesData = phasesSnapshot.docs.map(doc => doc.data() as Phase);
			const tasksData = tasksSnapshot.docs.map(doc => doc.data() as TaskMaster);

			console.log(`get masters count: ${groupsData.length + phasesData.length + tasksData.length}`)

			dispatch({ type: 'SET_PHASE_GROUPS', payload: groupsData });
			dispatch({ type: 'SET_PHASES', payload: phasesData });
			dispatch({ type: 'SET_TASK_MASTERS', payload: tasksData });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'マスタの取得中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}

	// グループマスタの追加
	const addPhaseGroup = useCallback(async (data: Omit<PhaseGroup, 'uid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';
			const uid = generateUid();
			const customUid = `pg-${uid}`;


			const newData: PhaseGroup = {
				...data,
				uid: customUid,
				createdAt: now,
				createdBy: userUid,
				updatedAt: now,
				updatedBy: userUid,
				deletedAt: '',
				deletedBy: '',
			}

			const ref = doc(db, COLLECTION_NAMES.PHASE_GROUPS, customUid);
			await setDoc(ref, newData);

			dispatch({ type: 'ADD_PHASE_GROUP', payload: newData });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'フェーズグループの作成中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// グループマスタの更新
	const updatePhaseGroup = useCallback(async (uid: string, updates: PhaseGroup) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';

			// 更新対象の取得
			const ref = doc(db, COLLECTION_NAMES.PHASE_GROUPS, uid);
			const newData = {
				...updates,
				updatedAt: now,
				updatedBy: userUid,
			};

			await updateDoc(ref, newData);

			dispatch({ type: 'UPDATE_PHASE_GROUP', payload: newData });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'フェーズグループの更新中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// グループマスタの削除(フェーズもタスクも削除)
	const deletePhaseGroup = useCallback(async (deleteGroup: PhaseGroup) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';

			let phases = appData.phases;
			let tasks = appData.taskMasters;

			// Firestoreコレクション参照
			const groupCol = collection(db, COLLECTION_NAMES.PHASE_GROUPS);
			const phaseCol = collection(db, COLLECTION_NAMES.PHASES);
			const taskCol = collection(db, COLLECTION_NAMES.TASK_MASTERS);

			// Firestore バッチ処理
			const batch = writeBatch(db);

			// 1. フェーズ取得（グループに紐づく）
			const phaseQuery = query(phaseCol, where('parentGroupUid', '==', deleteGroup.uid));
			const phaseSnapshot = await getDocs(phaseQuery);

			for (const phaseDoc of phaseSnapshot.docs) {
				const phaseId = phaseDoc.id;
				const phase = phaseDoc.data() as Phase;

				// 2. タスク取得（フェーズに紐づく）
				const taskQuery = query(taskCol, where('phaseUid', '==', phaseId));
				const taskSnapshot = await getDocs(taskQuery);

				for (const taskDoc of taskSnapshot.docs) {
					const task = taskDoc.data() as TaskMaster;
					batch.update(
						doc(taskCol, taskDoc.id),
						{ ...task, deletedAt: now, deletedBy: userUid }
					); // タスク削除
					tasks = tasks.filter(t => t.uid !== taskDoc.id);
				}

				batch.update(doc(phaseCol, phaseId), { ...phase, deletedAt: now, deletedBy: userUid }); // フェーズ削除
				phases = phases.filter(p => p.uid !== phaseDoc.id);
			}

			// 3. 子グループ取得（親グループに紐づく）
			const childGroupQuery = query(groupCol, where('parentGroupUid', '==', deleteGroup.uid));
			const childGroupSnapshot = await getDocs(childGroupQuery);

			for (const childGroupDoc of childGroupSnapshot.docs) {
				await deletePhaseGroup(childGroupDoc.data() as PhaseGroup); // 再帰で子グループ処理
			}

			// 4. 最後にこのグループ自体を削除
			batch.update(doc(groupCol, deleteGroup.uid), { ...deleteGroup, });

			// 5. 一括で削除を実行
			await batch.commit();
			console.log(`Deleted group ${deleteGroup.groupName} and all descendants`);

			dispatch({ type: 'DELETE_PHASE_GROUP', payload: deleteGroup.uid });
			dispatch({ type: 'SET_PHASES', payload: phases });
			dispatch({ type: 'SET_TASK_MASTERS', payload: tasks });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'フェーズグループの削除中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, appData.phases, appData.taskMasters, dispatch]);

	// フェーズマスタの追加
	const addPhase = useCallback(async (data: Omit<Phase, 'uid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';
			const uid = generateUid();
			const customUid = `p-${uid}`;

			const newData: Phase = {
				...data,
				uid: customUid,
				createdAt: now,
				createdBy: userUid,
				updatedAt: now,
				updatedBy: userUid,
				deletedAt: '',
				deletedBy: '',
			}

			const ref = doc(db, COLLECTION_NAMES.PHASES, customUid);
			await setDoc(ref, newData);

			dispatch({ type: 'ADD_PHASE', payload: newData });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'フェーズの作成中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// フェーズマスタの更新
	const updatePhase = useCallback(async (uid: string, updates: Phase) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';

			// 更新対象の取得
			const ref = doc(db, COLLECTION_NAMES.PHASES, uid);
			const newData = {
				...updates,
				updatedAt: now,
				updatedBy: userUid,
			};

			await updateDoc(ref, newData);

			dispatch({ type: 'UPDATE_PHASE', payload: newData });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'フェーズの更新中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// フェーズマスタの削除
	const deletePhase = useCallback(async (deletePhase: Phase) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';
			let tasks = appData.taskMasters;

			// Firestoreコレクション参照
			const phaseCol = collection(db, COLLECTION_NAMES.PHASES);
			const taskCol = collection(db, COLLECTION_NAMES.TASK_MASTERS);

			// Firestore バッチ処理
			const batch = writeBatch(db);

			// 1. タスク取得（フェーズに紐づく）
			const taskQuery = query(taskCol, where('phaseUid', '==', deletePhase.uid));
			const taskSnapshot = await getDocs(taskQuery);

			for (const taskDoc of taskSnapshot.docs) {
				const task = taskDoc.data() as TaskMaster;
				batch.update(doc(taskCol, taskDoc.id), { ...task, deletedAt: now, deletedBy: userUid }); // タスク削除
				tasks = tasks.filter(t => t.uid !== taskDoc.id);
			}

			// 2. 最後にフェーズ自体を削除
			batch.update(doc(phaseCol, deletePhase.uid), { ...deletePhase, deletedAt: now, deletedBy: userUid });

			// 3. 一括で削除を実行
			await batch.commit();
			console.log(`Deleted phase ${deletePhase.phaseName} and all descendants`);

			dispatch({ type: 'DELETE_PHASE', payload: deletePhase.uid });
			dispatch({ type: 'SET_TASK_MASTERS', payload: tasks });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'フェーズグループの削除中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, appData.taskMasters, dispatch]);

	// タスクマスタの追加
	const addTask = useCallback(async (data: Omit<TaskMaster, 'uid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';
			const uid = generateUid();
			const customUid = `tm-${uid}`;

			const newData: TaskMaster = {
				...data,
				uid: customUid,
				createdAt: now,
				createdBy: userUid,
				updatedAt: now,
				updatedBy: userUid,
				deletedAt: '',
				deletedBy: '',
			}

			const ref = doc(db, COLLECTION_NAMES.TASK_MASTERS, customUid);
			await setDoc(ref, newData);

			dispatch({ type: 'ADD_TASK_MASTER', payload: newData });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'タスクマスタの作成中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// タスクマスタの更新
	const updateTask = useCallback(async (uid: string, updates: TaskMaster) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';

			// 更新対象の取得
			const ref = doc(db, COLLECTION_NAMES.TASK_MASTERS, uid);
			const newData = {
				...updates,
				updatedAt: now,
				updatedBy: userUid,
			};

			await updateDoc(ref, newData);

			dispatch({ type: 'UPDATE_TASK_MASTER', payload: newData });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'タスクマスタの更新中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	// タスクマスタの削除
	const deleteTask = useCallback(async (deleteTask: TaskMaster) => {
		dispatch({ type: 'SET_LOADING', payload: true });
		dispatch({ type: 'SET_ERROR', payload: null });

		try {
			const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
			const userUid = userData.user?.uid || '';

			await updateDoc(doc(db, COLLECTION_NAMES.TASK_MASTERS, deleteTask.uid), { ...deleteTask, deletedAt: now, deletedBy: userUid });

			dispatch({ type: 'DELETE_TASK_MASTER', payload: deleteTask.uid });
		} catch (err) {
			console.error(err);
			dispatch({ type: 'SET_ERROR', payload: 'タスクマスタの削除中にエラーが発生しました。' });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [userData, dispatch]);

	return {
		constructions: appData.constructions,
		phaseGroups: appData.phaseGroups,
		phases: appData.phases,
		taskMasters: appData.taskMasters,
		loading: appData.loading,
		error: appData.error,
		fetchAllMasters,
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