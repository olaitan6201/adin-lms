// Illustrative workspace records.
export const auditLog = [
  { when: '26 Nov 2026, 11:02', who: 'Ifeoma Nwachukwu', action: 'Changed user role', detail: 'Bisi Afolabi: Exam Officer -> Examination Manager', ip: '10.24.8.19' },
  { when: '26 Nov 2026, 10:41', who: 'Tunde Balogun', action: 'Integration updated', detail: 'SMTP credentials rotated for institutional mail relay', ip: '10.24.2.7' },
  { when: '26 Nov 2026, 09:14', who: 'System', action: 'Exam session opened', detail: 'ACC302 mid-term, 68 candidates authenticated', ip: '10.24.8.44' },
  { when: '25 Nov 2026, 16:22', who: 'Sade Ogunleye', action: 'Bulk enrolment import', detail: '142 student records created, 3 rejected', ip: '10.24.1.31' },
  { when: '25 Nov 2026, 13:05', who: 'Dr. Uche Okonkwo', action: 'Result released', detail: 'ENG210 continuous test 1, 82 candidates', ip: '10.24.9.12' },
  { when: '24 Nov 2026, 08:00', who: 'System', action: 'Backup completed', detail: 'Nightly job, verification passed', ip: '10.24.2.9' }
];

export const securityEvents = [
  { id: 's-1', title: 'Repeated failed logins', detail: '6 attempts for matric AOU/2023/0412 from 197.210.xx', level: 'high', time: '2 h ago' },
  { id: 's-2', title: 'Idle session revoked', detail: 'User Dr. Grace Mbeki, 30-minute policy', level: 'info', time: '5 h ago' },
  { id: 's-3', title: 'Upload rejected', detail: 'File type not in allow-list: .exe', level: 'medium', time: 'Yesterday' },
  { id: 's-4', title: 'MFA enrolment completed', detail: 'User Mrs. Bisi Afolabi', level: 'info', time: 'Yesterday' }
];

export const integrations = [
  { id: 'in-1', name: 'Institutional email', type: 'SMTP relay', state: 'connected', detail: 'noreply@adin-u.com', version: 'TLS 1.3' },
  { id: 'in-2', name: 'Live classroom', type: 'Conferencing provider', state: 'connected', detail: 'Session token issued per class', version: 'v2 API' },
  { id: 'in-3', name: 'Student information system', type: 'Roster feed', state: 'configured', detail: 'CSV/Excel import, nightly feed available', version: 'Planned launch' },
  { id: 'in-4', name: 'Digital library', type: 'LTI 1.3', state: 'planned', detail: 'Provider and version to be agreed', version: 'Pending' },
  { id: 'in-5', name: 'External tools', type: 'LTI Advantage', state: 'planned', detail: 'AGS / NRPS / Deep Linking', version: 'Pending' },
  { id: 'in-6', name: 'Single sign-on', type: 'Identity provider', state: 'unavailable', detail: 'Depends on an available IdP', version: 'Blocked' }
];

export const portability = [
  { format: 'SCORM 1.2 / 2004', state: 'supported', detail: 'Import and export verified by round trip' },
  { format: 'IMS Common Cartridge', state: 'partial', detail: 'Export verified; import limited to CC 1.2' },
  { format: 'Moodle backup and restore', state: 'planned', detail: 'Format versions to be verified before migration' },
  { format: 'Reusable course structure copy', state: 'supported', detail: 'Structure only, no grades or registrations' }
];

export const retentionRules = [
  { data: 'Student academic records', period: 'Permanent (archive after 10 years)', basis: 'NDPA 2023 and institutional policy' },
  { data: 'Examination responses and logs', period: '5 years', basis: 'Examination policy' },
  { data: 'Session and security logs', period: '24 months', basis: 'Security monitoring' },
  { data: 'Guardian access records', period: 'Consent duration', basis: 'Consent register' },
  { data: 'Course content drafts', period: '24 months after archiving', basis: 'Content lifecycle' }
];

export const performanceMetrics = [
  { metric: 'Median page response', value: '1.4 s', target: '< 3 s', state: 'good' },
  { metric: 'Search response (p95)', value: '0.6 s', target: '< 1 s', state: 'good' },
  { metric: 'Peak CBT submission throughput', value: '412 / min', target: '350 / min', state: 'good' },
  { metric: 'Monthly availability', value: '99.72 %', target: '99.5 %', state: 'good' },
  { metric: 'Backup verification pass rate', value: '98.1 %', target: '100 %', state: 'watch' },
  { metric: 'Storage consumed', value: '68 %', target: '< 80 %', state: 'watch' }
];
