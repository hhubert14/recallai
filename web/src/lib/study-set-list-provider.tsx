"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { createClient } from "./supabase/client";
import { useAuth } from "./auth-provider";
import type { StudySetSourceType } from "@/clean-architecture/domain/entities/study-set.entity";

// Study set item type for the list
export interface StudySetListItem {
  id: number;
  publicId: string;
  userId: string;
  name: string;
  description: string | null;
  sourceType: StudySetSourceType;
  createdAt: string;
  updatedAt: string;
  questionCount?: number;
  flashcardCount?: number;
}

// Context type
interface StudySetListContextType {
  studySets: StudySetListItem[];
  setInitialStudySets: (studySets: StudySetListItem[]) => void;
  isConnected: boolean;
}

// Create context with undefined default
const StudySetListContext = createContext<StudySetListContextType | undefined>(
  undefined
);

// Payload type from Supabase Realtime (snake_case)
interface RealtimeStudySetPayload {
  id: number;
  public_id: string;
  user_id: string;
  name: string;
  description: string | null;
  source_type: StudySetSourceType;
  created_at: string;
  updated_at: string;
}

// Transform snake_case payload to camelCase
function transformPayload(payload: RealtimeStudySetPayload): StudySetListItem {
  return {
    id: payload.id,
    publicId: payload.public_id,
    userId: payload.user_id,
    name: payload.name,
    description: payload.description,
    sourceType: payload.source_type,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

// Provider component
export function StudySetListProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [studySets, setStudySets] = useState<StudySetListItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Create Supabase client lazily (not at module load time for testability)
  const supabase = useMemo(() => createClient(), []);

  // Set initial study sets (called by pages with server-rendered data)
  const setInitialStudySets = useCallback((initialStudySets: StudySetListItem[]) => {
    setStudySets(initialStudySets);
  }, []);

  // Handle INSERT event
  const handleInsert = useCallback(
    (payload: { new: RealtimeStudySetPayload }) => {
      const newStudySet = transformPayload(payload.new);

      setStudySets((prev) => {
        // Check if already exists (prevent duplicates)
        if (prev.some((s) => s.id === newStudySet.id)) {
          return prev;
        }
        // Add to beginning of list
        return [newStudySet, ...prev];
      });
    },
    []
  );

  // Handle UPDATE event
  const handleUpdate = useCallback(
    (payload: { new: RealtimeStudySetPayload }) => {
      const updatedStudySet = transformPayload(payload.new);

      setStudySets((prev) =>
        prev.map((s) => {
          if (s.id === updatedStudySet.id) {
            // Preserve questionCount and flashcardCount from existing data
            // (these aren't included in realtime payload)
            return {
              ...updatedStudySet,
              questionCount: s.questionCount,
              flashcardCount: s.flashcardCount,
            };
          }
          return s;
        })
      );
    },
    []
  );

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const channel = supabase
      .channel("study_sets_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "study_sets",
          filter: `user_id=eq.${user.id}`,
        },
        handleInsert
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "study_sets",
          filter: `user_id=eq.${user.id}`,
        },
        handleUpdate
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsConnected(false);
        }
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, handleInsert, handleUpdate]);

  const value: StudySetListContextType = {
    studySets,
    setInitialStudySets,
    isConnected,
  };

  return (
    <StudySetListContext.Provider value={value}>
      {children}
    </StudySetListContext.Provider>
  );
}

// Custom hook to use the context
export function useStudySetList() {
  const context = useContext(StudySetListContext);
  if (context === undefined) {
    throw new Error(
      "useStudySetList must be used within a StudySetListProvider"
    );
  }
  return context;
}
