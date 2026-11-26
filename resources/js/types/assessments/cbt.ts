export interface Bank { id: string; name: string; course: string; questions: number; types: string; updated: string; security: string }
export interface Question { id: string; no: number; type: string; stem: string; marks: number; difficulty: string; answered: number }
export interface ExamWindow { opens: string; closes: string }
export interface Exam { id: string; title: string; course: string; date: string; window: ExamWindow; duration: string; candidates: number; attempts: number; state: string; release: string; config?: Record<string,string> }
export type SittingDraft = Pick<Exam, 'title' | 'course' | 'duration' | 'date' | 'window' | 'config'>;
export type BankDraft = Pick<Bank, 'name' | 'course' | 'types' | 'security'>;
export interface BlueprintSection { section: string; items: number; marks: number; type: string }
export interface LogEntry { time: string; event: string; actor: string; level: string }
export interface BlueprintData {
    examBlueprint: BlueprintSection[]; papersByExam: Record<string,string[][]>; accommodations: Record<string,number>;
    defaultCourse: string; duration: string; opens: string; closes: string;
}
