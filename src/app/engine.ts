import { createPreviewEngine, createReducer, createResolver, createRulesEngine } from '@/engine';

export const previewEngine = createPreviewEngine();
export const rulesEngine = createRulesEngine();
export const reducer = createReducer();
export const resolver = createResolver();
