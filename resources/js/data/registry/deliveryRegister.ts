import { offerings } from './academics';

export const stages = [['Draft',11,'Awaiting academic approval'],['Approved',9,'Ready for instructor and roster'],['Published',56,'Visible to enrolled students'],['Archived',3,'Closed, results retained']] as const;
export const rosterMetrics: [string,string,string?][] = [['Last sync','26 Nov, 16:20','142 records received'],['Rejected','3 records','Missing programme and level'],['Transport','Configurable','CSV, Excel or agreed feed']];
export const initialOfferings = offerings.map(o => ({...o, assistants:'2 assigned',scope:'Assigned class only'}));
export const formats = [['SCORM 1.2 / 2004 package','Supported','Round trip verified'],['IMS Common Cartridge export','Partial','Export verified, import limited'],['Moodle backup and restore','Planned','Versions to be verified'],['Structure copy without grades','Supported','Round trip verified']];
export const previousSessions = ['2024/2025 (38 weeks)','2023/2024 (36 weeks)'];
export const currentTerm = '2025/2026 S1';
export const offeringTotal = 79;
