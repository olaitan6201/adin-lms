export interface Bank { id: string; name: string; course: string; questions: number; types: string; updated: string; security: string }
export interface Question { id: string; no: number; type: string; stem: string; marks: number; difficulty: string; answered: number }
export interface Exam { id: string; title: string; course: string; date: string; duration: string; candidates: number; attempts: number; state: string; release: string; config?: Record<string,string> }
export interface BlueprintSection { section: string; items: number; marks: number; type: string }
export interface LogEntry { time: string; event: string; actor: string; level: string }
export interface BlueprintData {
    examBlueprint: BlueprintSection[]; papersByExam: Record<string,string[][]>; accommodations: Record<string,number>;
    defaultCourse: string; duration: string; opens: string; closes: string;
}
