export interface Workspace { base: string; title: string; staff: boolean }
export interface Version { revision: number; author: string | null; image: string | null; body: string | null; external_url: string | null; download: string | null }
export interface Material { id: string; title: string; opens_at: string | null; closes_at: string | null; download_allowed: boolean; versions: Version[] }
export interface Lesson { id: string; title: string; position: number; kind: string; body: string | null; opens_at: string | null; closes_at: string | null; completed_at: string | null; materials: Material[] }
export interface Session { id: string; title: string; starts_at: string; ends_at: string; status: string; meeting_url: string | null; recording_material_id: string | null; mark: string | null }
export interface Choice { id: string; title: string }
