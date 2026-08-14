import { create } from "zustand";

import { EditorState } from "@/types/store";

export const useEditorStore = create<EditorState>((set) => ({
  activePdfId: null,
  fileName: "Untitled",
  draftHtml: "",
  isDirty: false,
  history: [],
  future: [],

  contextFiles: [],
  isContext: false,

  isSidebarOpen: false,

  status: "idle",
  promptValue: "",
  selectedId: "",
  selectedText: "",
  originalElementHtml: "",
  aiResponse: "",
  showAiResponse: false,

  initializeEditor: ({ id, fileName, html, isContext = false }) =>
    set({
      activePdfId: id,
      fileName,
      draftHtml: html,
      isContext,
      status: "prompt",
      isDirty: false,
      history: [],
      future: [],
      selectedId: "",
      selectedText: "",
      showAiResponse: false,
    }),

  resetEditor: () =>
    set({
      activePdfId: null,
      fileName: "Untitled",
      draftHtml: "",
      isDirty: false,
      history: [],
      future: [],
      contextFiles: [],
      isContext: false,
      status: "idle",
      promptValue: "",
      selectedId: "",
      selectedText: "",
      aiResponse: "",
      showAiResponse: false,
      isSidebarOpen: false,
    }),

  updateDraftHtml: (html) =>
    set((state) => ({
      draftHtml: html,
      isDirty: true,
      history: state.draftHtml && state.draftHtml !== html
        ? [...state.history.slice(-49), state.draftHtml]
        : state.history,
      future: [],
    })),

  updateFileName: (name) => set({ fileName: name, isDirty: true }),

  markSaved: () => set({ isDirty: false }),

  undo: () => set((state) => {
    const previous = state.history.at(-1);
    if (!previous) return state;
    return {
      draftHtml: previous,
      history: state.history.slice(0, -1),
      future: [state.draftHtml, ...state.future].slice(0, 50),
      isDirty: true,
      selectedId: "",
      selectedText: "",
      showAiResponse: false,
    };
  }),

  redo: () => set((state) => {
    const next = state.future[0];
    if (!next) return state;
    return {
      draftHtml: next,
      history: [...state.history.slice(-49), state.draftHtml],
      future: state.future.slice(1),
      isDirty: true,
      selectedId: "",
      selectedText: "",
      showAiResponse: false,
    };
  }),

  setContextFiles: (files) => set({ contextFiles: files }),

  setIsContext: (isContext) => set({ isContext }),

  toggleSidebar: (isOpen) =>
    set((state) => ({
      isSidebarOpen: isOpen ?? !state.isSidebarOpen,
    })),

  selectElement: (id, text, outerHtml) =>
    set({
      selectedId: id,
      selectedText: text,
      originalElementHtml: outerHtml,
      status: "prompt",
      showAiResponse: false,
      promptValue: "",
      isSidebarOpen: true,
    }),

  clearSelection: () =>
    set({
      selectedId: "",
      selectedText: "",
      originalElementHtml: "",
      promptValue: "",
      showAiResponse: false,
      status: "prompt",
    }),

  setPromptValue: (val) => set({ promptValue: val }),

  setAiStatus: (status) =>
    set({
      status,
      showAiResponse: status === "aiResult",
    }),

  setAiResponse: (response) => set({ aiResponse: response }),
}));
