import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Project, Task, PhaseGroup, Phase, TaskMaster, Construction, TaskFilter } from '../types';
import { mockProjects, mockTasks, mockPhaseGroups, mockPhases, mockTaskMasters, mockConstructions } from '../data/mockData';

interface AppState {
  projects: Project[];
  tasks: Task[];
  phaseGroups: PhaseGroup[];
  phases: Phase[];
  taskMasters: TaskMaster[];
  constructions: Construction[];
  taskFilter: TaskFilter;
}

type AppAction = 
  | { type: 'SET_TASK_FILTER'; payload: TaskFilter }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_PHASE_GROUP'; payload: PhaseGroup }
  | { type: 'UPDATE_PHASE_GROUP'; payload: PhaseGroup }
  | { type: 'DELETE_PHASE_GROUP'; payload: string }
  | { type: 'ADD_PHASE'; payload: Phase }
  | { type: 'UPDATE_PHASE'; payload: Phase }
  | { type: 'DELETE_PHASE'; payload: string }
  | { type: 'ADD_TASK_MASTER'; payload: TaskMaster }
  | { type: 'UPDATE_TASK_MASTER'; payload: TaskMaster }
  | { type: 'DELETE_TASK_MASTER'; payload: string };

const initialState: AppState = {
  projects: mockProjects,
  tasks: mockTasks,
  phaseGroups: mockPhaseGroups,
  phases: mockPhases,
  taskMasters: mockTaskMasters,
  constructions: mockConstructions,
  taskFilter: {}
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TASK_FILTER':
      return {
        ...state,
        taskFilter: action.payload
      };
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.uid === action.payload.uid ? action.payload : p
        )
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.uid !== action.payload)
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => 
          t.uid === action.payload.uid ? action.payload : t
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.uid !== action.payload)
      };
    case 'ADD_PHASE_GROUP':
      return {
        ...state,
        phaseGroups: [...state.phaseGroups, action.payload]
      };
    case 'UPDATE_PHASE_GROUP':
      return {
        ...state,
        phaseGroups: state.phaseGroups.map(pg => 
          pg.uid === action.payload.uid ? action.payload : pg
        )
      };
    case 'DELETE_PHASE_GROUP':
      return {
        ...state,
        phaseGroups: state.phaseGroups.filter(pg => pg.uid !== action.payload)
      };
    case 'ADD_PHASE':
      return {
        ...state,
        phases: [...state.phases, action.payload]
      };
    case 'UPDATE_PHASE':
      return {
        ...state,
        phases: state.phases.map(p => 
          p.uid === action.payload.uid ? action.payload : p
        )
      };
    case 'DELETE_PHASE':
      return {
        ...state,
        phases: state.phases.filter(p => p.uid !== action.payload)
      };
    case 'ADD_TASK_MASTER':
      return {
        ...state,
        taskMasters: [...state.taskMasters, action.payload]
      };
    case 'UPDATE_TASK_MASTER':
      return {
        ...state,
        taskMasters: state.taskMasters.map(tm => 
          tm.uid === action.payload.uid ? action.payload : tm
        )
      };
    case 'DELETE_TASK_MASTER':
      return {
        ...state,
        taskMasters: state.taskMasters.filter(tm => tm.uid !== action.payload)
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}