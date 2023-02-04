"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var sync_1 = require("csv-parse/sync");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var scrap_1 = __importDefault(require("../Scrap/scrap"));
var lastSavedStats = Array(21).fill(0);
var stats = Array(21).fill(0);
var refreshStates = function (index) {
    var file = fs_1.default.createWriteStream(path_1.default.join(__dirname, '../stats.txt'));
    stats.forEach(function (v) { file.write(v + '\n'); });
    file.end();
    lastSavedStats = __spreadArray([], stats, true);
};
var getStats = function () {
    fs_1.default.readFile(path_1.default.join(__dirname, '../stats.txt'), function (err, data) {
        var statsString = data.toString().split('\n');
        statsString.forEach(function (state, i) {
            lastSavedStats[i] = Number(state);
        });
        stats = __spreadArray([], lastSavedStats, true);
    });
};
getStats();
function appendReport(report) {
    fs_1.default.appendFileSync(path_1.default.join(__dirname, '../reports.txt'), report);
}
var getRecordedData = function () {
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 4; j++) {
            var x = fs_1.default.readFileSync(path_1.default.join(__dirname, "../Data/_".concat(i).concat(j, ".csv"))).toString();
            records[i].push((0, sync_1.parse)(x, {
                columns: true,
                skip_empty_lines: true
            }));
        }
    }
};
var records = [[], [], [], [], []];
getRecordedData();
var updateRecord = function (dep, year) {
    var i = Number(dep);
    var j = Number(year);
    var x = fs_1.default.readFileSync(path_1.default.join(__dirname, "../Data/_".concat(i).concat(j, ".csv"))).toString();
    records[i][j] = (0, sync_1.parse)(x, {
        columns: true,
        skip_empty_lines: true
    });
};
var app = (0, express_1.default)();
var address = "127.0.0.1:80";
var corsOption = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.post("/report", function (req, res) {
    var report = "==============================" +
        "\n".concat(req.body.title) +
        "\n".concat(req.body.body, "\n");
    appendReport(report);
    res.send('ok');
});
app.get('/update', function (req, res) {
    var dep = req.query.dep;
    var year = req.query.year;
    if (!dep || !year) {
        res.status(400).send('Stop Missing With Our Data We Can See You !!');
        return;
    }
    updateRecord(dep, year);
    res.send('load el files ya 3bd');
});
app.get('/', function (req, res) {
    var dep = req.query.dep;
    var year = req.query.year;
    if (!dep || !year) {
        res.status(400).send('Stop Missing With Our Data We Can See You !!');
        return;
    }
    if (Number(dep) === 555 || Number(year) === 555) {
        res.status(400).send('Get The Fu*k Out !');
        return;
    }
    stats[0]++;
    if (stats[0] - lastSavedStats[0] >= 5) {
        refreshStates(0);
    }
    stats[Number(dep) * 4 + Number(year) + 1]++;
    if (stats[Number(dep) * 4 + Number(year) + 1] - lastSavedStats[Number(dep) * 4 + Number(year) + 1] >= 5) {
        refreshStates(Number(dep) * 4 + Number(year) + 1);
    }
    res.send(records[Number(dep)][Number(year)]);
});
app.get('/reports', function (req, res) {
    fs_1.default.readFile(path_1.default.join(__dirname, '../reports.txt'), function (err, data) {
        if (err)
            throw err;
        res.send(data.toLocaleString());
    });
});
app.get('/stats', function (req, res) {
    res.send(JSON.stringify({ counters: stats }));
});
app.get('/a7a', function (req, res) {
    (0, scrap_1.default)(req.query.start, req.query.end, req.query.d, req.query.y);
    res.send('a7aten');
});
app.get('/wtf', function (req, res) {
    res.send('a7a');
});
app.listen(5555, function () {
    console.log("starting app on: ".concat(address));
});
