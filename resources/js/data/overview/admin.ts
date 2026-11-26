export const enrolmentTrend = {
  labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  series: [
    { name: 'Registered students', values: [1180, 1264, 1352, 1401, 1448, 1496, 1533, 1578, 1622, 1651, 1678, 1694], color: '#10B981' },
    { name: 'Active courses', values: [42, 48, 53, 56, 61, 64, 68, 71, 74, 76, 78, 79], color: '#33475F' }
  ]
} as const;

export const completionByFaculty = [
  { label: 'Faculty of Science', value: 61, color: '#10B981' },
  { label: 'Faculty of Arts and Education', value: 48, color: '#3B82F6' },
  { label: 'Faculty of Business and Social Sciences', value: 54, color: '#F59E0B' }
] as const;

export const approvals = [
  { id: 'ap-1', item: 'Course approval: ECN221 Econometrics', kind: 'Curriculum', requester: 'Dr. Uche Okonkwo', age: '2 days', level: 'high' },
  { id: 'ap-2', item: 'Assessment weight change: CHM401', kind: 'Gradebook', requester: 'Dr. Grace Mbeki', age: '6 hours', level: 'medium' },
  { id: 'ap-3', item: 'Oluwaseun Ajayi - profile matric number correction', kind: 'Student record', requester: 'Registrar', age: '1 day', level: 'medium' },
  { id: 'ap-4', item: 'Instructor allocation for ECN104', kind: 'Course delivery', requester: 'Dr. Chika Anyaoku', age: '3 days', level: 'high' }
] as const;

export const activityFeed = [
  { who: 'Dr. Grace Mbeki', action: 'published Week 5 content in CHM401', when: '8 min ago' },
  { who: 'Registrar', action: 'imported 142 student records from the enrolment feed', when: '42 min ago' },
  { who: 'Dr. Peter Adeyemi', action: 'approved 24 submissions with written feedback', when: '1 h ago' },
  { who: 'ICT Directorate', action: 'changed the default upload limit to 200 MB', when: '3 h ago' },
  { who: 'Mrs. Bisi Afolabi', action: 'scheduled the mid-term examination for ACC302', when: '5 h ago' },
  { who: 'QA Unit', action: 'opened a review on 6 student profile changes', when: 'Yesterday' }
] as const;

export const performanceMetrics = [
  { metric: 'Median page response', value: '1.4 s', target: '< 3 s', state: 'good' },
  { metric: 'Search response (p95)', value: '0.6 s', target: '< 1 s', state: 'good' },
  { metric: 'Peak CBT submission throughput', value: '412 / min', target: '350 / min', state: 'good' },
  { metric: 'Monthly availability', value: '99.72 %', target: '99.5 %', state: 'good' },
  { metric: 'Backup verification pass rate', value: '98.1 %', target: '100 %', state: 'watch' },
  { metric: 'Storage consumed', value: '68 %', target: '< 80 %', state: 'watch' }
] as const;

export const tiles = [
    {
      label: 'Registered students',
      value: '1,694',
      delta: '+6.2%',
      deltaLabel: 'vs last session',
      icon: 'users',
      spark: { values: [1180, 1264, 1352, 1401, 1448, 1496, 1533, 1578, 1622, 1651, 1678, 1694], color: '#10B981' }
    },
    {
      label: 'Active course offerings',
      value: '79',
      delta: '+8',
      deltaLabel: 'this semester',
      icon: 'book',
      spark: { values: [42, 48, 53, 56, 61, 64, 68, 71, 74, 76, 78, 79], color: '#33475F' }
    },
    {
      label: 'Active lecturers',
      value: '96',
      delta: '+11',
      deltaLabel: 'since September',
      icon: 'graduation',
      spark: { values: [64, 68, 71, 74, 78, 81, 85, 88, 90, 93, 95, 96], color: '#3B82F6' }
    },
    {
      label: 'Material completed',
      value: '61%',
      delta: '+6 pts',
      deltaLabel: 'vs 2024/2025',
      icon: 'layers',
      spark: { values: [42, 46, 48, 51, 54, 57, 61], color: '#F59E0B' }
    }
  ] as const;
