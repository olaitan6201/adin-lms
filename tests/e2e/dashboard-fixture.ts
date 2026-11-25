import { randomUUID } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function dashboardWeek(project: string): () => void {
    const database = realpathSync(resolve(process.env.PORTAL_E2E_RUN!, 'portal.sqlite'));
    if (!database.startsWith(realpathSync('.agent-work/browser-tests') + sep + 'run-')) {
        throw new Error('Dashboard fixtures require the disposable browser database.');
    }
    const db = new DatabaseSync(database);
    const rows: [string, string][] = [];
    function insert(table: string, fields: string, values: string, ...args: string[]) {
        const id = randomUUID();
        db.prepare(`INSERT INTO ${table} (id, ${fields}) VALUES (?, ${values})`).run(id, ...args);
        rows.unshift([table, id]);
        return id;
    }
    db.exec('BEGIN');
    try {
        const context = db.prepare(`SELECT b.id AS book, o.id AS offering, m.id AS lesson, e.id AS member, u.id AS learner,
            a.id AS assignment FROM offerings o JOIN modules m ON m.offering_id=o.id JOIN gradebooks b ON b.offering_id=o.id
            JOIN assessment_items i ON i.gradebook_id=b.id JOIN assignments a ON a.item_id=i.id JOIN enrolments e ON e.offering_id=o.id
            JOIN students s ON s.id=e.student_id JOIN users u ON u.id=s.user_id
            WHERE o.external_offering_id=? AND u.email=?
            ORDER BY m.position LIMIT 1`).get(`Z-CSC101-dashboard-${project}`, `dashboard-learner-${project}@demo.example.test`) as Record<string, string>;
        const sub = insert('submissions', 'assignment_id,enrolment_id', '?,?', context.assignment, context.member);
        insert('submission_versions', 'submission_id,revision,receipt,submitted_at,submitted_by', "?,1,?,datetime('now','-1 hour'),?", sub, randomUUID(), context.learner);
        for (const [title, future] of [['Scheduled writing paper', true], ['Morning paper', false]] as const) {
            const item = insert('assessment_items', 'gradebook_id,title,kind,weight_percent,maximum_score', "?,?,'exam',0,10", context.book, title);
            const exam = insert('examinations', 'item_id,opens_at,closes_at,duration_seconds,max_attempts,shuffle_options',
                `?,datetime('now',?),datetime('now',?),600,1,0`, item, future ? '+1 day' : '-1 day', future ? '+2 days' : '-1 hour');
            if (!future) insert('examination_attempts', 'exam_id,enrolment_id,ordinal,started_at,expires_at,state,submitted_at',
                "?,?,1,datetime('now','-2 hours'),datetime('now','-110 minutes'),'submitted',datetime('now','-115 minutes')", exam, context.member);
        }
        insert('announcements', 'offering_id,author_id,body,published_at', "?,?,'Read the field guide before Friday.',datetime('now')", context.offering, context.learner);
        insert('lesson_progress', 'enrolment_id,module_id,last_seen,completed_at', "?,?,datetime('now'),datetime('now')", context.member, context.lesson);
        db.exec('COMMIT');
    } catch (error) {
        db.exec('ROLLBACK');
        db.close();
        throw error;
    }
    return () => {
        for (const [table, id] of rows) db.prepare(`DELETE FROM ${table} WHERE id=?`).run(id);
        db.close();
    };
}
