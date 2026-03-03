// settings.js - Settings page logic (preferences + forex converter)

document.addEventListener('DOMContentLoaded', function() {
    const exportSettings = document.getElementById('exportSettings');
    const importSettings = document.getElementById('importSettings');
    const importFile = document.getElementById('importFile');

    exportSettings.addEventListener('click', function() {
        const data = { exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'muni-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    importSettings.addEventListener('click', function() {
        importFile.click();
    });

    importFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function() {
            try {
                JSON.parse(reader.result);
                alert('Settings file imported (no currency settings to apply).');
            } catch (err) {
                alert('Invalid settings file');
            }
        };
        reader.readAsText(file);
    });
});
