// Illustrative local workspace records.
export const enrolmentTrend = {
  labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  series: [
    { name: 'Registered students', values: [1180, 1264, 1352, 1401, 1448, 1496, 1533, 1578, 1622, 1651, 1678, 1694], color: '#10B981' },
    { name: 'Active courses', values: [42, 48, 53, 56, 61, 64, 68, 71, 74, 76, 78, 79], color: '#33475F' }
  ]
};

export const completionByFaculty = [
  { label: 'Faculty of Science', value: 61, color: '#10B981' },
  { label: 'Faculty of Arts and Education', value: 48, color: '#3B82F6' },
  { label: 'Faculty of Business and Social Sciences', value: 54, color: '#F59E0B' }
];

export const engagementMix = [
  { label: 'Lecture resources opened', value: 3420, color: '#10B981' },
  { label: 'Assignment submissions', value: 1284, color: '#33475F' },
  { label: 'Forum posts', value: 968, color: '#F59E0B' },
  { label: 'Live class attendance', value: 742, color: '#3B82F6' },
  { label: 'Pastel questions attempted', value: 511, color: '#F43F5E' }
];

export const examPerformance = {
  labels: ['ACC302', 'BSC205', 'ENG210', 'CHM401', 'EDM505'],
  series: [
    { name: 'Mean score %', values: [68, 71, 64, 74, 59], color: '#10B981' },
    { name: 'Pass threshold %', values: [45, 45, 40, 50, 45], color: '#AEBCCB' }
  ]
};
