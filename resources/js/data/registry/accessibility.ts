// Accessibility statements from the illustrative workspace reference.
export const verified = [
  { item: 'Landmarks and skip link', detail: 'One main landmark, a navigation landmark and a skip link to the main region.' },
  { item: 'Named controls', detail: 'Every input carries an accessible name; icon-only buttons carry a label.' },
  { item: 'Visible focus', detail: 'Focus rings are preserved for keyboard users, including inside the segmented controls.' },
  { item: 'Keyboard reachability', detail: 'Every action is a button or a link and is reachable without a pointer.' },
  { item: 'Reflow and overflow', detail: 'No horizontal overflow at 1440, 1024, 768 and 390 pixels across every route.' },
  { item: 'Text scale', detail: 'A three-step text size control is exposed in the top bar.' },
  { item: 'Reduced motion', detail: 'Animation and transition durations collapse when the platform asks for reduced motion.' },
  { item: 'Clean render', detail: 'The harness records zero console errors and zero leaked template values on every route.' }
];
export const targets = [
  { item: 'Screen reader behaviour', detail: 'Announcement order, live region wording and focus management need testing with assistive technology.' },
  { item: 'Colour contrast', detail: 'Contrast ratios have not been measured with a tool; the palette was chosen by eye.' },
  { item: '320 pixel reflow', detail: 'The harness stops at 390 pixels. Reflow at 320 pixels is not yet evidenced.' },
  { item: 'Target size', detail: 'Pointer target sizes are not measured against the 24 by 24 CSS pixel criterion.' },
  { item: 'Error identification', detail: 'Form error states are not implemented because the prototype submits no data.' },
  { item: 'Examination keyboard trap', detail: 'The candidate runner binds keys during a paper; the escape behaviour is not yet specified.' }
];
