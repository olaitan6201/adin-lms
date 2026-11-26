export function ExchangeCompatibility() {
    return (
        <section className="course-note space-y-2">
            <h2 className="text-xl font-semibold">Compatibility limits</h2>
            <p>
                Native backups support 50 unscheduled lessons, 20 unrestricted materials per lesson and 50 forums. Files are limited to 4
                MiB each, 50 files and 8 MiB expanded in total. Legacy Adin chapter ZIPs are also accepted.
            </p>
            <p>
                Assessment schedules retain their original UTC dates. Review them before opening the draft. All banks in the source
                curriculum course are included; their topics must be new in the destination course. Fixed questions and random draws retain
                their links. Custom exam security, custom activity order, class meetings and announcements block export.
            </p>
            <p>
                Common Cartridge 1.1 import maps a single root folder of local plain-text web resources to ordered chapters. Cartridge
                quizzes and nested sections are unsupported. Moodle .mbz backups cannot be restored here; export supported text resources
                from the source course instead.
            </p>
            <p>
                SCORM 1.2 text assets become ordinary chapters. This importer does not run package code or transfer learner progress. For a
                supported Reading v1 package, use the separate course reading player when enabled. Its completion score does not enter the
                gradebook.
            </p>
        </section>
    );
}
