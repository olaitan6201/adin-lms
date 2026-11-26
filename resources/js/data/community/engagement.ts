// Illustrative local workspace records.
export const forums = [
  { id: 'f-1', title: 'Journal entries: where do debits begin?', course: 'ACC302', threads: 24, posts: 318, last: 'Grace Mbeki replied 18 min ago', pinned: true },
  { id: 'f-2', title: 'Mid-term revision clinic', course: 'ENG210', threads: 11, posts: 96, last: 'Student posted 1 h ago', pinned: false },
  { id: 'f-3', title: 'Laboratory safety and conduct', course: 'BSC205', threads: 6, posts: 44, last: 'Halima Yusuf replied yesterday', pinned: false }
];

export const threads = [
  { id: 't-1', title: 'Why is depreciation still charged when market value rises?', author: 'Aisha Bello', replies: 8, updated: 'Today, 10:42', tag: 'Accounting equation' },
  { id: 't-2', title: 'Group 4 presentation: can we swap the case study?', author: 'Emeka Uzoma', replies: 3, updated: 'Today, 09:15', tag: 'Group work' },
  { id: 't-3', title: 'Recommended textbook for physical chemistry', author: 'Chinedu Okafor', replies: 5, updated: 'Yesterday, 19:02', tag: 'Resources' }
];

export const messages = [
  { id: 'm-1', name: 'Dr. Peter Adeyemi', subject: 'Extension request for problem set', preview: 'Some of you asked whether the deadline can move to Friday because of the mid-term...', time: '09:12', unread: 2 },
  { id: 'm-2', name: 'Examinations Office', subject: 'Mid-term invigilation schedule', preview: 'Please confirm your invigilation slot for 18 November before Thursday.', time: 'Yesterday', unread: 0 },
  { id: 'm-3', name: 'Blessing Okonkwo', subject: 'Question about marking rubric', preview: 'Thank you for the feedback on question 4. Could you clarify the marking scheme?', time: 'Yesterday', unread: 1 }
];

export const discussionGroups = [
  {
    id: 'g-1',
    name: 'Group 4: consolidation case',
    course: 'ACC302',
    members: ['Blessing Okonkwo', 'Emeka Uzoma', 'Chinedu Okafor', 'Aisha Bello'],
    posts: 27,
    sharedFiles: 4,
    task: 'Present the consolidation of the two subsidiaries and answer the examiner questions',
    due: '20 Nov 2026, 12:00',
    lastActivity: 'Emeka Uzoma posted 35 min ago'
  },
  {
    id: 'g-2',
    name: 'Group 2: inventory valuation debate',
    course: 'ACC302',
    members: ['Oluwaseun Ajayi', 'Fatima Sanni'],
    posts: 14,
    sharedFiles: 2,
    task: 'Argue FIFO against weighted average for the given reporting context',
    due: '24 Nov 2026, 23:59',
    lastActivity: 'Fatima Sanni posted 2 h ago'
  },
  {
    id: 'g-3',
    name: 'Group 1: slide preparation',
    course: 'BSC205',
    members: ['Ngozi Obi', 'Aisha Bello', 'Oluwaseun Ajayi', 'Blessing Okonkwo', 'Emeka Uzoma'],
    posts: 19,
    sharedFiles: 6,
    task: 'Prepare and stain the slides for the week 5 practical observation',
    due: '16 Nov 2026, 08:00',
    lastActivity: 'Ngozi Obi posted yesterday'
  },
  {
    id: 'g-4',
    name: 'Group 3: narrative voice reading group',
    course: 'ENG210',
    members: ['Chinedu Okafor', 'Fatima Sanni', 'Ngozi Obi'],
    posts: 31,
    sharedFiles: 3,
    task: 'Prepare the group presentation on narrative voice',
    due: '20 Nov 2026, 12:00',
    lastActivity: 'Student posted 1 h ago'
  }
];

export const groupPosts = [
  {
    id: 'gp-1',
    group: 'Group 4: consolidation case',
    author: 'Emeka Uzoma',
    role: 'Member',
    time: 'Today, 09:15',
    body: 'Can we swap the case study? I have finished the draft for the original one and the second one has a different format.',
    replyTo: null
  },
  {
    id: 'gp-2',
    group: 'Group 4: consolidation case',
    author: 'Dr. Peter Adeyemi',
    role: 'Lecturer',
    time: 'Today, 09:41',
    body: 'Keep the assigned case. Upload what you have and mark the difference in the handover note so the examiner can follow the argument.',
    replyTo: 'Can we swap the case study?'
  },
  {
    id: 'gp-3',
    group: 'Group 4: consolidation case',
    author: 'Blessing Okonkwo',
    role: 'Member',
    time: 'Today, 10:02',
    body: 'Working draft uploaded. The consolidation working is on pages 3 to 11; the note to the examiner is on page 12.',
    replyTo: null
  },
  {
    id: 'gp-4',
    group: 'Group 2: inventory valuation debate',
    author: 'Fatima Sanni',
    role: 'Member',
    time: 'Today, 07:55',
    body: 'Added the counter-argument for weighted average with the worked figures for the quarter.',
    replyTo: null
  }
];
