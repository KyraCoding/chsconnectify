const studentURL = "https://raw.githubusercontent.com/KyraCoding/chs-groups/refs/heads/main/students.json";
const groupURL = "https://raw.githubusercontent.com/KyraCoding/chs-groups/refs/heads/main/export.json";
var canvas = document.getElementById("canvas");
var loading = document.getElementById("loading");

const DOT_SIZE = 10;
const MAX_DOT_SIZE = 20;

const xBound = canvas.offsetWidth - MAX_DOT_SIZE;
const yBound = canvas.offsetHeight - MAX_DOT_SIZE;
var students = undefined;
var connections = undefined;
async function regenerate(special = false) {
    loading.classList.remove("hidden");
    loading.classList.add("z-50");
    await sleep(500);
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }
    if (!students) {
        students = await fetch(studentURL).then(res => res.json());
    }
    if (!connections) {
        connections = await fetch(groupURL).then(res => res.json());
    }
    if (!special) {
        special = Math.floor(Object.keys(students).length * Math.random());
    }
    Object.keys(students).forEach(student => {
        createStudentNode(student, students[student], student == special);
    });

    Object.keys(connections[special]).forEach(student => {
        connections[special][student].forEach(connection => {
            createConnectionNode(student, connection,students[special].filter(value => students[connection].includes(value)).length);
        })
    });
    loading.classList.remove("z-50");
    loading.classList.add("hidden");
}

function createStudentNode(id, data, special = false) {
    var studentNode = document.createElement("div");
    var color = "";
    if (special) {
        color = "bg-emerald-400"
    } else if (data.length < 1) {
        color = "bg-blue-50/0";
    } else if (data.length < 2) {
        color = "bg-blue-100";
    } else if (data.length < 3) {
        color = "bg-blue-200";
    } else if (data.length < 4) {
        color = "bg-blue-300";
    } else if (data.length < 5) {
        color = "bg-blue-400";
    } else if (data.length < 6) {
        color = "bg-blue-500";
    } else if (data.length < 7) {
        color = "bg-blue-600";
    } else if (data.length < 8) {
        color = "bg-blue-700";
    } else if (data.length < 9) {
        color = "bg-blue-800";
    } else {
        color = "bg-blue-900";
    }
    studentNode.className = `cursor-pointer rounded-full ${color} z-20 inset-0 h-[${DOT_SIZE}px] w-[${DOT_SIZE}px] hover:h-[${MAX_DOT_SIZE}px] hover:w-[${MAX_DOT_SIZE}px] hover:-translate-x-[${(MAX_DOT_SIZE - DOT_SIZE) / 2}px] hover:-translate-y-[${(MAX_DOT_SIZE - DOT_SIZE) / 2}px]`;
    studentNode.style.position = "absolute";
    if (special) {
        studentNode.style.left = xBound / 2 + "px";
        studentNode.style.top = yBound / 2 + "px";
    } else {
        studentNode.style.left = Math.random() * xBound + "px";
        studentNode.style.top = Math.random() * yBound + "px";
    }
    studentNode.dataset.id = id;
    studentNode.title = "Student #"+id+": "+data;
    studentNode.onclick = () => {
        regenerate(id);
    }
    canvas.appendChild(studentNode);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function createConnectionNode(id1, id2, weight, special=false) {
    var color = ""
    var opacity = 0.1;
    if (special) {
        color = "bg-yellow-400"
        opacity = 1;
    } else if (weight < 2) {
        color = "bg-green-300";
        opacity = 0.1;
    } else if (weight < 3) {
        color = "bg-blue-300";
        opacity = 0.2;
    } else if (weight < 4) {
        color = "bg-red-300";
        opacity = 0.3;
    } else {
        color = "bg-purple-300";
        opacity = 0.5;
    }
    const canvasRect = canvas.getBoundingClientRect();

    const node1 = document.querySelector(`[data-id="${id1}"]`).getBoundingClientRect();
    const node2 = document.querySelector(`[data-id="${id2}"]`).getBoundingClientRect();

    const id1X = node1.x - canvasRect.left + DOT_SIZE / 2;
    const id1Y = node1.y - canvasRect.top + DOT_SIZE / 2;
    const id2X = node2.x - canvasRect.left + DOT_SIZE / 2;
    const id2Y = node2.y - canvasRect.top + DOT_SIZE / 2;

    const connectionNode = document.createElement("div");
    connectionNode.className = `${color} z-10 absolute`;
    connectionNode.style.width = calculateDistance(id1X, id1Y, id2X, id2Y) + "px";
    connectionNode.style.height = "2px";
    connectionNode.style.transform = `rotate(${calculateRotation(id1X, id1Y, id2X, id2Y)}deg)`;
    connectionNode.style.transformOrigin = "top left";
    connectionNode.style.left = id1X + "px";
    connectionNode.style.top = id1Y + "px";
    connectionNode.style.opacity = opacity;

    canvas.appendChild(connectionNode);
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
function calculateRotation(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}


document.addEventListener("DOMContentLoaded", function() {
    regenerate();
});

/*
setInterval(() => {
    regenerate();
}, 10000);
*/