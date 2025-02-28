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
var selected = [];
async function regenerate(special = false) {
    loading.classList.remove("hidden");
    loading.classList.add("z-50");
    await sleep(250);
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }
    if (!students) {
        students = await fetch(studentURL).then(res => res.json());
    }
    if (!connections) {
        connections = await fetch(groupURL).then(res => res.json());
    }
    if (special) {
        // If you select a loner
        if (students[special].length < 1) {
            return regenerate();
        }
    }


    Object.keys(students).forEach(student => {
        createStudentNode(student, students[student], student === selected[0]?.id || student === selected[1]?.id);
    });


    if (selected.length > 0) {
        Object.keys(connections[selected[0].id]).forEach(student => {
            // student is the start
            // connection is the end
            connections[selected[0].id][student].forEach(connection => {
                var onPath = false;
                if (selected.length === 2) {
                    var path = connections[selected[0].id][selected[1].id];
                    for (var i = 0; i < path.length - 1; i++) {
                        var start = path[i];
                        var end = path[i + 1];
                        if ((start == student && end == connection) || (start == connection && end == student)) {
                            onPath = true;
                            break;
                        }
                    }
                }
                createConnectionNode(student, connection, students[selected[0].id].filter(value => students[connection].includes(value)).length, onPath);
            })
        });
    }

    if (selected[0]) {
        document.getElementById("startBall").className = `rounded-full aspect-square h-1/4 ${selected[0].color} flex`;
        document.getElementById("startStudent").innerHTML = "Student #" + (selected[0].id*1 + 1);
        document.getElementById("startClubs").innerHTML = students[selected[0].id].length + " club" + cardinal(students[selected[0].id].length);
        if (selected[1]) {
            document.getElementById("endBall").className = `rounded-full aspect-square h-1/4 ${selected[1].color} flex`;
            document.getElementById("endStudent").innerHTML = "Student #" + (selected[1].id*1 + 1);
            document.getElementById("endClubs").innerHTML = students[selected[1].id].length + " club" + cardinal(students[selected[1].id].length);
        }
    } else {
        document.getElementById("startBall").className = `rounded-full aspect-square h-1/4 bg-gray-400  flex`;
        document.getElementById("startStudent").innerHTML = "No student selected";
        document.getElementById("startClubs").innerHTML = "";

        document.getElementById("endBall").className = `rounded-full aspect-square h-1/4 bg-gray-400  flex`;
        document.getElementById("endStudent").innerHTML = "No student selected";
        document.getElementById("endClubs").innerHTML = "";
    }
    document.getElementById("connections").innerHTML = "";
    if (selected.length === 2) {
        var path = connections[selected[0].id][selected[1].id];
        console.log(path);
        if (!path) {
            var main = document.createElement("div");
            main.className = "flex flex-col items-center justify-center h-full w-full overflow-auto";
            var circle = document.createElement("div");
            circle.className = "rounded-full aspect-square h-1/4 bg-rose-600 flex";
            main.appendChild(circle);
            var secondary = document.createElement("div");
            secondary.className = "flex flex-col items-center";
            var student = document.createElement("p");
            student.className = "flex text-gray-800 text-2xl font-bold ml-4 text-center";
            student.innerHTML = "No connection found";
            secondary.appendChild(student);
            var clubs = document.createElement("p");
            clubs.className = "flex text-gray-800 text-lg font-bold ml-4 overflow-auto text-center";
            clubs.innerHTML = "";
            secondary.appendChild(clubs);
            main.appendChild(secondary);
            document.getElementById("connections").appendChild(main);
        } else if (path.length == 2) {
            var common = students[selected[0].id].filter(value => students[selected[1].id].includes(value))
            var main = document.createElement("div");
            main.className = "flex flex-col items-center justify-center h-full w-full overflow-auto p-4";
            var circlediv = document.createElement("div");
            circlediv.className = "flex flex-row items-center justify-center h-1/3 w-full gap-4";
            var leftCircle = document.createElement("div");
            leftCircle.className = `rounded-full aspect-square h-full ${selected[0].color} flex`;
            circlediv.appendChild(leftCircle);
            var rightCircle = document.createElement("div");
            rightCircle.className = `rounded-full aspect-square h-full ${selected[1].color} flex`;
            circlediv.appendChild(rightCircle);
            main.appendChild(circlediv);
            var secondary = document.createElement("div");
            secondary.className = "flex flex-col items-center h-2/3";
            var student = document.createElement("p");
            student.className = "flex text-gray-800 text-2xl font-bold ml-4 text-center";
            student.innerHTML = "You're already connected!";
            secondary.appendChild(student);
            var clubs = document.createElement("p");
            clubs.className = "flex text-gray-800 text-lg font-bold ml-4 overflow-auto text-center";
            if (common.length > 1) {
                clubs.innerHTML = common[0] + "<br>+" + (common.length - 1) + " more club" + cardinal(common.length - 1);
            } else {
                clubs.innerHTML = common[0]
            }
            secondary.appendChild(clubs);
            main.appendChild(secondary);
            document.getElementById("connections").appendChild(main);
        } else {
            for (var i = 0; i < path.length - 1; i++) {
                var start = path[i];
                var end = path[i + 1];
                var startPerson = students[start];
                var endPerson = students[end];
                var common = startPerson.filter(value => endPerson.includes(value));

                var main = document.createElement("div");
                main.className = "flex flex-col items-center justify-center h-full w-full overflow-auto p-4";
                var circlediv = document.createElement("div");
                circlediv.className = "flex flex-row items-center justify-center h-1/3 w-full gap-4";
                var leftCircle = document.createElement("div");
                leftCircle.className = `rounded-full aspect-square h-full ${getColor(startPerson.length)} flex`;
                circlediv.appendChild(leftCircle);
                var rightCircle = document.createElement("div");
                rightCircle.className = `rounded-full aspect-square h-full ${getColor(endPerson.length)} flex`;
                circlediv.appendChild(rightCircle);
                main.appendChild(circlediv);
                var secondary = document.createElement("div");
                secondary.className = "flex flex-col items-center h-2/3";
                var student = document.createElement("p");
                student.className = "flex text-gray-800 text-2xl font-bold ml-4 text-center";
                student.innerHTML = "#" + (start*1 + 1) + " -> #" + (end*1 + 1);
                secondary.appendChild(student);
                var clubs = document.createElement("p");
                clubs.className = "flex text-gray-800 text-lg ml-4 overflow-auto text-center font-bold";
                if (common.length > 1) {
                    clubs.innerHTML = common[0] + "<br>+" + (common.length - 1) + " more club" + cardinal(common.length - 1);
                } else {
                    clubs.innerHTML = common[0]
                }
                secondary.appendChild(clubs);
                main.appendChild(secondary);
                document.getElementById("connections").appendChild(main);
            }
        }
    } else {
        var main = document.createElement("div");
        main.className = "flex flex-col items-center justify-center h-full w-full overflow-auto";
        var circle = document.createElement("div");
        circle.className = "rounded-full aspect-square h-1/4 bg-pink-600 flex";
        main.appendChild(circle);
        var secondary = document.createElement("div");
        secondary.className = "flex flex-col items-center";
        var student = document.createElement("p");
        student.className = "flex text-gray-800 text-2xl font-bold ml-4 text-center";
        student.innerHTML = "Select two students to find their connection!";
        secondary.appendChild(student);
        var clubs = document.createElement("p");
        clubs.className = "flex text-gray-800 text-lg font-bold ml-4 overflow-auto text-center";
        clubs.innerHTML = "";
        secondary.appendChild(clubs);
        main.appendChild(secondary);
        document.getElementById("connections").appendChild(main);
    }

    loading.classList.remove("z-50");
    loading.classList.add("hidden");
}

function createStudentNode(id, data, special = false) {
    var studentNode = document.createElement("div");
    var color = "";
    if (data.length < 1) {
        color = "bg-blue-50/0 hidden ";
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
    studentNode.className = `transition-all ease-in-out cursor-pointer rounded-full ${special ? "bg-emerald-400" : color} z-20 inset-0 h-[${DOT_SIZE}px] w-[${DOT_SIZE}px] hover:h-[${MAX_DOT_SIZE}px] hover:w-[${MAX_DOT_SIZE}px] hover:-translate-x-[${(MAX_DOT_SIZE - DOT_SIZE) / 2}px] hover:-translate-y-[${(MAX_DOT_SIZE - DOT_SIZE) / 2}px]`;
    studentNode.style.position = "absolute";
    if (special) {
        if (selected.length === 1) {
            studentNode.style.left = xBound / 2 + "px";
            studentNode.style.top = yBound / 2 + "px";
        } else {
            if (selected[0].id === id) {
                studentNode.style.left = xBound / 4 + "px";
                studentNode.style.top = yBound / 2 + "px";
            } else {
                studentNode.style.left = xBound * 3 / 4 + "px";
                studentNode.style.top = yBound / 2 + "px";
            }
        }
    } else {
        studentNode.style.left = Math.random() * xBound + "px";
        studentNode.style.top = Math.random() * yBound + "px";
    }
    studentNode.dataset.id = id;
    studentNode.title = "Student #" + (id*1 + 1) + ": " + data;
    studentNode.onclick = () => {
        if (id === selected[0]?.id || id === selected[1]?.id) {
            // Deselect
            if (selected[0]?.id === id) {
                selected.splice(0, 1)
            } else if (selected[1]?.id === id) {
                selected.splice(1, 1)
            }
            regenerate();
        } else {
            if (selected.length <= 1) {
                selected.push({ id: id, color: color });
            } else if (selected.length === 2) {
                selected.splice(1, 1);
                selected.push({ id: id, color: color });
            }
            regenerate(selected[0].id);
        }
    }
    studentNode.onmouseover = () => {
        if (id === selected[0]?.id || id === selected[1]?.id) {
            return;
        }
        if (selected.length === 0) {
            document.getElementById("startBall").className = `rounded-full aspect-square h-1/4 ${color} flex`;
            document.getElementById("startStudent").innerHTML = "Student #" + (id*1 + 1);
            document.getElementById("startClubs").innerHTML = data.length + " club" + cardinal(data.length);
        } else if (selected.length > 0) {
            document.getElementById("endBall").className = `rounded-full aspect-square h-1/4 ${color} flex`;
            document.getElementById("endStudent").innerHTML = "Student #" + (id*1 + 1);
            document.getElementById("endClubs").innerHTML = data.length + " club" + cardinal(data.length);
        }
    }
    studentNode.onmouseout = () => {
        if (selected.length === 0) {
            document.getElementById("startBall").className = `rounded-full aspect-square h-1/4 bg-gray-400  flex`;
            document.getElementById("startStudent").innerHTML = "No student selected";
            document.getElementById("startClubs").innerHTML = "";
            document.getElementById("endBall").className = `rounded-full aspect-square h-1/4 bg-gray-400  flex`;
            document.getElementById("endStudent").innerHTML = "No student selected";
            document.getElementById("endClubs").innerHTML = "";
        }
        if (selected.length === 1) {
            document.getElementById("endBall").className = `rounded-full aspect-square h-1/4 bg-gray-400  flex`;
            document.getElementById("endStudent").innerHTML = "No student selected";
            document.getElementById("endClubs").innerHTML = "";
        } else if (selected.length === 2) {
            document.getElementById("endBall").className = `rounded-full aspect-square h-1/4 ${selected[1].color} flex`;
            document.getElementById("endStudent").innerHTML = "Student #" + (selected[1].id*1 + 1);
            document.getElementById("endClubs").innerHTML = students[selected[1].id].length + " club" + cardinal(students[selected[1].id].length);
        }
    }
    canvas.appendChild(studentNode);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function cardinal(num) {
    if (num == 1) return "";
    return "s";
}
function createConnectionNode(id1, id2, weight, special = false) {
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
    connectionNode.style.opacity = special ? 0.7 : selected.length == 2 ? 0.05 : opacity;

    canvas.appendChild(connectionNode);
}

document.getElementById("startSearch").addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
        var input = document.getElementById("startSearch").value-1;
        document.getElementById("startSearch").value = "";
        var node = document.querySelector(`[data-id="${input}"]`);
        if (!node) {
            return;
        }
        node.click();
    }
})

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
function calculateRotation(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}
function getColor(num) {
    if (num < 1) {
        return "bg-blue-50/0 hidden ";
    } else if (num < 2) {
        return "bg-blue-100";
    } else if (num < 3) {
        return "bg-blue-200";
    } else if (num < 4) {
        return "bg-blue-300";
    } else if (num < 5) {
        return "bg-blue-400";
    } else if (num < 6) {
        return "bg-blue-500";
    } else if (num < 7) {
        return "bg-blue-600";
    } else if (num < 8) {
        return "bg-blue-700";
    } else if (num < 9) {
        return "bg-blue-800";
    } else {
        return "bg-blue-900";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    regenerate();
});

/*
setInterval(() => {
    regenerate();
}, 10000);
*/