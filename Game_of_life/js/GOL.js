
let sliderGroup = [];
let brush = [
    [2, 2],
    [0, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
    [1, 0, 1]
];

let w = $("#myContainer").width(); //画布宽度
let pre = w;
let h = $("#myContainer").height(); //画布高度
let map_w = 0; //地图宽度
let map_h = 0; //地图高度
let map_border = 5; //画布边框
let box_w = 15; //格子宽度
let init_d; //镜头的初始化距离
let dx = 0; //镜头x偏移
let dy = 0; //镜头y偏移
let d = 0; //镜头距离
let showFrameDT = 0; //帧数显总示间隔
let drawBlockDT = 0;
let sum_drawBlockDT = 0;
let calDT = 0; //演算间隔
let sum_calDT = 0; //演算总间隔
let panValue=1; //画笔值 

let showGird = true;




// console.log(h);
function setup() {

    // console.log("82");
    draw_brushes();

    let myCanvas = createCanvas(w, 500, WEBGL);
    myCanvas.parent("myContainer");
    init_d = ((500) / (2 * tan(PI * 1000 / 6000)));
    // sliderGroup[0] = createSlider(100, 1000,500, -10);

    h = parseInt($("#myContainer").find("canvas").height());
    w = parseInt($("#myContainer").find("canvas").width());

    $("#mapW").change(function () {
        if (isNaN(parseInt($(this).val()))) {
            alert("输入有误！");
            $(this).val(map_w);
            return;
        }
        map_w = parseInt($(this).val());
        if (map_w < 2) {
            $(this).val(2);
            map_w = 2;
        }
    });
    $("#mapH").change(function () {
        if (isNaN(parseInt($(this).val()))) {
            alert("输入有误！");
            $(this).val(map_h);
            return;
        }
        map_h = parseInt($(this).val());
        if (map_h < 2) {
            $(this).val(2);
            map_h = 2;
        }
    });

    map_w = parseInt($("#mapW").val());
    map_h = parseInt($("#mapH").val());
    dx = (map_w / 2) * box_w;
    dy = (map_h / 2) * box_w;
    block_group = new Array(parseInt(map_h));
    // console.log(block_group.length+" map_h:"+map_h);
    block_group_next = new Array(parseInt(map_h));
    for (let j = 0; j < map_h; j++) {
        block_group[j] = new Array(map_w);
        // console.log(j+"  "+block_group[j].length+" "+(w / box_w).toFixed(0));
        block_group_next[j] = new Array(map_w);
        for (let k = 0; k < block_group[j].length; k++) {
            block_group[j][k] = 0;
            block_group_next[j][k] = 0;
        }
    }
    perspective(PI / 3.0, width / height, 100, 15000);


    $("#stop_cal").prop("disabled", "true");
    $("#showGird").prop("checked", true);
    $("#start_cal").click(function () {
        // console.log(start_cal);
        start_cal = true;
        $("#start_cal").prop("disabled", true);
        $("#one_step_cal").prop("disabled", true);
        $("#stop_cal").prop("disabled", false);
    });

    $("#stop_cal").click(function () {
        // console.log(start_cal);
        start_cal = false;
        $("#start_cal").prop("disabled", false);
        $("#one_step_cal").prop("disabled", false);
        $("#stop_cal").prop("disabled", true);
    });
    $("#one_step_cal").click(function () {
        // console.log(start_cal);
        gen_block();
    });
    $("#calDT").change(function () {
        if (isNaN(parseInt($(this).val()))) {
            alert("输入有误！");
            $(this).val(calDT);
            return;
        }
        calDT = parseInt($(this).val());
        if (calDT < 1) {
            $(this).val(1);
            calDT = 1;
        }
    });
    calDT = parseInt($("#calDT").val());
    $("#linkLR").click(function () {
        if ($("#linkLR").prop("checked") == "checked" || $("#linkLR").prop("checked") == true) {
            isLinkLR = true;
        } else {
            isLinkLR = false;
        }
        // console.log(isLinkLR);
    });
    $("#linkUD").click(function () {
        if ($("#linkUD").prop("checked") == "checked" || $("#linkUD").prop("checked") == true) {
            isLinkUD = true;
        } else {
            isLinkUD = false;
        }
    });
    $("#cleanMap").click(function () {
        for (let i = 0; i < block_group.length; i++) {
            for (let j = 0; j < block_group[i].length; j++) {
                // if(block_group[i][j]==1){
                block_group[i][j] = 0;
                // }
            }
        }
    });
    $("#showGird").click(function () {
        if ($("#showGird").prop("checked") == "checked" || $("#showGird").prop("checked") == true) {
            showGird = true;
        } else {
            showGird = false;
        }
    });

    $(".mBrush").click(function () {
        $(this).siblings().css(
            {
                "border": "0px solid rgb(112,112,112)"
            }
        );
        $(this).css(
            {
                "border": "2px solid rgb(112,112,112)"
            }
        );
        let brush_id = $(this).find("div").find("div").attr("id");
        brush_id = brush_id.replace("mBrush", "");
        brush_id = parseInt(brush_id);
        brush = myCanvas_brush_map[brush_id];
        // move=false;
    });

    $("#panValue").click(function(){
        if ($(this).prop("checked") == "checked" || $(this).prop("checked") == true) {
            panValue = 0;
        } else {
            panValue = 1;
        }
    });

    $("#createBrush").click(function(){
        brushCreating=true;
        $("#createBrushMenu").show();
        $("#createBrushMenu").css(
            {
                "top":windowHeight/2+$(document).scrollTop()
            }
        );
    });
    $("#createThisBrush").click(function () {
        menuOpen=true;
        brushCreating=true;
        if($("#brushName").val()=='' || $("#brushAuthor").val()==''){
            alert("画笔名字或作者不能为空");
        }else{
            brush_name=$("#brushName").val();
            brush_author=$("#brushAuthor").val();
            createBrush();
        }
    });
    $("#closeCreateBrush").click(function () {
        
        $(this).parent().find("input[type=text]").val("");
        $(this).parent().hide();
        brushCreating=false;
        menuOpen=true;
    });

}


function draw() {
    // init_d=((500 ) /(2*tan(PI*1000/6000)));
    w = $("#myContainer").width();
    if (w != pre) {
        // console.log("c");
        pre = w;
        resizeCanvas(w, 500);
        // let myCanvas = createCanvas(w, 500, WEBGL);
        // myCanvas.parent("myContainer");
        perspective(PI / 3.0, width / height, 100, 15000);
        // background(0);
    }
    if (block_group.length != map_h) {
        // console.log(block_group.length+" map_h:"+map_h);
        block_group = new Array(parseInt(map_h));
        block_group_next = new Array(parseInt(map_h));
        // console.log(block_group.length+" map_h:"+map_h);
        for (let i = 0; i < block_group.length; i++) {
            block_group[i] = new Array(parseInt(map_w));
            block_group_next[i] = new Array(parseInt(map_w));
            // console.log(block_group[i].length+" map_w:"+map_w);

            // for (let k = 0; k < block_group[i].length; k++) {
            //     block_group[i][k] = 0;
            //     // block_group_next[j][k] = 0;
            // }
        }
    }
    if (block_group[0].length != map_w) {
        for (let i = 0; i < block_group.length; i++) {
            block_group[i] = new Array(parseInt(map_w));
            block_group_next[i] = new Array(parseInt(map_w));
        }
    }

    w = $("#myContainer").find("canvas").width();
    // console.log($("#myContainer").find("canvas").height());
    background(220);

    let X = $("#mainX").val();
    // let Z = $("#mainSize").val();
    d = $("#mainSize").val();
    // square(mouseX_in_camera, mouseY_in_camera, box_w);
    // square(mouseX_in_camera,mouseY_in_camera, box_w);
    // console.log(mouseX);
    camera(dx, dy, d, dx, dy, 0, 0, 1, 0);
    // camera(0,0, d, 0, 0, 0,0, 1 ,0);
    // circle(30, 130, 20);
    // stroke(255);



    if (start_cal) {
        // console.log("scal");
        sum_calDT += deltaTime;
        if (sum_calDT >= calDT) {
            sum_calDT = 0; d
            gen_block();
        }

    }
    showFrameDT += deltaTime;
    if (showFrameDT >= 500) {
        $("#frameRate").parent().next().text(floor(frameRate()));
        showFrameDT = 0;
    }

    if(frameRate()<50){
        drawBlockDT=(200-frameRate())*10;
    }else{
        drawBlockDT=0;
    }
    sum_drawBlockDT+=deltaTime;
    if(sum_drawBlockDT>drawBlockDT){
        draw_blocks();
    }
    


    _mouseHover();
    _mouseOperation();

    if(select_show){
        // push();
        c = color(255,173,234,50); // Update 'c' with grayscale value
        fill(c);
        stroke(0);
        let s_x=min(select_point2_x,select_point1_x);
        let s_y=min(select_point2_y,select_point1_y);
        let s_w=max(select_point2_x,select_point1_x)-s_x+1;
        let s_h=max(select_point2_y,select_point1_y)-s_y+1;

        rect(s_x*box_w, s_y*box_w, s_w*box_w, s_h*box_w);
        // pop();
        fill(255);
    }
    
}


let myCanvas_brush;
let myCanvas_brush_map;
function draw_brushes() {
    myCanvas_brush = new Array($("#brushes_bar").attr("brushNum"));
    myCanvas_brush_map = new Array($("#brushes_bar").attr("brushNum"));
    $.getJSON("./brush/brushes.json", function (data) {
        // console.log("1");
        var i = 0;
        $.each(data, function (h, info) {
            myCanvas_brush[i] = createGraphics(80, 80);
            myCanvas_brush[i].parent("mBrush" + i);
            let len = info["points"].length;
            myCanvas_brush_map[i] = new Array(len + 1);
            myCanvas_brush_map[i][0] = info["size"];
            for (let p = 0; p < len; p++) {
                myCanvas_brush_map[i][p + 1] = info["points"][p];
            }
            // myCanvas_brush[i].background(200);
            // myCanvas_brush[_].show();

            // console.log(i);
            i++;
        });
        //画
        for (let i = 0; i < myCanvas_brush.length; i++) {
            myCanvas_brush[i].show();
            // square(mouseX_in_camera, mouseY_in_camera, box_w);
            // myCanvas_brush[i].
            myCanvas_brush[i].fill(0);
            myCanvas_brush[i].stroke(255);
            let little_box_w;
            if (max(myCanvas_brush_map[i][0][0], myCanvas_brush_map[i][0][1]) > 8 ) {
                little_box_w = parseFloat(77 / max(myCanvas_brush_map[i][0][0], myCanvas_brush_map[i][0][1]));
                // console.log(little_box_w);
                myCanvas_brush[i].noStroke();
            }else {
                little_box_w = 10;
            }
            let dx = parseInt(40 / little_box_w - myCanvas_brush_map[i][0][0] / 2);
            let dy = parseInt(40 / little_box_w - myCanvas_brush_map[i][0][1] / 2);

            
            for (let j = 1; j < myCanvas_brush_map[i].length; j++) {
                myCanvas_brush[i].square((dx + myCanvas_brush_map[i][j][0]) * little_box_w, (dy + myCanvas_brush_map[i][j][1]) * little_box_w, little_box_w);
            }
        }
        isOperating = true;
        $(".mBrush").eq(0).click();
        isOperating=false;
        // move=true;
    });

}

let start_cal = false;
let block_group;
let block_group_next;
let block_dx = [-1, 0, 1, -1, 1, -1, 0, 1];
let block_dy = [-1, -1, -1, 0, 0, 1, 1, 1];
let isLinkLR;
let isLinkUD;

function gen_block() {
    // block_group_next=block_group;
    let book = [];
    book = new Array(block_group.length);
    for (let i = 0; i < block_group.length; i++) {
        book[i] = new Array(block_group[i].length);
        for (let j = 0; j < block_group[i].length; j++) {

            book[i][j] = 0;
            block_group_next[i][j] = 0;
        }
    }
    for (let i = 0; i < block_group.length; i++) {
        for (let j = 0; j < block_group[i].length; j++) {
            if (block_group[i][j] == 1) {
                //计算周围的方块
                // console.log(i+" "+j);
                for (let m = -1; m <= 1; m++) {
                    for (let n = -1; n <= 1; n++) {

                        let r_y = i + m;
                        let r_x = j + n;
                        if (isLinkLR) {

                            if (r_x < 0) {
                                // console.log("---" + r_x);
                                r_x += block_group[i].length;
                                // console.log(r_x);
                            } else if (r_x >= block_group[i].length) {
                                // console.log("---" + r_x);
                                r_x -= block_group[i].length;
                                // console.log(r_x);
                            }

                        }
                        if (isLinkUD) {
                            if (r_y < 0) {
                                r_y += block_group.length;
                            } else if (r_y >= block_group.length) {
                                r_y -= block_group.length;
                            }
                        }
                        if (0 <= r_y && r_y < block_group.length &&
                            0 <= r_x && r_x < block_group[i].length &&
                            book[r_y][r_x] != 1) {
                            //计算周围的方块的周围
                            /*
                            大于3小于2死亡
                            等于3生
                            */
                            let life_num = 0;
                            for (let k = 0; k < 8; k++) {
                                let ny = r_y + block_dy[k];//行
                                let nx = r_x + block_dx[k];//列
                                if (isLinkLR) {
                                    // console.log(nx);
                                    if (nx < 0) {
                                        nx += block_group[i].length;
                                    } else if (nx >= block_group[i].length) {
                                        nx -= block_group[i].length;
                                    }
                                    // console.log(nx);
                                }
                                if (isLinkUD) {
                                    if (ny < 0) {
                                        ny += block_group.length;
                                    } else if (ny >= block_group.length) {
                                        ny -= block_group.length;
                                    }
                                }
                                // console.log((i + m)+" "+(i+n)+" "+ny+" "+nx+" dx:"+block_dx[k]);
                                if (0 <= ny && ny < block_group.length &&
                                    0 <= nx && nx < block_group[i].length &&
                                    block_group[ny][nx] == 1) {
                                    life_num++;
                                }
                                // console.log(life_num);
                            }
                            /*
                            大于3小于2死亡
                            等于3生
                            */
                            if (life_num > 3 || life_num < 2) {
                                // console.log("si");
                                block_group_next[r_y][r_x] = 0;
                            } else if (life_num == 3) {
                                // console.log("shenh");
                                block_group_next[r_y][r_x] = 1;
                                // console.log("---"+(i + m)+" "+(i+n));
                            } else {
                                block_group_next[r_y][r_x] = block_group[r_y][r_x];
                            }
                            book[r_y][r_x] = 1;
                        }

                    }
                }



            }
        }
    }

    // let temp=block_group_next;
    // block_group=block_group_next;
    for (let i = 0; i < block_group.length; i++) {
        for (let j = 0; j < block_group[i].length; j++) {

            block_group[i][j] = block_group_next[i][j];
        }
    }

}

function draw_blocks() {

    let draw_d = (-10 - box_w) * (d / init_d);
    let right_draw_d = (w + 20) * (d / init_d);
    let bottom_draw_d = (h + (20)) * (d / init_d);
    let p_x = dx - ((w / 2)) * (d / init_d);
    let p_y = dy - ((h / 2)) * (d / init_d);
    if (showGird) {
        stroke(201, 201, 201, 1);
    } else {
        // stroke(255);
        noStroke();
    }
    let linestep = 1;
    if (d < 1000) {
        linestep = 1;
    } else if (d >= 1000 && d < 2000) {
        linestep = 4;
    } else if (d >= 2000 && d < 3000) {
        linestep = 6;
    } else if (d >= 3000 && d < 4000) {
        linestep = 12;
    } else {
        linestep = 16;
    }
    for (let j = 0; j <= map_h; j += linestep) {
        let lineY_in_camera = j * box_w - p_y;
        if (draw_d <= lineY_in_camera &&
            lineY_in_camera <= bottom_draw_d) {
            line(0, j * box_w, map_w * box_w, j * box_w);
        }
    }
    for (let i = 0; i <= map_w; i += linestep) {
        let lineX_in_camera = i * box_w - p_x;
        if (draw_d <= lineX_in_camera &&
            lineX_in_camera <= right_draw_d) {
            line(i * box_w, 0, i * box_w, map_h * box_w);
        }
    }
    rect(0, 0, map_w * box_w, map_h * box_w);
    fill(0);
    // strokeWeight(5);
    noStroke();
    for (let j = 0; j < map_h; j++) {
        for (let i = 0; i < map_w; i++) {
            // noStroke();
            //画出相机视角内的黑块
            let blockX_in_camera = i * box_w - p_x;
            let blockY_in_camera = j * box_w - p_y;

            // let nx = parseInt(mouseX_in_camera / box_w);
            // let ny = parseInt(mouseY_in_camera / box_w);

            if (draw_d <= blockX_in_camera &&
                blockX_in_camera <= right_draw_d &&
                draw_d <= blockY_in_camera &&
                blockY_in_camera <= bottom_draw_d) {
                if (block_group[j][i] == 1) {
                    square(blockX_in_camera + p_x, blockY_in_camera + p_y, box_w);
                    // point(blockX_in_camera + p_x+10, blockY_in_camera + p_y+10);

                }
                // } else {
                //     fill(255);
                //     square(i * box_w, j * box_w, box_w);
                // }
            }


        }
    }
    fill(255);
    // strokeWeight(1);
}

function mousePressed(event) {
    // console.log(event);
    // return false;
}

function mouseClicked(event) {
    // console.log("click123");
    // console.log(menuOpen);
    // console.log(event);
    if(isOperating||menuOpen ||brushCreating){
        menuOpen=false;
        return;
    }
    if(select_show){
        select_show=false;
        return;
    }
    
    
    if (
        0 <= mouseX && mouseX < w &&
        0 <= mouseY && mouseY < h) {
        let d = $("#mainSize").val();
        let mouseX_in_camera = (mouseX - (w / 2)) * (d / init_d) + dx - (map_border * 2) * (d / init_d);
        let mouseY_in_camera = (mouseY - (h / 2)) * (d / init_d) + dy - (map_border * 2) * (d / init_d);

        let brush_points = brush.length - 1;
        let r_x = parseInt(brush[0][0] / 2);
        let r_y = parseInt(brush[0][1] / 2);
        for (let j = 0; j <= map_h; j++) {
            for (let i = 0; i <= map_w; i++) {
                if (
                    i * box_w < mouseX_in_camera &&
                    mouseX_in_camera < i * box_w + box_w &&
                    j * box_w < mouseY_in_camera &&
                    mouseY_in_camera < j * box_w + box_w) {
                    // if (block_group[j][i] == 1) {
                    //     block_group[j][i] = 0;
                    // } else {

                    // console.log()
                    for (let br = 1; br <= brush_points; br++) {
                        // console.log(br);

                        if (0 <= i + (brush[br][0] - r_x) &&
                            i + (brush[br][0] - r_x) < map_w &&
                            0 <= j + (brush[br][1] - r_y) &&
                            j + (brush[br][1] - r_y) < map_h) {
                                // console.log(br);
                            // console.log("y:" + new_y + (brush[br][1] - r_y) + " x:" + new_x + (brush[br][0] - r_x));
                            block_group[j + (brush[br][1] - r_y)][i + (brush[br][0] - r_x)] = panValue;
                        }
                    }
                    // block_group[j][i] = 1;
                    // }

                }
                // noStroke();ddddddddddd
            }
        }
        pre_mouseDraw_x = parseInt(mouseX_in_camera / box_w);
        pre_mouseDraw_y = parseInt(mouseY_in_camera / box_w);

        return false;
    }

}

function _mouseHover() {
    if(isOperating || select_show|| menuOpen||brushCreating){
        return;
    }
    let mouseX_in_camera = (mouseX - (w / 2)) * (d / init_d) + dx - (map_border * 2) * (d / init_d);
    let mouseY_in_camera = (mouseY - (h / 2)) * (d / init_d) + dy - (map_border * 2) * (d / init_d);
    let nx = parseInt(mouseX_in_camera / box_w) * box_w;
    let ny = parseInt(mouseY_in_camera / box_w) * box_w;
    // nx-=parseInt(brush[0][0]);
    // ny-=parseInt(brush[0][1]);
    if (0 <= nx && nx < map_w * box_w &&
        0 <= ny && ny < map_h * box_w) {
        fill(208, 208, 208);
        let brush_points = brush.length - 1;
        // console.log(brush_points);
        let r_x = parseInt(brush[0][0] / 2);
        let r_y = parseInt(brush[0][1] / 2);
        // console.log()
        for (let i = 1; i <= brush_points; i++) {

            if (0 <= nx + (brush[i][0] - r_x) * box_w &&
                nx + (brush[i][0] - r_x) * box_w < map_w * box_w &&
                0 <= ny + (brush[i][1] - r_y) * box_w &&
                ny + (brush[i][1] - r_y) * box_w < map_h * box_w) {
                square(nx + (brush[i][0] - r_x) * box_w, ny + (brush[i][1] - r_y) * box_w, box_w);
            }
        }

        fill(255);
    }

    showFrameDT += deltaTime;
    if (showFrameDT >= 500) {
        $("#frameRate").parent().next().text(floor(frameRate()));
        showFrameDT = 0;
    }
}

function drawing() {

    if (mouseIsPressed) {
        // console.log("123");

        mouseDrawing();
    } else {
        let d = $("#mainSize").val();
        let mouseX_in_camera = (mouseX - (w / 2)) * (d / init_d) + dx - (map_border * 2) * (d / init_d);
        let mouseY_in_camera = (mouseY - (h / 2)) * (d / init_d) + dy - (map_border * 2) * (d / init_d);
        pre_mouseDraw_x = parseInt(mouseX_in_camera / box_w);
        pre_mouseDraw_y = parseInt(mouseY_in_camera / box_w);
    }

}
let pre_mouseDraw_x;
let pre_mouseDraw_y;
let isSuccession;
function mouseDrawing() {
    let d = $("#mainSize").val();
    let mouseX_in_camera = (mouseX - (w / 2)) * (d / init_d) + dx - (map_border * 2) * (d / init_d);
    let mouseY_in_camera = (mouseY - (h / 2)) * (d / init_d) + dy - (map_border * 2) * (d / init_d);

    let nx = parseInt(mouseX_in_camera / box_w);
    let ny = parseInt(mouseY_in_camera / box_w);
    let sum_step = max(abs(pre_mouseDraw_x - nx), abs(pre_mouseDraw_y - ny));

    let brush_points = brush.length - 1;
    let r_x = parseInt(brush[0][0] / 2);
    let r_y = parseInt(brush[0][1] / 2);
    for (let d_step = 0; d_step <= sum_step; d_step++) {
        let new_x = parseInt(nx + d_step * ((pre_mouseDraw_x - nx) / sum_step));
        let new_y = parseInt(ny + d_step * ((pre_mouseDraw_y - ny) / sum_step));
        if (0 <= new_x && new_x < map_w &&
            0 <= new_y && new_y < map_h) {

            for (let br = 1; br <= brush_points; br++) {
                if (0 <= new_x + (brush[br][0] - r_x) &&
                    new_x + (brush[br][0] - r_x) < map_w &&
                    0 <= new_y + (brush[br][1] - r_y) &&
                    new_y + (brush[br][1] - r_y) < map_h) {
                    // console.log("y:" + new_y + (brush[br][1] - r_y) + " x:" + new_x + (brush[br][0] - r_x));
                    block_group[new_y + (brush[br][1] - r_y)][new_x + (brush[br][0] - r_x)] = panValue;
                }
            }
            // console.log("y:" + new_y + " x:" + new_x);

            // block_group[new_y][new_x] = 1;

        }
    }
    pre_mouseDraw_x = nx;
    pre_mouseDraw_y = ny;
}

let new_mouseX = 0;
let pre_mouseX = 0;
let new_mouseY = 0;
let pre_mouseY = 0;
let pre_dx;
let pre_dy;
let press = false;
let isOperating = false;
function _moveMap() {
    if (mouseIsPressed &&
        press == false &&
        0 < mouseX && mouseX <= w &&
        0 < mouseY && mouseY <= h) {
        pre_mouseX = mouseX;
        pre_mouseY = mouseY;
        pre_dx = dx;
        pre_dy = dy;
        press = true;
        isOperating = false;
        // console.log("123p");
    } else if (!mouseIsPressed) {
        press = false;
        isOperating = false;
    } else {
        new_mouseX = mouseX;
        new_mouseY = mouseY;
        if (press) {
            dx = pre_dx - ((new_mouseX - pre_mouseX) * (d / init_d));
            dy = pre_dy - ((new_mouseY - pre_mouseY) * (d / init_d));
            // press=false;
            // console.log("123C");
        }
        if (new_mouseX != pre_mouseX) {
            isOperating = true;
        }
    }
}

let select_point1_x;
let select_point1_y;
let select_point2_x;
let select_point2_y;
let select_show = false;
let select_start = false;
function selectBlocks() {
    if (mouseIsPressed &&
        isInRange_LcRo(mouseX, 0, w, mouseY, 0, h) &&
        select_start == false) {
        let mouseX_in_camera = (mouseX - (w / 2)) * (d / init_d) + dx - (map_border * 2) * (d / init_d);
        let mouseY_in_camera = (mouseY - (h / 2)) * (d / init_d) + dy - (map_border * 2) * (d / init_d);
        let nx = parseInt(mouseX_in_camera / box_w);
        let ny = parseInt(mouseY_in_camera / box_w);
        if (isInRange_LcRo(nx, 0, map_w, ny, 0, map_w)) {
            select_start = true;
            select_point1_x = nx;
            select_point1_y = ny;
            select_point2_x = nx;
            select_point2_y = ny;
        }
        isOperating=true;
        // console.log(select_point1_x,select_point1_y);
    }else if(mouseIsPressed && select_start){
        let mouseX_in_camera = (mouseX - (w / 2)) * (d / init_d) + dx - (map_border * 2) * (d / init_d);
        let mouseY_in_camera = (mouseY - (h / 2)) * (d / init_d) + dy - (map_border * 2) * (d / init_d);
        let nx = parseInt(mouseX_in_camera / box_w);
        let ny = parseInt(mouseY_in_camera / box_w);
        if (isInRange_LcRo(nx, 0, map_w, ny, 0, map_w)) {
            select_point2_x = nx;
            select_point2_y = ny;
        }
        select_show=true;
    }else if(!mouseIsPressed){
        select_start = false;
        isOperating=false;
    }
}

let pressMouseRight=false;
function _mouseOperation() {
    if (!keyIsDown(68) && !keyIsDown(83)&& mouseButton === LEFT) {
        _moveMap();
    } else if (keyIsDown(83) && mouseButton === LEFT) {
        selectBlocks();
    } else if (keyIsDown(68) && mouseButton === LEFT) {
        drawing();
    }
    if(mouseButton === RIGHT){
        pressMouseRight=true;
    }else{
        pressMouseRight=false;
    }
    // console.log(keyCode);
}

let menuOpen=false;
function mouseReleased(){
    if(pressMouseRight &&
        isInRange_LcRo(mouseX,0,w,mouseY,0,h)){
        $("#menu").show();
        $("#menu").offset(
            {
                "top":winMouseY+$(document).scrollTop(),
                "left":winMouseX+5
            }
        );
        menuOpen=true;
        return false;
    }else{
        $("#menu").hide();
        
    }
}
let brushCreating=false;
let brush_name="未知";
let brush_author="未知";
function createBrush(){
    let selected_w=abs(select_point2_x-select_point1_x)+1; 
    let selected_h=abs(select_point2_y-select_point1_y)+1;
    let new_brush={"name":"","author":"","size":[],"points":[]};
    new_brush["name"]=brush_name;
    new_brush["author"]=brush_author;
    new_brush["size"]=[selected_w,selected_h];

    // let new_brush="{\"name\":\""+brush_name+"\","+
    //             "\"author\":\""+brush_author+"\","+
    //             "\"size\":["+selected_w+","+selected_h+"],";
    let new_brush_points=new Array();
    let new_brush_points_num=0;

    let startY=min(select_point1_y,select_point2_y);
    let endY=max(select_point1_y,select_point2_y);
    let startX=min(select_point1_x,select_point2_x);
    let endX=max(select_point1_x,select_point2_x);
    for(let x=startX;x<=endX;x++){
        for(let y=startY;y<=endY;y++){
            if(block_group[y][x]==1){
                new_brush_points.push(new Array(x-startX,y-startY));

            }
        }
    }
    new_brush["points"]=new_brush_points;
    let new_brush_str=JSON.stringify(new_brush, null,"\t");
    new_brush_str =new_brush_str.replace(/\[\n\t+(\d+)/g,"[$1");
    new_brush_str =new_brush_str.replace(/,\n\t+(\d+)/g,",$1");
    new_brush_str =new_brush_str.replace(/(\d+)\n\t+]/g,"$1]");
    console.log( new_brush_str);


}


function mouseWheel(event) {
    // print(event.delta);
    if (0 < mouseX && mouseX < w &&
        0 < mouseY && mouseY < h) {

        if (event.delta > 0) {
            $("#mainSize").val(parseInt($("#mainSize").val()) + 50 * (d / init_d));
        } else {
            $("#mainSize").val(parseInt($("#mainSize").val()) - 50 * (d / init_d));
        }
        return false;
    }


}

function rotate_brush(){
    let new_brush=new Array(brush,length);
    for(let i=0;i<brush.length;i++){
        new_brush[i]=new Array(2);
        new_brush[i][0]=brush[i][0];
        new_brush[i][1]=brush[i][1];
    }
    new_brush[0][0]=brush[0][1];
    new_brush[0][1]=brush[0][0];
    for(let i=1;i<brush.length;i++){
        new_brush[i][0]=-brush[i][1]+brush[0][1]-1;
        new_brush[i][1]=brush[i][0];
    }
    brush=new_brush;
}
function flip_brush(option){
    let new_brush=new Array(brush,length);
    for(let i=0;i<brush.length;i++){
        new_brush[i]=new Array(2);
        new_brush[i][0]=brush[i][0];
        new_brush[i][1]=brush[i][1];
    }
    switch(option){
        case 0:{ //水平翻转
            for(let i=1;i<brush.length;i++){
                new_brush[i][0]=brush[0][0]-brush[i][0]-1;
            }
            break;
        }
        case 1:{
            for(let i=1;i<brush.length;i++){
                new_brush[i][1]=brush[0][1]-brush[i][1]-1;
            }
            break;
        }
    }
    // print(new_brush);
    brush=new_brush;
}

function keyTyped(){
    if(key === 'r'){
        rotate_brush();
    }else if(key === 'z'){
        flip_brush(0);
    }else if(key === 'x'){
        flip_brush(1);
    }
}
function isInRange_LcRo(v1, v1l, v1r, v2, v2l, v2r) {
    if (v1l <= v1 && v1 < v1r &&
        v2l <= v2 && v2 < v2r) {
        return true;
    }
    return false;
}