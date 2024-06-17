// 由于编辑器设置不同，缩进可能出现混乱

// 常量定义
const px = (n) => {
    return n.toString() + "px";
}
const unpx = (s) => {
    return parseInt(s.substring(0, s.length - 2));
}
const ControlX = 120;

const TextStart = "开始/停止";
const TextReset = "重置";
const TextSpeedUp = "加速";
const TextSpeedDown = "减速";
const TextSpeed = (speed) => {
    return "速度: " + speed.toString() + ":20";
}
const TextGen = (gen) => {
    return "迭代: " + gen.toString();
}

// 新建一个DOM节点的模板函数
function newNode(tag, attrs, inner, events) {
    let node = document.createElement(tag);
    for (attr in attrs) {
	node.setAttribute(attr, attrs[attr]);
    }
    if (inner) { node.append(inner); }
    for (event in events) {
	node.addEventListener(event, events[event]);
    }
    return node;
}

// 单次迭代，使用[[2,2,2],[2,1,2],[2,2,2]]作为卷积核进行卷积操作
function step(data, x, y, grid) {
    let [ ... last] = data;
    for (let i = 1; i < y - 1; i = i + 1) {
	for (let j = 1; j < x - 1; j = j + 1) {
	    let sum = last[( i      * grid * x * grid +  j      * grid) * 4] +
	        2 * ( last[((i - 1) * grid * x * grid + (j - 1) * grid) * 4] +
		      last[((i - 1) * grid * x * grid +  j      * grid) * 4] +
		      last[((i - 1) * grid * x * grid + (j + 1) * grid) * 4] +
		      last[( i      * grid * x * grid + (j - 1) * grid) * 4] +
		      last[( i      * grid * x * grid + (j + 1) * grid) * 4] +
		      last[((i + 1) * grid * x * grid + (j - 1) * grid) * 4] +
		      last[((i + 1) * grid * x * grid +  j      * grid) * 4] +
		      last[((i + 1) * grid * x * grid + (j + 1) * grid) * 4] );
	    if (sum >= 10 * 255 && sum <= 12 * 255) {
		for (let di = 0; di < grid; di = di + 1) {
		    for (let dj = 0; dj < grid; dj = dj + 1) {
			data[((i * grid + di) * x * grid + (j * grid + dj)) * 4 + 0] = 0;
			data[((i * grid + di) * x * grid + (j * grid + dj)) * 4 + 1] = 0;
			data[((i * grid + di) * x * grid + (j * grid + dj)) * 4 + 2] = 0;
		    }
		}
	    } else {
		for (let di = 0; di < grid; di = di + 1) {
		    for (let dj = 0; dj < grid; dj = dj + 1) {
			data[((i * grid + di) * x * grid + (j * grid + dj)) * 4 + 0] = 255;
			data[((i * grid + di) * x * grid + (j * grid + dj)) * 4 + 1] = 255;
			data[((i * grid + di) * x * grid + (j * grid + dj)) * 4 + 2] = 255;
		    }
		}
	    }
	}
    }
}

const timerList = [];
const objList = [];

// Conway类的构造函数
function Conway(id, grid, scale, src) {
    this.holder = document.getElementById(id);
    this.imgload = false;
    this.run = false;
    this.speed = 1;
    this.generation = 0;
    this.counter = 0;

    // 读取图片数据，并载入初始状态
    let img = new Image();
    img.onload = () => {
	console.log("load: ", src);
	this.sizex = img.width;
	this.sizey = img.height;
	this.totalx = grid * this.sizex;
	this.totaly = grid * this.sizey;
	console.log(this.sizex, this.sizey);
	console.log(this.totalx, this.totaly);
	this.holder.style["width"] = px(this.totalx + ControlX);
	this.holder.style["height"] = px(this.totaly);
	this.holder.style["transform-origin"] = "top left";
	this.holder.style["transform"] = "scale(" + scale.toString() + ")";
	
	this.canvas.width = this.sizex * grid;
	this.canvas.height = this.sizey * grid;
	
	this.ctx = this.canvas.getContext("2d", { "alpha": false });
	this.ctx.mozImageSmoothingEnabled = false;
	this.ctx.webkitImageSmoothingEnabled = false;
	this.ctx.msImageSmoothingEnabled = false;
	this.ctx.imageSmoothingEnabled = false;
	
	this.ctx.drawImage(img, 0, 0, this.totalx, this.totaly);
	
	this.imgload = true;
    };
    img.src = src;

    this.nextGeneration = () => {
	let imgdata = this.ctx.getImageData(0, 0, this.totalx, this.totaly);
	step(imgdata.data, this.sizex, this.sizey, grid);
	this.ctx.putImageData(imgdata, 0, 0);
	
	this.generation = this.generation + 1;
	this.genText.innerHTML = TextGen(this.generation);
    };
    
    
    this.holder.setAttribute("class", "conway-holder");
    
    this.holder.append(this.canvas = newNode("canvas", {
	"class": "conway-canvas"
    }, undefined, {}));
    
    //以下代码添加侧边栏控制按钮：
    this.holder.append(this.control = newNode("div", {
	"class": "conway-control"
    }, undefined, {}));

    this.control.append(newNode("div", {
	"class": "conway-button",
    }, newNode("span", {
	"class": "conway-button-text"
    }, TextStart), {
	"click": (event) => {
	    let f = this.run;
	    for (i in objList) {
		objList[i].run = false;
	    }
	    this.run = !f;
	}
    }));
    
    this.control.append(newNode("div", {
	"class": "conway-button",
    }, newNode("span", {
	"class": "conway-button-text"
    }, TextReset), {
	"click": (event) => {
	    this.run = false;
	    this.generation = 0;
	    this.genText.innerHTML = TextGen(this.generation);
	    this.ctx.drawImage(img, 0, 0, this.totalx, this.totaly);
	}
    }));

    this.control.append(newNode("div", {
	"class": "conway-button",
    }, newNode("span", {
	"class": "conway-button-text"
    }, TextSpeedUp), {
	"click": (event) => {
	    this.speed = this.speed + 1;
	    if (this.speed > 20) { this.speed = 20; }
	    this.speedText.innerHTML = TextSpeed(this.speed);
	}
    }));

    this.control.append(newNode("div", {
	"class": "conway-button",
    }, newNode("span", {
	"class": "conway-button-text"
    }, TextSpeedDown), {
	"click": (event) => {
	    this.speed = this.speed - 1;
	    if (this.speed < 1) { this.speed = 1; }
	    this.speedText.innerHTML = TextSpeed(this.speed);
	}
    }));

    this.control.append(newNode("div", {
	"class": "conway-button"
    }, this.speedText = newNode("span", {
	"class": "conway-button-text"
    }, TextSpeed(this.speed)), {}));

    this.control.append(newNode("div", {
	"class": "conway-button"
    }, this.genText = newNode("span", {
	"class": "conway-button-text"
    }, TextGen(this.generation)), {}));

    timerList.push(() => {
	if (this.imgload && this.run) {
	    this.counter = this.counter + 1;
	    if (this.counter >= 9 - this.speed) {
		this.counter = 0;
		this.nextGeneration();
	    }
	}
    });
    objList.push(this);
}

function init() {
    let handle = setInterval(() => {
	for (i in timerList) {
	    timerList[i]();
	}
    }, 50);
}

//一些杂项代码，处理分页
const panels = [];

function switchPanel(s) {
    for (i in objList) {
	objList[i].run = false;
    }
    for (i in panels) {
	if (panels[i] == s) {
	    document.getElementById(panels[i]).style["display"] = "block";
	} else {
	    document.getElementById(panels[i]).style["display"] = "none";
	}
    }
}
