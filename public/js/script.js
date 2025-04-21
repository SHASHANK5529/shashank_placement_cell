const { exec } = require('child_process');

function analyzeResume(filePath) {
    return new Promise((resolve, reject) => {
        exec(`python analyze_resume.py ${filePath}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(stdout));
            }
        });
    });
}

module.exports = { analyzeResume };