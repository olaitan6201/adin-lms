// Illustrative workspace records.
export const courses = [
  { code: 'ACC302', title: 'Intermediate Financial Accounting', units: 3, level: 300, semester: 1, type: 'Compulsory', prereq: 'ACC201', department: 'ACC', state: 'approved' },
  { code: 'ACC311', title: 'Cost and Management Accounting', units: 3, level: 300, semester: 2, type: 'Compulsory', prereq: 'ACC302', department: 'ACC', state: 'approved' },
  { code: 'ECN104', title: 'Principles of Economics', units: 3, level: 100, semester: 1, type: 'Compulsory', prereq: '-', department: 'ECN', state: 'published' },
  { code: 'ECN221', title: 'Econometrics', units: 4, level: 200, semester: 2, type: 'Elective', prereq: 'ECN201, MTH202', department: 'ECN', state: 'draft' },
  { code: 'BSC205', title: 'Cell and Molecular Biology', units: 3, level: 200, semester: 1, type: 'Compulsory', prereq: 'BSC102', department: 'BSC', state: 'approved' },
  { code: 'BSC341', title: 'Genetics and Breeding', units: 3, level: 300, semester: 2, type: 'Elective', prereq: 'BSC205', department: 'BSC', state: 'published' },
  { code: 'CHM401', title: 'Physical Chemistry II', units: 4, level: 400, semester: 1, type: 'Compulsory', prereq: 'CHM301', department: 'CHM', state: 'approved' },
  { code: 'ENG210', title: 'Literary Devices and Criticism', units: 3, level: 200, semester: 1, type: 'Compulsory', prereq: 'ENG101', department: 'ENG', state: 'published' },
  { code: 'EDM505', title: 'Curriculum Development', units: 3, level: 500, semester: 1, type: 'Compulsory', prereq: 'EDM401', department: 'EDM', state: 'draft' },
  { code: 'MTH112', title: 'Calculus I', units: 4, level: 100, semester: 1, type: 'Compulsory', prereq: '-', department: 'MST', state: 'published' }
];

export const offerings = [
  { id: 'off-1', code: 'ACC302', title: 'Intermediate Financial Accounting', instructor: 'Dr. Peter Adeyemi', students: 68, sessions: 12, completion: 46, state: 'published', mode: 'Blended', term: '2025/2026 S1' },
  { id: 'off-2', code: 'BSC205', title: 'Cell and Molecular Biology', instructor: 'Dr. Amaka Eze', students: 54, sessions: 12, completion: 61, state: 'published', mode: 'Online', term: '2025/2026 S1' },
  { id: 'off-3', code: 'ENG210', title: 'Literary Devices and Criticism', instructor: 'Dr. Halima Yusuf', students: 82, sessions: 11, completion: 38, state: 'published', mode: 'Face-to-face', term: '2025/2026 S1' },
  { id: 'off-4', code: 'CHM401', title: 'Physical Chemistry II', instructor: 'Dr. Grace Mbeki', students: 41, sessions: 12, completion: 74, state: 'published', mode: 'Blended', term: '2025/2026 S1' },
  { id: 'off-5', code: 'EDM505', title: 'Curriculum Development', instructor: 'Dr. Emeka Nwosu', students: 33, sessions: 9, completion: 12, state: 'approved', mode: 'Online', term: '2025/2026 S1' },
  { id: 'off-6', code: 'ECN104', title: 'Principles of Economics', instructor: 'Unassigned', students: 0, sessions: 0, completion: 0, state: 'draft', mode: 'Online', term: '2025/2026 S1' }
];

export const courseModules = [
  { id: 'm-1', week: 'Week 1', title: 'Introduction to the course and learning outcomes', items: 5, completion: 96, state: 'published' },
  { id: 'm-2', week: 'Week 2', title: 'Accounting equation and double-entry bookkeeping', items: 7, completion: 91, state: 'published' },
  { id: 'm-3', week: 'Week 3', title: 'The accounting cycle: journals, ledgers and trial balance', items: 9, completion: 78, state: 'published' },
  { id: 'm-4', week: 'Week 4', title: 'Recognition and measurement of assets', items: 6, completion: 64, state: 'published' },
  { id: 'm-5', week: '5', title: 'Mid-term revision and quiz', items: 4, completion: 41, state: 'published' },
  { id: 'm-6', week: 'Week 6', title: 'Inventory valuation: FIFO and weighted average', items: 8, completion: 18, state: 'draft' },
  { id: 'm-7', week: 'Week 7', title: 'Depreciation, impairment and asset disposal', items: 5, completion: 0, state: 'draft' }
];

export const resources = [
  { name: 'Week 3 manuscript: journals and ledgers', type: 'PDF', size: '3.2 MB', version: 'v3', updated: '12 Nov 2026', access: 'Restricted to Week 3', icon: 'document' },
  { name: 'Practice set with worked solutions', type: 'DOCX', size: '860 KB', version: 'v2', updated: '09 Nov 2026', access: 'Open', icon: 'document' },
  { name: 'Lecture slides: recognition of revenue', type: 'PPTX', size: '11.4 MB', version: 'v1', updated: '02 Nov 2026', access: 'Open', icon: 'monitor' },
  { name: 'Trial balance template', type: 'XLSX', size: '124 KB', version: 'v5', updated: '28 Oct 2026', access: 'Open', icon: 'sheet' },
  { name: 'Illustration: accounting cycle flow', type: 'PNG', size: '420 KB', version: 'v1', updated: '28 Oct 2026', access: 'Open', icon: 'image' },
  { name: 'Lecture recording: revenue recognition', type: 'MP4', size: '184 MB', version: 'v1', updated: '26 Oct 2026', access: 'Downloads disabled', icon: 'video' },
  { name: 'Audio summary: the accounting cycle', type: 'MP3', size: '18.6 MB', version: 'v1', updated: '24 Oct 2026', access: 'Open', icon: 'mic' },
  { name: 'IFRS 15 guidance: external reading', type: 'Link', size: 'External URL', version: 'v1', updated: '18 Oct 2026', access: 'Open', icon: 'link' },
  { name: 'Glossary of IFRS terms', type: 'PDF', size: '540 KB', version: 'v1', updated: '20 Oct 2026', access: 'Open', icon: 'document' }
];

export const courseOverviews = {
  'ACC302': {
    purpose: 'Develops the ability to prepare and interpret financial statements for a reporting entity under the International Financial Reporting Standards adopted by the institution.',
    outline: 'Introduction to the reporting framework. The accounting equation and double-entry bookkeeping. The accounting cycle: journals, ledgers and the trial balance. Recognition and measurement of assets. Inventory valuation under FIFO and weighted average. Depreciation, impairment and disposal. Liabilities, provisions and contingent items. Income taxes. Statement of cash flows. Interpretation of the primary statements.',
    entry: 'ACC201 or an equivalent pass in principles of accounting.',
    delivery: 'Blended: weekly online manuscript, one tutorial, one practical session.',
    outcomes: [
      { code: 'LO1', text: 'Post transactions into journals and ledgers and extract a balanced trial balance.', mapped: 'PO3, PO4' },
      { code: 'LO2', text: 'Apply the recognition and measurement rules for assets and liabilities.', mapped: 'PO3' },
      { code: 'LO3', text: 'Select and defend an inventory valuation method for a given reporting context.', mapped: 'PO3, PO5' },
      { code: 'LO4', text: 'Prepare and interpret the primary financial statements of a reporting entity.', mapped: 'PO4, PO5' }
    ],
    materials: { present: 18, required: 16, missing: 2 },
    team: ['Dr. Peter Adeyemi (course leader)', 'Mrs. Bisi Afolabi (examination officer)']
  },
  'BSC205': {
    purpose: 'Introduces cell structure and function, with laboratory practice in slide preparation and observation of mitosis.',
    outline: 'Cell theory and the scope of cell biology. Membrane structure and transport. Cell organelles and their functions. Mitosis and the cell cycle. Preparation of slides and staining. Observation and recording of mitosis. Laboratory safety and conduct.',
    entry: 'BSC102 or an equivalent pass in introductory biology.',
    delivery: 'Online with a compulsory three-hour laboratory session each week.',
    outcomes: [
      { code: 'LO1', text: 'Describe cell structure and the function of each organelle.', mapped: 'PO1, PO2' },
      { code: 'LO2', text: 'Explain transport across the cell membrane.', mapped: 'PO2' },
      { code: 'LO3', text: 'Prepare a slide and observe mitosis under the microscope.', mapped: 'PO6' }
    ],
    materials: { present: 11, required: 11, missing: 0 },
    team: ['Dr. Amaka Eze (course leader)']
  }
};
