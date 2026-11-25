import { ClassReportView } from '../components/workload/ClassReportView';
import { WorkloadIndex } from '../components/workload/WorkloadIndex';
import type { WorkloadProps } from '../components/workload/contracts';

export default function Workload(props: WorkloadProps) {
    return props.report === null ? (
        <WorkloadIndex workload={props.workload} />
    ) : (
        <ClassReportView report={props.report} />
    );
}
