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
import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc, where, writeBatch } from "firebase/firestore";
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
			const newData = {
				...data,
				createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				createdBy: userData.user?.uid || '',
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			}

			const ref = collection(db, COLLECTION_NAMES.PHASE_GROUPS);
			const docRef = await addDoc(ref, newData);

			// uidを含めるため再度更新
			await updatePhaseGroup(docRef.id, { ...newData, uid: docRef.id });

			dispatch({ type: 'ADD_PHASE_GROUP', payload: { ...newData, uid: docRef.id } });
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
			// 更新対象プロジェクトの取得
			const ref = doc(db, COLLECTION_NAMES.PHASE_GROUPS, uid);
			const newData = {
				...updates,
				updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				updatedBy: userData.user?.uid || '',
			};

			await updateDoc(ref, newData);

			dispatch({ type: 'UPDATE_PHASE_GROUP', payload: newData });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'プロジェクトの更新中にエラーが発生しました。';
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
			// トランザクションで削除するフェーズグループに紐づくフェーズとタスクも削除
			const batch = writeBatch(db);

			// グループの削除
			const groupRef = doc(db, COLLECTION_NAMES.PHASE_GROUPS, uid);
			batch.delete(groupRef);

			// 関連フェーズの削除
			let newPhases = appData.phases;
			let newTasks = appData.taskMasters;

			const phasesQuery = query(
				collection(db, COLLECTION_NAMES.PHASES),
				where('parentGroupUid', '==', uid)
			);
			const phaseSnapshot = await getDocs(phasesQuery);
			phaseSnapshot.forEach(async doc => {
				// 関連タスクの削除
				const tasksQuery = query(
					collection(db, COLLECTION_NAMES.TASK_MASTERS),
					where('phaseUid', '==', doc.id)
				);
				const taskSnapshot = await getDocs(tasksQuery);

				taskSnapshot.forEach(doc => {
					batch.delete(doc.ref);
					newTasks = newTasks.filter(t => t.uid !== doc.id);
				});

				batch.delete(doc.ref);
				newPhases = newPhases.filter(p => p.uid !== doc.id);
			});

			await batch.commit();

			dispatch({ type: 'DELETE_PHASE_GROUP', payload: uid });
			dispatch({ type: 'SET_PHASES', payload: newPhases });
			dispatch({ type: 'SET_TASK_MASTERS', payload: newTasks });
		} catch (err) {
			const error = err instanceof Error ? err.message : 'プロジェクトの削除中にエラーが発生しました';
			dispatch({ type: 'SET_ERROR', payload: error });
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [appData.phases, appData.taskMasters, dispatch]);

	// フェーズマスタの追加

	// フェーズマスタの更新

	// フェーズマスタの削除

	// タスクマスタの追加

	// タスクマスタの更新

	// タスクマスタの削除

	return {
		fecthAllMasters,
		addPhaseGroup,
		updatePhaseGroup,
		deletePhaseGroup
	}
}