/**
 * Custom hook for managing workout programs
 */
import { useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useIndexedDB } from '../../../hooks/useIndexedDB';
import { Program, ProgramExercise, ProgramDay } from '../../../types/models';
import { STORES } from '../../../services/db';

// Built-in workout programs
const builtInPrograms: Program[] = [
  {
    id: 'three-day-split',
    name: '3-Day Training Split',
    description: 'A balanced 3-day workout split targeting all major muscle groups with compound and isolation exercises.',
    exercises: [],
    days: [
      {
        id: 'day1',
        name: 'Day 1',
        exercises: [
          { exerciseId: 'squat', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '5-8' },
          { exerciseId: 'pull-ups', targetSets: 4, targetReps: 'max' },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'crunches', targetSets: 3, targetReps: '10-15' },
        ]
      },
      {
        id: 'day2',
        name: 'Day 2',
        exercises: [
          { exerciseId: 'deadlift', targetSets: 4, targetReps: '5-8' },
          { exerciseId: 'overhead-press', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'dumbbell-curl', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'plank', targetSets: 3, targetReps: '30-60s' },
        ]
      },
      {
        id: 'day3',
        name: 'Day 3',
        exercises: [
          { exerciseId: 'front-squat', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'incline-bench-press', targetSets: 4, targetReps: '5-8' },
          { exerciseId: 'pull-ups', targetSets: 4, targetReps: 'max' },
          { exerciseId: 'tricep-dips', targetSets: 3, targetReps: '8-12' },
          { exerciseId: 'bicycle-crunches', targetSets: 3, targetReps: '10-15' },
        ]
      },
    ] as ProgramDay[]
  },
  {
    id: 'beginner-full-body',
    name: 'Beginner Full Body Workout',
    description: 'A comprehensive full-body workout for beginners targeting all major muscle groups.',
    exercises: [
      { exerciseId: 'squat', targetSets: 3, targetReps: '8-12' },
      { exerciseId: 'bench-press', targetSets: 3, targetReps: '8-12' },
      { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '8-12' },
      { exerciseId: 'overhead-press', targetSets: 3, targetReps: '8-12' },
      { exerciseId: 'dumbbell-curl', targetSets: 3, targetReps: '10-15' },
      { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '10-15' },
      { exerciseId: 'plank', targetSets: 3, targetReps: '30-60s' },
    ]
  },
  {
    id: 'upper-lower-split',
    name: 'Upper/Lower Split',
    description: 'A balanced program alternating between upper and lower body training days.',
    exercises: [],
    days: [
      {
        id: 'upper',
        name: 'Upper Body',
        exercises: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'overhead-press', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'pull-ups', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'dumbbell-curl', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'skull-crusher', targetSets: 3, targetReps: '10-12' },
        ]
      },
      {
        id: 'lower',
        name: 'Lower Body',
        exercises: [
          { exerciseId: 'squat', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'romanian-deadlift', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'calf-raise', targetSets: 4, targetReps: '15-20' },
          { exerciseId: 'plank', targetSets: 3, targetReps: '30-60s' },
        ]
      },
    ] as ProgramDay[]
  },
  {
    id: 'push-pull-legs',
    name: 'Push/Pull/Legs Split',
    description: 'A classic bodybuilding split focusing on push, pull, and leg movements over 3 days.',
    exercises: [],
    days: [
      {
        id: 'push',
        name: 'Push',
        exercises: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'incline-dumbbell-press', targetSets: 3, targetReps: '8-12' },
          { exerciseId: 'overhead-press', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'lateral-raise', targetSets: 3, targetReps: '10-15' },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '10-15' },
          { exerciseId: 'overhead-tricep-extension', targetSets: 3, targetReps: '10-15' },
        ]
      },
      {
        id: 'pull',
        name: 'Pull',
        exercises: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '6-8' },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12-15' },
          { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10-12' },
        ]
      },
      {
        id: 'legs',
        name: 'Legs',
        exercises: [
          { exerciseId: 'squat', targetSets: 4, targetReps: '8-10' },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'romanian-deadlift', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'calf-raise', targetSets: 4, targetReps: '15-20' },
          { exerciseId: 'plank', targetSets: 2, targetReps: '30-60s' },
        ]
      },
    ] as ProgramDay[]
  },
  {
    id: 'strength-training',
    name: 'Strength Training Program',
    description: 'A powerlifting-focused program to build strength in the main compound lifts.',
    exercises: [
      { exerciseId: 'squat', targetSets: 5, targetReps: '5' },
      { exerciseId: 'bench-press', targetSets: 5, targetReps: '5' },
      { exerciseId: 'deadlift', targetSets: 5, targetReps: '5' },
      { exerciseId: 'overhead-press', targetSets: 5, targetReps: '5' },
      { exerciseId: 'barbell-row', targetSets: 5, targetReps: '5' },
      { exerciseId: 'pull-ups', targetSets: 3, targetReps: '5-8' },
      { exerciseId: 'dips', targetSets: 3, targetReps: '5-8' },
    ]
  },
  {
    id: 'bodyweight-training',
    name: 'Bodyweight Workout',
    description: 'A full-body workout using only bodyweight exercises, perfect for home workouts.',
    exercises: [
      { exerciseId: 'push-ups', targetSets: 3, targetReps: '10-15' },
      { exerciseId: 'pull-ups', targetSets: 3, targetReps: '8-12' },
      { exerciseId: 'lunges', targetSets: 3, targetReps: '10-12 each leg' },
      { exerciseId: 'plank', targetSets: 3, targetReps: '30-60s' },
      { exerciseId: 'bicycle-crunches', targetSets: 3, targetReps: '15-20' },
      { exerciseId: 'mountain-climbers', targetSets: 3, targetReps: '20-30' },
      { exerciseId: 'tricep-dips', targetSets: 3, targetReps: '10-15' },
    ]
  },
  {
    id: 'five-day-40plus',
    name: '5-Day Recovery-Friendly (40+)',
    description: 'A 5-day program designed for beginners over 40 with limited time. Focus on compounds, recovery, and leaving 1-2 reps in the tank. Upper/Lower style with lighter fifth day.',
    exercises: [],
    days: [
      {
        id: 'day1',
        name: 'Day 1 - Upper A',
        exercises: [
          { exerciseId: 'bench-press', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'angled-t-bar-row', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'overhead-press', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'dumbbell-curl', targetSets: 2, targetReps: '10-12' },
          { exerciseId: 'tricep-pushdown', targetSets: 2, targetReps: '10-12' },
        ]
      },
      {
        id: 'day2',
        name: 'Day 2 - Lower A',
        exercises: [
          { exerciseId: 'squat', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'hack-squat', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'romanian-deadlift', targetSets: 3, targetReps: '8-10' },
          { exerciseId: 'calf-raise', targetSets: 3, targetReps: '12-15' },
          { exerciseId: 'plank', targetSets: 2, targetReps: '20-40s' },
        ]
      },
      {
        id: 'day3',
        name: 'Day 3 - Upper B',
        exercises: [
          { exerciseId: 'incline-bench-press', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 't-bar-row', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'lateral-raise', targetSets: 3, targetReps: '12-15' },
          { exerciseId: 'machine-face-pull', targetSets: 2, targetReps: '12-15' },
        ]
      },
      {
        id: 'day4',
        name: 'Day 4 - Lower B',
        exercises: [
          { exerciseId: 'hack-squat', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'leg-extension', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'romanian-deadlift', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'plank', targetSets: 2, targetReps: '20-40s' },
        ]
      },
      {
        id: 'day5',
        name: 'Day 5 - Upper C',
        exercises: [
          { exerciseId: 'dumbbell-bench-press', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 't-bar-row-close-grip', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'dumbbell-shoulder-press', targetSets: 3, targetReps: '10-12' },
          { exerciseId: 'dumbbell-curl', targetSets: 2, targetReps: '10-12' },
          { exerciseId: 'tricep-pushdown', targetSets: 2, targetReps: '10-12' },
          { exerciseId: 'machine-face-pull', targetSets: 2, targetReps: '15' },
        ]
      },
    ] as ProgramDay[]
  }
];

export function usePrograms() {
  const { 
    items: programsFromDB, 
    loading, 
    error, 
    saveItem, 
    getItem,
    deleteItem,
    loadItems 
  } = useIndexedDB<Program>(STORES.PROGRAMS);

  // Get custom programs (exclude any built-in ones by ID)
  const customPrograms = useMemo(() => {
    const builtInProgramIds = builtInPrograms.map(p => p.id);
    return programsFromDB.filter(p => !builtInProgramIds.includes(p.id));
  }, [programsFromDB]);

  // Get database-saved versions of built-in programs
  const savedBuiltInPrograms = useMemo(() => {
    const builtInProgramIds = builtInPrograms.map(p => p.id);
    return programsFromDB.filter(p => builtInProgramIds.includes(p.id));
  }, [programsFromDB]);

  // Combine programs, prioritizing saved built-in programs over the default ones
  // This ensures we don't duplicate IDs in the list
  const allPrograms = useMemo(() => {
    // Get built-in programs that aren't already in DB
    const unsavedBuiltInPrograms = builtInPrograms.filter(
      p => !savedBuiltInPrograms.some(sp => sp.id === p.id)
    );
    
    // Combine: saved built-ins + unsaved built-ins + custom programs
    return [...savedBuiltInPrograms, ...unsavedBuiltInPrograms, ...customPrograms];
  }, [savedBuiltInPrograms, customPrograms]);

  // Initialize / migrate built-in programs in the database
  useEffect(() => {
    const initializeBuiltInPrograms = async () => {
      if (loading) return;

      let needsReload = false;

      for (const builtIn of builtInPrograms) {
        const saved = savedBuiltInPrograms.find(sp => sp.id === builtIn.id);

        // Missing entirely → save it
        if (!saved) {
          console.log(`Saving missing built-in program: ${builtIn.id}`);
          await saveItem(builtIn);
          needsReload = true;
          continue;
        }

        // Exists but is outdated (has days in code but not in DB, or vice versa)
        const codeHasDays = !!builtIn.days && builtIn.days.length > 0;
        const savedHasDays = !!saved.days && saved.days.length > 0;

        if (codeHasDays && !savedHasDays) {
          console.log(`Migrating built-in program to days structure: ${builtIn.id}`);
          await saveItem(builtIn);
          needsReload = true;
        }
      }

      if (needsReload) {
        await loadItems();
      }
    };
    
    initializeBuiltInPrograms();
  }, [loading, savedBuiltInPrograms, saveItem, loadItems]);

  // Create a new program
  const createProgram = useCallback(async (name: string, description?: string) => {
    if (!name.trim()) {
      return null;
    }

    const newProgram: Program = {
      id: uuidv4(),
      name: name.trim(),
      description: description?.trim(),
      exercises: [],
    };

    const success = await saveItem(newProgram);
    if (success) {
      return newProgram;
    } else {
      return null;
    }
  }, [saveItem]);

  // Add an exercise to a program
  const addExerciseToProgram = useCallback(async (
    programId: string, 
    exerciseId: string, 
    targetSets?: number, 
    targetReps?: string,
    notes?: string
  ) => {
    const program = await getItem(programId);
    
    if (!program) {
      return false;
    }

    const programExercise: ProgramExercise = {
      exerciseId,
      targetSets,
      targetReps,
      notes,
    };

    const updatedProgram: Program = {
      ...program,
      exercises: [...program.exercises, programExercise],
    };

    return await saveItem(updatedProgram);
  }, [getItem, saveItem]);

  // Remove an exercise from a program
  const removeExerciseFromProgram = useCallback(async (
    programId: string,
    exerciseIndex: number
  ) => {
    const program = await getItem(programId);
    
    if (!program) {
      return false;
    }

    const updatedExercises = [...program.exercises];
    updatedExercises.splice(exerciseIndex, 1);

    const updatedProgram: Program = {
      ...program,
      exercises: updatedExercises,
    };

    return await saveItem(updatedProgram);
  }, [getItem, saveItem]);

  // Delete a program
  const deleteProgram = useCallback(async (id: string) => {
    // Check if it's a built-in program
    const isBuiltIn = builtInPrograms.some(p => p.id === id);
    
    if (isBuiltIn) {
      console.log(`Cannot delete built-in program: ${id}`);
      return false;
    }
    
    return await deleteItem(id);
  }, [deleteItem]);

  return {
    programs: allPrograms,
    customPrograms,
    builtInPrograms,
    loading,
    error,
    createProgram,
    addExerciseToProgram,
    removeExerciseFromProgram,
    deleteProgram,
  };
}
