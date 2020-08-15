
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
let w_c = parseFloat($("#myContainer").width());
let h_c = parseFloat($("#myContainer").height());
let map_w = 0; //地图宽度
let map_h = 0; //地图高度
let map_border = 5; //画布边框
let box_w = 15; //格子宽度
let init_d; //镜头的初始化距离
let dx = 0; //镜头x偏移
let dy = 0; //镜头y偏移
let d = 0; //镜头距离
let showFrameDT = 0; //帧数显总示间隔
let drawBlockDY = 0;
let sum_drawBlockDY = 0;
let next_drawBlockDY = 0;
let calDT = 0; //演算间隔
let sum_calDT = 0; //演算总间隔
let panValue = 1; //画笔值 

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
    h_c = parseFloat($("#myContainer").height());
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
    drawBlockDY = parseInt(map_h);
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
                block_group_next[i][j] = 0;
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

    

    $("#panValue").click(function () {
        if ($(this).prop("checked") == "checked" || $(this).prop("checked") == true) {
            panValue = 0;
        } else {
            panValue = 1;
        }
    });

    $("#createBrush").click(function () {
        brushCreating = true;
        $("#createBrushMenu").show();
        $("#createBrushMenu").css(
            {
                "top": windowHeight / 2 + $(document).scrollTop()
            }
        );
    });
    $("#createThisBrush").click(function () {
        menuOpen = true;
        brushCreating = true;
        if ($("#brushName").val() == '' || $("#brushAuthor").val() == '') {
            alert("画笔名字或作者不能为空");
        } else {
            brush_name = $("#brushName").val();
            brush_author = $("#brushAuthor").val();
            createBrush();
        }
    });
    $("#closeCreateBrush").click(function () {

        $(this).parent().find("input[type=text]").val("");
        $(this).parent().hide();
        brushCreating = false;
        menuOpen = true;
    });
    $("#blurDebug").click(function () {

        if ($(this).prop("checked") == "checked" || $(this).prop("checked") == true) {
            blur_debug = true;
            blur_w = 1;
            ignoreWhite = 0;
            ignoreWhite_block=0;
        } else {
            blur_debug = false;
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
}


function draw() {
    // init_d=((500 ) /(2*tan(PI*1000/6000)));
    // w = parseFloat( $("#myContainer").width() );
    w_c = parseFloat($("#myContainer").width());
    // h_c = parseFloat( $("#myContainer").height() );
    if (w_c != pre) {
        // console.log("c");
        pre = w_c;
        resizeCanvas(w_c, 500);
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
    background(205);

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
    // pixelDensity(2);
    // if(frameRate()<50){
    //     drawBlockDT=(200-frameRate())*10;
    // }else{
    //     drawBlockDT=0;
    // }
    draw_blocks();




    _mouseHover();
    _mouseOperation();

    if (select_show) {
        // push();
        c = color(255, 173, 234, 50); // Update 'c' with grayscale value
        fill(c);
        stroke(0);
        let s_x = min(select_point2_x, select_point1_x);
        let s_y = min(select_point2_y, select_point1_y);
        let s_w = max(select_point2_x, select_point1_x) - s_x + 1;
        let s_h = max(select_point2_y, select_point1_y) - s_y + 1;

        rect(s_x * box_w, s_y * box_w, s_w * box_w, s_h * box_w);
        // pop();
        fill(255);
    }
    frameRate(mFrameRate);
}
let mFrameRate = 100;

let myCanvas_brush;
let myCanvas_brush_map;
function draw_brushes() {
    
    myCanvas_brush = new Array();
    myCanvas_brush_map = new Array();
    $.getJSON("./brush/brushes.json", function (data) {
        // console.log("1");
        var i = 0;
        $.each(data, function (h, info) {

            $("#brushes_bar").find("tr").append("" +
            "<td class='mBrush' " +
            "style='text-align:center;vertical-align:middle; padding-left: 10px;padding-right: 10px;'>" +
            "<div align='center' style='width:100%;height:80px '>" +
            "<div id='mBrush" + i + "'" +
            ' style="width: 80px; height: 80px;margin-left: 10px;margin-right: 10px; border: 1px solid rgb(182,182,182);">' +
            "</div>" +
            "</div>" +
            info["name"] +
            "</td>" +
            "");
            // if(i>)

            myCanvas_brush[i] = createGraphics(80, 80);
            myCanvas_brush[i].parent("mBrush" + i);
            if (info.hasOwnProperty("RLE")) {
                let this_brush = RLEtoJson(info["RLE"]);
                myCanvas_brush_map[i] = this_brush["points"];
                myCanvas_brush_map[i].unshift(this_brush["size"]);
                // console.log(myCanvas_brush_map[i]);
            } else {
                let len = info["points"].length;
                myCanvas_brush_map[i] = new Array(len + 1);
                myCanvas_brush_map[i][0] = info["size"];
                for (let p = 0; p < len; p++) {
                    myCanvas_brush_map[i][p + 1] = info["points"][p];
                }
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
            if (max(myCanvas_brush_map[i][0][0], myCanvas_brush_map[i][0][1]) > 8) {
                little_box_w = parseFloat(77 / max(myCanvas_brush_map[i][0][0], myCanvas_brush_map[i][0][1]));
                // console.log(little_box_w);
                myCanvas_brush[i].noStroke();
            } else {
                little_box_w = 10;
            }
            let dx = parseInt(40 / little_box_w - myCanvas_brush_map[i][0][0] / 2);
            let dy = parseInt(40 / little_box_w - myCanvas_brush_map[i][0][1] / 2);


            for (let j = 1; j < myCanvas_brush_map[i].length; j++) {
                myCanvas_brush[i].square((dx + myCanvas_brush_map[i][j][0]) * little_box_w, (dy + myCanvas_brush_map[i][j][1]) * little_box_w, little_box_w);
            }
        }
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
        
        isOperating = true;
        $(".mBrush").eq(0).click();
        isOperating = false;
        // move=true;
        

    });

}

let start_cal = false;
let block_group;
let block_group_next;
let black_block_group = new Array();
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
        //     for (let j = 0; j < block_group[i].length; j++) {

        //         book[i][j] = 0;
        //         block_group_next[i][j] = 0;
        //     }
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


function adjust_IW() {
    if (frameRate() < 20) {
        ignoreWhite *= 1.1;
        // ignoreWhite_block+=2;
        blur_w += 2;
    } else if (frameRate() < 30) {
        ignoreWhite *= 1.1;
        // ignoreWhite_block+=1;
        // blur_w += 1;
        if (blur_w % 2 == 1) {
            blur_w += 1;
        }
    } else if (frameRate() < 45) {
        ignoreWhite *= 1.1;
        // blur_w += 1;
        if (blur_w % 2 == 1) {
            // blur_w += 1;
        }
    }

}
let blur_w = 1;
let ignoreWhite = 0;
let ignoreWhite_block = 0;
let aIW_DT = 1000;
let sum_aIW_DT = 0;
let draw_book;
let blur_debug = false;
function draw_blocks() {
    // return;
    if (!blur_debug) {
        // pixelDensity(1.0);
        sum_aIW_DT += deltaTime;
        if (sum_aIW_DT >= aIW_DT) {
            sum_aIW_DT = 0;
            if (d > 7000) {
                blur_w = 3;
                ignoreWhite_block=1;
                ignoreWhite = 0.8;
                adjust_IW();
            } else if (d > 3500) {
                blur_w = 3;
                ignoreWhite_block=0;
                ignoreWhite = 0.7;
                adjust_IW();
            } else if (d > 1800) {
                blur_w = 1;
                // ignoreWhite_block = 4;
                ignoreWhite = 0.7;
                adjust_IW();
            } else if (d > 1000) {
                blur_w = 1;
                ignoreWhite_block=0;
                ignoreWhite = 0.9;
            } else {
                blur_w = 1;
                ignoreWhite = 0;
            }
        }



    }



    draw_book = new Array(block_group.length);
    for (let i = 0; i < block_group.length; i++) {
        draw_book[i] = new Array(block_group[i].length);
        for (let j = 0; j < block_group[i].length; j++) {
            draw_book[i][j] = 0;
        }
    }

    let draw_d = (-20 - box_w * 2) * (d / init_d);
    let right_draw_d = (w + 5) * (d / init_d);
    let bottom_draw_d = (h + (5)) * (d / init_d);
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
    //画网格
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
    next_drawBlockDY = sum_drawBlockDY + drawBlockDY;

    // if(next_drawBlockDY>parseInt(map_h)){
    //     next_drawBlockDY=parseInt(map_h);

    // }
    // fill(255,255,255,100);
    rect(0, 0, map_w * box_w, map_h * box_w);
    // console.log(sum_drawBlockDY,next_drawBlockDY);
    fill(0);
    // strokeWeight(5);
    noStroke();
    // fill(0);
    // console.log(sum_drawBlockDY,next_drawBlockDY);
    let new_blur_map = new Array(parseInt(map_h / blur_w + 1));
    let new_blur_book = new Array(parseInt(map_h / blur_w + 1));
    for (let i = 0; i < new_blur_map.length; i++) {
        new_blur_map[i] = new Array(parseInt(map_w / blur_w + 1));
        new_blur_book[i] = new Array(parseInt(map_w / blur_w + 1));
    }
    for (let j = 0; j < map_h; j += blur_w) {
        for (let i = 0; i < map_w; i += blur_w) {
            let draw_x = blur_w;
            let draw_y = blur_w;
            let black = 0;

            //画出相机视角内的黑块
            let blockX_in_camera = i * box_w - p_x;
            let blockY_in_camera = j * box_w - p_y;
            if (!(draw_d <= blockX_in_camera &&
                blockX_in_camera <= right_draw_d &&
                draw_d <= blockY_in_camera &&
                blockY_in_camera <= bottom_draw_d)) {
                continue;
            }

            // console.log("123");
            // console.log(draw_book[j][i],draw_book[j][i]);

            if (blur_w >= 2) {
                let black = 0;
                for (let small_y = 0; small_y < blur_w; small_y++) {
                    for (let small_x = 0; small_x < blur_w; small_x++) {
                        if (isInRange_LcRo(j + small_y, 0, map_h, i + small_y, 0, map_w)
                        ) {
                            if (block_group[j + small_y][i + small_y] == 1) {
                                black++;
                            }
                            // draw_book[j+small_y][i+small_y]=1;
                        }
                    }
                }
                if (black / (blur_w * blur_w) > (1 - ignoreWhite)) {
                    new_blur_map[parseInt(j / blur_w)][parseInt(i / blur_w)] = 1;
                }
            } else {
                if (block_group[j][i] == 1) {

                    try {
                        new_blur_map[j][i] = 1;
                    } catch (err) {
                        console.log(j, i);
                    }
                }

            }

            //     // rect(i * box_w, j * box_w, black * box_w, black * box_w);
            //     if(black>0){
            //         fill(200-200*black/(blur_w*blur_w));
            //         // rect(i * box_w, j * box_w, black * box_w, black * box_w);
            //         // rect(i * box_w, j * box_w, (black/blur_w+1) * box_w, (black/blur_w+1) * box_w);
            //         square(i * box_w, j * box_w, blur_w * box_w);
            //     }

            //     i+=blur_w-1;

            // } else
            // draw_blocks_in_square(map);
            //blur_w<2

        }
        // if (blur_w >= 2) {
        //     j += blur_w - 1;
        // }
    }
    draw_blocks_in_square(new_blur_map, new_blur_book, blur_w, p_x, p_y, draw_d, right_draw_d, bottom_draw_d);
    // if(next_drawBlockDY==parseInt(map_h)){
    //     sum_drawBlockDY=0;
    // }else{
    //     sum_drawBlockDY=next_drawBlockDY;
    // }
    fill(255);
    // strokeWeight(1);
}
function draw_blocks_in_square(block_group, draw_book, blur_w, p_x, p_y, draw_d, right_draw_d, bottom_draw_d) {
    let map_h = block_group.length;
    let map_w = block_group[0].length;
    let draw_y = 1;
    let draw_x = 1;
    let black = 0;
    for (let j = 0; j < map_h; j++) {
        for (let i = 0; i < map_w; i++) {
            draw_y = 1;
            draw_x = 1;
            let has_black = false;
            let rightwhite = 0;
            let ignoreWhite_sum = 0;
            let ignoreWhite_1 = 0;
            // console.log(j,i);
            try {
                if (block_group[j][i] != 1 ||
                    draw_book[j][i] == 1) {
                    // console.log(draw_book[j][i],draw_book[j][i]);
                    continue;
                }
            } catch (err) {
                console.log(j, i);
            }

            // console.log("123");
            for (let blur_y = 0; blur_y < draw_y; blur_y++) {
                if (j + blur_y >= map_h) {
                    break;
                }
                has_black = false;
                // black=0;
                for (let blur_x = 0; blur_x < draw_x; blur_x++) {
                    if (i + blur_x >= map_w) {
                        draw_x--;
                        continue;
                    }
                    // console.log("y: "+(j + blur_y)+"x: "+(i + blur_x),draw_book[j + blur_y][i + blur_x],block_group[j + blur_y][i + blur_x]);
                    if (draw_book[j + blur_y][i + blur_x] != 1) {
                        if (block_group[j + blur_y][i + blur_x] == 1) {
                            has_black = true;
                            black++;
                            rightwhite = 0;
                        } else {
                            rightwhite++;
                        }
                    }
                }
                if (blur_y < draw_y - 1) {
                    continue;
                }
                let Xblack = 0;
                let Yblack = 0;
                let tempWhite = 0;
                // if(draw_x==1 && draw_y==1){
                draw_x++;
                draw_y++;
                // }

                //最右边
                for (let new_blur_y = 0; new_blur_y < draw_y - 1; new_blur_y++) {
                    if (j + new_blur_y >= map_h || i + draw_x - 1 >= map_w) {
                        // draw_y--;
                        continue;
                    }
                    if (draw_book[j + new_blur_y][i + draw_x - 1] != 1 &&
                        block_group[j + new_blur_y][i + draw_x - 1] == 1) {
                        Xblack++;
                    }
                }
                //最下面
                for (let new_blur_x = 0; new_blur_x < draw_x - 1; new_blur_x++) {
                    if (i + new_blur_x >= map_w || j + draw_y - 1 >= map_h) {
                        // draw_y--;
                        continue;
                    }
                    try {
                        if (draw_book[j + draw_y - 1][i + new_blur_x] != 1 &&
                            block_group[j + draw_y - 1][i + new_blur_x] == 1) {
                            Yblack++;
                        }
                    } catch (err) {
                        console.log(j + draw_y - 1, i + new_blur_x);
                    }

                }
                // console.log("before draw_x:" + draw_x, " draw_y:" + draw_y);
                // console.log("Xblack:" + Xblack, " Yblack:" + Yblack);
                if ((Xblack / draw_y) > (Yblack / draw_x)) {
                    //右边多

                    // tempWhite = draw_x - Yblack - 1;
                    // if (j + draw_y - 1 < map_h && i + draw_x - 1 < map_w && block_group[j + draw_y - 1][i + draw_x - 1] == 1) {
                        tempWhite = draw_y - Xblack-1;
                    // } else {
                    //     tempWhite = draw_y - Xblack -1 ;
                    // }

                    // draw_x++;
                    if (draw_y > 1) {
                        draw_y--;
                    }
                    if ((ignoreWhite_sum+1)  < ignoreWhite_block){
                        ignoreWhite_sum++;
                        if (draw_y > 1) {
                            draw_y++;
                        }
                    }


                    // console.log("x+");
                    blur_y = -1;
                } else if ((Xblack / draw_y) < (Yblack / draw_x)) {

                    // tempWhite = draw_y - Xblack - 1;
                    //计算把x缩回后的白块
                    // if (j + draw_y - 1 < map_h && i + draw_x - 1 < map_w && block_group[j + draw_y - 1][i + draw_x - 1] == 1) {
                        tempWhite = draw_x - Yblack-1;
                    // } else {
                        // tempWhite = draw_x - Yblack-1 ;
                    // }
                    // draw_y++;
                    if (draw_x > 1) {
                        draw_x--;
                    }
                    if ((ignoreWhite_sum+1)  < ignoreWhite_block){
                        ignoreWhite_sum++;
                        if (draw_x > 1) {
                            draw_x--;
                        }
                    }

                    // console.log("y+");
                    blur_y = -1;
                } else if (Xblack > 0 && Yblack > 0) {

                    tempWhite = draw_x + draw_y - Yblack - Xblack;
                    if (j + draw_y - 1 < map_h && i + draw_x - 1 < map_w) {
                        if (block_group[j + draw_y - 1][i + draw_x - 1] != 1) {
                            tempWhite--;
                        }
                        else {
                            tempWhite -= 2;
                        }
                    }

                    if(tempWhite > 0){
                        // if (ignoreWhite_sum+1>ignoreWhite_block &&
                        //      j + draw_y - 1 < map_h && i + draw_x - 1 < map_w &&
                        //      ){

                        // }
                                if(draw_y-1==Xblack){
                                    draw_y--;
                                    tempWhite=0;
                                }else if(draw_x-1==Yblack){
                                    draw_x--;
                                    tempWhite=0;
                                }

                        // }
                    
                    }
                    
                    // if ((ignoreWhite_sum+1)  < ignoreWhite_block){
                    //     ignoreWhite_sum++;
                    //     if (draw_x > 1) {
                    //         draw_x--;
                    //     }
                    // }

                    blur_y = -1;
                    // console.log("x+y+");
                }
                if (tempWhite > 0) {
                    ignoreWhite_sum += 1;
                }
                // ignoreWhite_sum += tempWhite;
                // console.log(" draw_x:" + draw_x, " draw_y" + draw_y);
                // console.log("tempWhite:" + tempWhite);
                // console.log(ignoreWhite_sum);
                if (ignoreWhite_sum  > ignoreWhite_block) {
                    // if ((ignoreWhite_sum / (draw_y * draw_x)) > ignoreWhite) {
                    if ((Xblack / draw_y) > (Yblack / draw_x)) {
                        //右边多
                        if (draw_x > 1) {
                            draw_x -= 1;
                        }

                        // console.log("x-2");
                        // draw_x--;

                    } else if ((Xblack / draw_y) < (Yblack / draw_x)) {
                        // draw_y--;
                        if (draw_y > 1) {
                            draw_y -= 1;
                        }
                        // console.log("y-2");
                    } else {
                        if (draw_x > 1 && draw_y > 1) {
                            draw_x -= 1;
                            draw_y -= 1;
                        }
                        
                        // console.log("x-1y-1");
                    }
                    break;
                }
                if (Xblack + Yblack == 0) {
                    //全是白
                    if (draw_x > 1 && draw_y > 1) {
                        draw_x--;
                        draw_y--;
                    }
                    // console.log("x-y-");
                    break;
                }
                // let blockX_in_camera = (i + draw_x) * box_w - p_x;
                // let blockY_in_camera = (j + draw_y) * box_w - p_y;
                // if (!(draw_d <= blockX_in_camera &&
                //     blockX_in_camera <= right_draw_d &&
                //     draw_d <= blockY_in_camera &&
                //     blockY_in_camera <= bottom_draw_d)) {
                //     break;
                // }
                black = 0;
                // if (lineblack >= (draw_x)) {
                //     draw_y++;
                // }

            }
            //book
            for (let blur_y = 0; blur_y < draw_y; blur_y++) {
                if (j + blur_y >= map_h) {
                    break;
                }
                for (let blur_x = 0; blur_x < draw_x; blur_x++) {
                    if (i + blur_x >= map_w) {
                        draw_x--;
                        continue;
                    }
                    draw_book[j + blur_y][i + blur_x] = 1;

                }

            }
            // console.log("i:" + i + " j:" + j + " draw_x:" + draw_x, " draw_y" + draw_y);
            //fill(255 * random((i / map_w)), 255 - 200 * random((i / map_w)), 255 - random(255 * (black / (draw_x * draw_y))));
            fill(150 - 150 * (black-ignoreWhite_block/ (draw_x * draw_y)));
            rect(i * blur_w * box_w, j * blur_w * box_w, draw_x * blur_w * box_w, draw_y * blur_w * box_w);
        }
    }

    // noStroke();
    // let nx = parseInt(mouseX_in_camera / box_w);
    // let ny = parseInt(mouseY_in_camera / box_w);



    // if (block_group[j][i] == 1) {

    //fill(255 - 200*random((i/map_w)), 255 - 200*random((i/map_w)), 255 - random(255 * (black / (draw_x * draw_y))));
    // console.log(255/((draw_x*draw_y)-black/(draw_x*draw_y)));
    // rect(i * box_w, j * box_w, draw_x * box_w, draw_y * box_w);
    // if(blur_w>=2){
    //     rect(i * box_w, j * box_w, (black/draw_y+1.5) * box_w, (black/draw_x+1.5) * box_w);
    // }else{

}

function mousePressed(event) {
    // console.log(event);
    // return false;
}

function mouseClicked(event) {
    // console.log("click123");
    // console.log(menuOpen);
    // console.log(event);
    // console.log(isOperating,menuOpen ,brushCreating);
    if (isOperating || menuOpen || brushCreating) {
        menuOpen = false;
        return;
    }
    if (select_show) {
        select_show = false;
        return;
    }

    // console.log("5555");
    if (
        0 <= mouseX && mouseX <= w_c &&
        0 <= mouseY && mouseY <= h_c) {
        let d = $("#mainSize").val();
        let mouseX_in_camera = (mouseX - (w / 2)) * (d / init_d) + dx - (map_border * 2) * (d / init_d);
        let mouseY_in_camera = (mouseY - (h / 2)) * (d / init_d) + dy - (map_border * 2) * (d / init_d);

        let nx = parseInt(mouseX_in_camera / box_w);
        let ny = parseInt(mouseY_in_camera / box_w);
        let brush_points = brush.length - 1;
        let r_x = parseInt(brush[0][0] / 2);
        let r_y = parseInt(brush[0][1] / 2);
        // for (let j = 0; j <= map_h; j++) {
        //     for (let i = 0; i <= map_w; i++) {
        // if (isInRange_LcRo(nx,0,w,ny)
        // i * box_w < mouseX_in_camera &&
        // mouseX_in_camera < i * box_w + box_w &&
        // j * box_w < mouseY_in_camera &&
        // mouseY_in_camera < j * box_w + box_w) {
        // if (block_group[j][i] == 1) {
        //     block_group[j][i] = 0;
        // } else {

        // console.log()
        for (let br = 1; br <= brush_points; br++) {
            // console.log(br);

            if (0 <= nx + (brush[br][0] - r_x) &&
                nx + (brush[br][0] - r_x) < map_w &&
                0 <= ny + (brush[br][1] - r_y) &&
                ny + (brush[br][1] - r_y) < map_h) {
                // console.log(br);
                // console.log("y:" + new_y + (brushbr][1] - r_y) + " x:" + new_x + (brush[br][0] - r_x));
                block_group[ny + (brush[br][1] - r_y)][nx + (brush[br][0] - r_x)] = panValue;

                for (let this_block in black_block_group) {
                    if (this_block[0] == ny + (brush[br][1] - r_y) && this_block[1] == nx + (brush[br][0] - r_x)) {
                        if (panValue == 0) {

                        }
                    }
                }
            }
        }
        // block_group[j][i] = 1;
        // }

        // }
        // noStroke();ddddddddddd
        //     }
        // }
        pre_mouseDraw_x = parseInt(mouseX_in_camera / box_w);
        pre_mouseDraw_y = parseInt(mouseY_in_camera / box_w);

        return false;
    }

}

function _mouseHover() {
    if (isOperating || select_show || menuOpen || brushCreating || !isInRange_LcRo(mouseX, 0, w_c, mouseY, 0, h_c)) {
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

    // console.log(w);
    if (mouseIsPressed &&
        press == false &&
        0 < mouseX && mouseX < w_c &&
        0 < mouseY && mouseY < h_c) {
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
        // console.log("123e");
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
            // console.log(new_mouseX,pre_mouseX,w_c,h_c);
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
        isOperating = true;
        // console.log(select_point1_x,select_point1_y);
    } else if (mouseIsPressed && select_start) {
        let mouseX_in_camera = (mouseX - (w / 2)) * (d / init_d) + dx - (map_border * 2) * (d / init_d);
        let mouseY_in_camera = (mouseY - (h / 2)) * (d / init_d) + dy - (map_border * 2) * (d / init_d);
        let nx = parseInt(mouseX_in_camera / box_w);
        let ny = parseInt(mouseY_in_camera / box_w);
        if (isInRange_LcRo(nx, 0, map_w, ny, 0, map_w)) {
            select_point2_x = nx;
            select_point2_y = ny;
        }
        select_show = true;
    } else if (!mouseIsPressed) {
        select_start = false;
        isOperating = false;
    }
}

let pressMouseRight = false;
function _mouseOperation() {
    if (!keyIsDown(68) && !keyIsDown(83) && mouseButton === LEFT) {
        _moveMap();
    } else if (keyIsDown(83) && mouseButton === LEFT) {
        selectBlocks();
    } else if (keyIsDown(68) && mouseButton === LEFT) {
        drawing();
    }
    if (mouseButton === RIGHT) {
        pressMouseRight = true;
    } else {
        pressMouseRight = false;
    }
    // console.log(keyCode);
}

let menuOpen = false;
function mouseReleased() {
    if (pressMouseRight &&
        isInRange_LcRo(mouseX, 0, w, mouseY, 0, h)) {
        $("#menu").show();
        $("#menu").offset(
            {
                "top": winMouseY + $(document).scrollTop(),
                "left": winMouseX + 5
            }
        );
        menuOpen = true;
        return false;
    } else {
        $("#menu").hide();

    }
}
let brushCreating = false;
let brush_name = "未知";
let brush_author = "未知";
function createBrush() {
    let selected_w = abs(select_point2_x - select_point1_x) + 1;
    let selected_h = abs(select_point2_y - select_point1_y) + 1;
    let new_brush = { "name": "", "author": "", "size": [], "points": [] };
    new_brush["name"] = brush_name;
    new_brush["author"] = brush_author;
    new_brush["size"] = [selected_w, selected_h];

    // let new_brush="{\"name\":\""+brush_name+"\","+
    //             "\"author\":\""+brush_author+"\","+
    //             "\"size\":["+selected_w+","+selected_h+"],";
    let new_brush_points = new Array();
    let new_brush_points_num = 0;

    let startY = min(select_point1_y, select_point2_y);
    let endY = max(select_point1_y, select_point2_y);
    let startX = min(select_point1_x, select_point2_x);
    let endX = max(select_point1_x, select_point2_x);
    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            if (block_group[y][x] == 1) {
                new_brush_points.push(new Array(x - startX, y - startY));

            }
        }
    }
    new_brush["points"] = new_brush_points;
    let new_brush_str = JSON.stringify(new_brush, null, "\t");
    new_brush_str = new_brush_str.replace(/\[\n\t+(\d+)/g, "[$1");
    new_brush_str = new_brush_str.replace(/,\n\t+(\d+)/g, ",$1");
    new_brush_str = new_brush_str.replace(/(\d+)\n\t+]/g, "$1]");
    console.log(new_brush_str);


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

function rotate_brush() {
    let new_brush = new Array(brush, length);
    for (let i = 0; i < brush.length; i++) {
        new_brush[i] = new Array(2);
        new_brush[i][0] = brush[i][0];
        new_brush[i][1] = brush[i][1];
    }
    new_brush[0][0] = brush[0][1];
    new_brush[0][1] = brush[0][0];
    for (let i = 1; i < brush.length; i++) {
        new_brush[i][0] = -brush[i][1] + brush[0][1] - 1;
        new_brush[i][1] = brush[i][0];
    }
    brush = new_brush;
}
function flip_brush(option) {
    let new_brush = new Array(brush, length);
    for (let i = 0; i < brush.length; i++) {
        new_brush[i] = new Array(2);
        new_brush[i][0] = brush[i][0];
        new_brush[i][1] = brush[i][1];
    }
    switch (option) {
        case 0: { //水平翻转
            for (let i = 1; i < brush.length; i++) {
                new_brush[i][0] = brush[0][0] - brush[i][0] - 1;
            }
            break;
        }
        case 1: {
            for (let i = 1; i < brush.length; i++) {
                new_brush[i][1] = brush[0][1] - brush[i][1] - 1;
            }
            break;
        }
    }
    // print(new_brush);
    brush = new_brush;
}

function keyTyped() {
    if (key === 'r') {
        rotate_brush();
    } else if (key === 'z') {
        flip_brush(0);
    } else if (key === 'x') {
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

function RLEtoJson(RLETEXT) {
    var s = RLETEXT;
    var temp = "";
    var start_p = 0;
    var next_p = 0;
    var now_dx = 0;
    var now_dy = 0;
    let new_brush = { "name": "", "author": "", "size": [], "points": [] };
    let brush_size = new Array(2);
    let new_brush_points = new Array();
    // s = RLETEXT;
    function find_xy(match, p1, p2, offset, string) {
        if (p1 == "x") {
            brush_size[0] = parseInt(p2);
        } else if (p1 == "y") {
            brush_size[1] = parseInt(p2);
        }
        return "";
    }

    s = s.replace(/#(\w) [^\|\f\n\r\t\v]+[\n|(\|\s) ]/g, "");
    s = s.replace(/([x|y]) = (\d+)/g, find_xy);
    s = s.replace(/rule = ([b|B]\d+)\/([s|S]\d+)/, "");
    s = s.replace(/\|/g, "");
    new_brush["size"] = brush_size;
    function find_ob(match, p1, p2, offset, string) {
        if (p2 == "o") {
            var mStep = 1;
            if (p1 != '') {
                mStep = parseInt(p1);
            }
            for (var i = now_dx; i < now_dx + mStep; i++) {
                new_brush_points.push(new Array(i, now_dy));
            }
            now_dx += mStep;

        } else {
            // console.log("now_dx:"+now_dx+" p1:"+p1);
            if (p1 != '') {

                now_dx += parseInt(p1);

            } else {
                now_dx += 1;
            }
        }
        return "";
    }

    next_p = s.search(/[\$|!]/);
    var step = brush_size[1] + 2;
    while (s.search(/([o|b])/) >= 0 && step--) {
        temp = s.slice(start_p, next_p);
        temp = temp.replace(/(\d*)([o|b])/g, find_ob);
        if (!isNaN(parseInt(temp))) {
            now_dy += parseInt(temp);
        } else {
            now_dy++;
        }
        now_dx = 0;
        s = s.slice(next_p + 1);


        next_p = s.search(/[\$|!]/);
    }
    new_brush["points"] = new_brush_points;
    return new_brush;
    // let new_brush_str = JSON.stringify(new_brush, null, "\t");
    // new_brush_str = new_brush_str.replace(/\[\n\t+(\d+)/g, "[$1");
    // new_brush_str = new_brush_str.replace(/,\n\t+(\d+)/g, ",$1");
    // new_brush_str = new_brush_str.replace(/(\d+)\n\t+]/g, "$1]");
    // new_brush_str
}