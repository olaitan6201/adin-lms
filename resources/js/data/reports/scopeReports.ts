import { completionByFaculty, engagementMix, enrolmentTrend, examPerformance } from '@/data/reports/analytics';
import { students } from '@/data/reports/students';

export const scopes = ['Institution','Faculty and department','Course','Student'];
export const departments = ['Biological Sciences','Chemistry','Mathematics and Statistics','English and Linguistics','Educational Management','Accounting and Finance','Economics'];
export const participation = departments.map((label,i) => ({ label, value: [71,68,63,48,42,58,51][i], color: ['#10B981','#10B981','#3B82F6','#F59E0B','#F59E0B','#3B82F6','#F43F5E'][i] }));
export const faculty = {
    title: 'Dean and head of department scope', subtitle: 'A dean sees every department in the faculty; a head of department sees only their own',
    columns: ['Unit','Scope owner','Students','Active courses','Attendance below threshold'],
    rows: [
        ['Faculty of Science','Prof. Ernest Oyelaran',612,21,24], ['Faculty of Arts and Education','Dr. Ngozi Iweru',498,18,31],
        ['Faculty of Business and Social Sciences','Dr. Chika Anyaoku',584,23,8], ['Biological Sciences','Dr. Amaka Eze',268,7,11], ['Accounting and Finance','Dr. Kelvin Umeh',402,9,3],
    ],
};
export const heatmap = {
    title: 'Engagement heatmap by department', subtitle: 'Percentage of students active in each measure',
    columns: ['Department','Enrol','Attend','Submit','Exam','Engage'],
    rows: [[92,88,81,74,69],[86,84,72,68,64],[78,71,66,58,61],[84,62,58,51,47],[69,58,54,46,43],[88,79,74,66,72],[71,64,59,52,48]].map((values,i) => [departments[i], ...values]),
};
export const course = {
    title: 'Course report', subtitle: 'Roster, attendance, submissions, mean score and completion for the courses you own',
    columns: ['Code','Course','Roster','Attendance','Submission rate','Mean score','Completion'],
    rows: [
        ['ACC302','Intermediate Financial Accounting',68,'92%','81%',74,'46%'], ['BSC205','Cell and Molecular Biology',54,'96%','100%',71,'61%'],
        ['ENG210','Literary Devices and Criticism',82,'85%','95%',64,'38%'], ['CHM401','Physical Chemistry II',41,'88%','88%',74,'74%'],
        ['EDM505','Curriculum Development',33,'61%','70%',59,'12%'],
    ],
};
export const attention = {
    title: 'Students needing attention', subtitle: 'Low attendance combined with a missed assessment',
    columns: ['Student','Course','Attendance','Missing work','Last activity'],
    rows: students.filter(s => s.attendance < 80).map(s => [`${s.name} · ${s.matric}`, s.programme.split(' ').slice(1,3).join(' '), `${s.attendance}%`, s.attendance < 50 ? 3 : 1, s.attendance < 50 ? '9 days ago' : '2 days ago']),
};
export const progress = {
    title: 'Student progress report', subtitle: 'Registrations, completed lessons, assignments, scores and outstanding work',
    columns: ['Student','Programme','Level','Attendance','GPA','Units earned'],
    rows: students.map(s => [`${s.name} · ${s.matric}`,s.programme,`Level ${s.level}`,`${s.attendance}%`,s.gpa ? s.gpa.toFixed(2) : '–',`${Math.round(s.gpa * 5)} / 20`]),
};
export const courseProgress = course.rows.map((r,i) => ({ label: `${r[0]} ${r[1]}`, value: parseInt(String(r[6])), color: ['#10B981','#3B82F6','#F59E0B','#10B981','#F43F5E'][i] }));

type Sheet = { title: string; columns: string[]; rows: (string | number)[][] };
export function sheets(scope: string): Sheet[] {
    const breakdown = (title: string, unit: string, data: typeof participation) => ({ title, columns: ['Category',unit], rows: data.map(d => [d.label,d.value]) });
    const trend = (title: string, data: typeof enrolmentTrend) => ({ title, columns: ['Period / course', ...data.series.map(s => s.name)], rows: data.labels.map((l,i) => [l, ...data.series.map(s => s.values[i])]) });
    if (scope === scopes[1]) return [heatmap, faculty];
    if (scope === scopes[2]) return [course, attention];
    if (scope === scopes[3]) return [progress, breakdown('Progress by course','Completion (%)',courseProgress)];
    return [trend('Enrolment and delivery',enrolmentTrend), breakdown('Engagement mix','Actions',engagementMix), trend('Examination performance',examPerformance),
        breakdown('Departmental participation','Completed (%)',participation), breakdown('Completion by faculty','Completed (%)',completionByFaculty)];
}
