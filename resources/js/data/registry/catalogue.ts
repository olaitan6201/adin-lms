import { courses as catalogue, courseOverviews, offerings } from './academics';
import { programmes } from './institution';

export const columns = ['PO1', 'PO2', 'PO3', 'PO4', 'PO5'];
export const matrix = [
    { outcome: 'CO1 Accounting equation', weights: [3, 2, 0, 1, 0] },
    { outcome: 'CO2 Journal entries', weights: [3, 3, 1, 2, 1] },
    { outcome: 'CO3 Trial balance', weights: [2, 3, 2, 1, 0] },
    { outcome: 'CO4 Asset recognition', weights: [1, 2, 3, 2, 1] },
    { outcome: 'CO5 Inventory valuation', weights: [0, 1, 3, 2, 2] },
    { outcome: 'CO6 Depreciation', weights: [1, 1, 2, 3, 1] },
];
export const programmeOutcomes = ['Apply accounting theory to the preparation of financial statements.','Demonstrate ethical judgement in reporting decisions.','Use quantitative methods to analyse business transactions.','Communicate findings to non-specialist audiences.','Apply information technology to accounting processes.'];
export const description = 'Preparation and interpretation of financial statements for reporting entities, including the recognition, measurement and presentation of assets, liabilities and equity.';
export const catalogueEntries = catalogue.map(c => ({...c,description:c.code==='ACC302'?description:''}));
export const programmeVersions = programmes.map(p => ({...p,version:'v2 approved', revision:2, approved:p.code==='ACC'?'12 Oct 2026':'04 Sep 2026'}));
export const accountingOutcomes = ['Explain the accounting equation and apply it to transactions.', 'Record transactions in journals and transfer to ledgers.', 'Prepare a trial balance and identify errors of principle.'];

export const prerequisite = {code:'ACC201', title:'ACC201 Introduction to Financial Accounting'};
export const selectedCourse = { definition: catalogue[0], overview:courseOverviews.ACC302, offering:offerings[0], semester:'First', session:'2025/2026' };
