export const policy = [
    ['Require multi-factor authentication for privileged roles','Super admin, ICT, dean, head of department and examination officers',true],
    ['Idle session logout','Ends an inactive session after the configured period',true],
    ['Allow guardian access','Guardians see only progress explicitly approved by staff',false],
    ['Allow SMS and push notifications','Channel availability depends on the configured gateway',false],
    ['Record consent for personal data processing','Required where the NDPA 2023 applies to the record',true],
] as const;
export const privacy = [
    ['Record consent where the data subject is not the student','Guardian and employer data captured with a consent reference',true],
    ['Restrict personal data to roles that need it','Least privilege on every query path, not only in the interface',true],
    ['Support legally required exports','An authorised officer can export a complete record for a data subject',true],
    ['Breach notification workflow','Record, contain, notify and review within the agreed window',true],
] as const;
export const features = [['manifest.webmanifest','Name, icons, colours and shortcuts for the installed application.'],['Service worker','Caches the application shell so a cold start works without a network.'],['Icon set','192, 512 and maskable PNG icons rendered from the institutional crest.'],['Install control','In the navigation footer, with a plain explanation when the browser cannot offer a prompt.']];
export const identity = { name:'Adin Open University', system:'AdinOpen LMS', email:'helpdesk@adin-u.com', logo:'/brand/adin/crest.svg' };
export const accessibilitySummary: [string,string,string?][] = [['Automated checks in this build','8 areas'],['Items still to test','6 areas'],['Conformance report published','No']];
export const shortcuts = [['Ctrl K','Open the command palette'],['Tab','Move between the rail, the top bar and the main region'],['Escape','Close the palette, the drawer and any open panel'],['Enter or Space','Activate the focused control']];
export const initialBackups = [
    ['Nightly full','26 Nov 2026, 02:00','41.2 GB','Passed','24 hours'],
    ['Nightly full','25 Nov 2026, 02:00','40.9 GB','Passed','24 hours'],
    ['Pre-examination snapshot','23 Nov 2026, 18:00','40.4 GB','Passed','Point in time'],
    ['Nightly full','24 Nov 2026, 02:00','40.8 GB','Failed, retried','24 hours'],
];
export const recoveryMetrics: [string,string,string?][] = [['Recovery time objective','4 hours'],['Recovery point objective','24 hours'],['Last verified restore','12 Nov 2026'],['Storage used','68%']];
