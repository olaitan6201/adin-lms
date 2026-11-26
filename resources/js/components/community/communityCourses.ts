export function availableCourses(records: readonly { course: string }[]) {
    return [...new Set(records.map(record => record.course).filter(course => course?.trim()))];
}

export function selectedCourse(fields: FormData, choices: readonly string[]) {
    return choices.find(course => course === fields.get('course'));
}
