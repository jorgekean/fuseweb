
const Changelog = ({ changelogs }: any) => {
    // Ensure changelogs is an array before attempting to slice or map
    if (!Array.isArray(changelogs) || changelogs.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                No changelog data available.
            </div>
        );
    }

    return (
        <div className="max-h-[70vh] overflow-y-auto p-4 border rounded bg-white shadow">
            {changelogs.slice(0, 5).map((changelog, changelogIndex) => (
                <div key={changelogIndex} className="mb-6">
                    <h2 className="text-lg font-semibold">Version: {changelog.version}</h2>
                    <em className="text-sm ml-1">Release Date: {changelog.releaseDate}</em>
                    <ul className="list-disc pl-5 mt-4">
                        {changelog.changes.map((log: any, index: number) => (
                            <li key={index} className="mb-1">
                                <strong>{log.shortDesc}</strong>
                                {log.subChanges && log.subChanges.length > 0 && (
                                    <ul className="list-disc pl-5 mt-1">
                                        {log.subChanges.map((subLog: any, subIndex: number) => (
                                            <li key={subIndex} className="text-sm text-gray-600">
                                                {subLog.shortDesc}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default Changelog;