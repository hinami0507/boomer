// (function() {


var d = document,
    w = window,
    doc = document.getElementById("doc-box"),
    game = document.getElementById("game-msg"),
    g = document.getElementById("gamebox"),
    gm = document.getElementById("map"),
    p1 = document.getElementById("p1"),
    p = parseInt,
    dd = d.documentElement,
    db = d.body,
    dc = d.compatMode == 'CSS1Compat',
    dx = dc ? dd : db,
    ec = encodeURIComponent;

w.CHAT = {
    msgObj: d.getElementById("message"),
    gameMsg: d.getElementById("game-msg"),
    screenheight: w.innerHeight ? w.innerHeight : dx.clientHeight,
    username: null,
    userid: null,
    gameinput: null,
    socket: null,
    //让浏览器滚动条保持在最低部
    scrollToBottom: function() {
        //w.scrollTo(0, this.msgObj.clientHeight);
        game.scrollTop = game.clientHeight;
        doc.scrollTop = doc.clientHeight;
    },
    //退出，本例只是一个简单的刷新
    logout: function() {
        //this.socket.disconnect();
        location.reload();
    },
    //提交聊天消息内容
    submit: function() {
        var content = d.getElementById("content").value;
        if (content != '') {
            var obj = {
                userid: this.userid,
                username: this.username,
                content: content
            };
            this.socket.emit('message', obj);
            d.getElementById("content").value = '';
        }
        return false;
    },
    genUid: function() {
        return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
    },
    //更新系统消息，本例中在用户加入、退出的时候调用
    updateSysMsg: function(o, action) {
        //当前在线用户列表
        var onlineUsers = o.onlineUsers;
        //当前在线人数
        var onlineCount = o.onlineCount;
        //新加入用户的信息
        var user = o.user;

        //更新在线人数
        var userhtml = '';
        var separator = '';
        for (key in onlineUsers) {
            if (onlineUsers.hasOwnProperty(key)) {
                userhtml += separator + onlineUsers[key];
                separator = '、';
            }
        }
        d.getElementById("onlinecount").innerHTML = '当前共有 ' + onlineCount + ' 人在线，在线列表：' + userhtml;

        //添加系统消息
        var html = '';
        html += '<div class="msg-system">';
        html += user.username;
        html += ":"+action;
        html += '</div>';
        var section = d.createElement('section');
        section.className = 'wordbox';
        section.innerHTML = html;
        this.msgObj.appendChild(section);
        this.scrollToBottom();
    },
    upGameSysMsg: function(o, action) {
        //当前在线用户列表
        var onlinePlayer = o.onlinePlayer;
        //当前在线人数
        var playerCount = o.playerCount;
        //新加入用户的信息
        var user = o.user;

        //更新在线人数
        var userhtml = '';
        var separator = '';
        for (key in onlinePlayer) {
            if (onlinePlayer.hasOwnProperty(key)) {
                userhtml += separator + onlinePlayer[key];
                separator = '、';
            }
        }
        d.getElementById("onlinecount").innerHTML = '当前共有 ' + playerCount + ' 人在线，在线列表：' + userhtml;

        //添加系统消息
        var html = '';
        html += '<div class="msg-system">';
        html += user.username;
        html += ":"+action;
        html += '</div>';
        var section = d.createElement('section');
        section.className = 'wordbox';
        section.innerHTML = html;
        this.gameMsg.appendChild(section);
        this.scrollToBottom();
    },
    //第一个界面用户提交用户名
    usernameSubmit: function() {
        var username = d.getElementById("username").value;
        if (username != "") {
            d.getElementById("username").value = '';
            d.getElementById("loginbox").style.display = 'none';
            d.getElementById("room").style.display = 'block';
            this.init(username);
        }
        return false;
    },
    //申请排队
    playerJoinFn: function() { //
        var obj = {
            userid: this.userid,
            username: this.username
        };
        this.socket.emit('playerJoin', obj);
        this.socket.emit('matchJoin');
        return false;
    },
    

    match: function(move) {
        if (nowinput != ''&& this.userid) {
            var obj = {
                id: this.userid,
                move: move
            };
            this.socket.emit('match', obj);
        }
        return false;
    },



        init: function(username) {
        /*
        客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
        实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
        */
        this.userid = this.genUid();
        this.username = username;

        d.getElementById("showusername").innerHTML = this.username;
        //this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
        this.scrollToBottom();

        //连接websocket后端服务器
        //this.socket = io.connect('ws://localhost:3000/');
        this.socket = io.connect('ws://sock.hxz.im:3000');

        //告诉服务器端有用户登录
        this.socket.emit('login', { userid: this.userid, username: this.username });

        //监听新用户登录
        this.socket.on('login', function(o) {
            CHAT.updateSysMsg(o, 'login');
        });
        //监听用户加入游戏队列
        this.socket.on('playerJoin', function(o) {
            CHAT.upGameSysMsg(o, 'playerJoin');
        });
        //监听用户参赛
        this.socket.on('matchJoin', function(o) {
            CHAT.upGameSysMsg(o, 'matchJoin');
        });
        //监听用户游戏实况
        this.socket.on('match', function(o) {
            if(o.player==1)
            	player1.move(o.move);
            if(o.player==2)
            	player2.move(o.move);
        });
        //监听用户退出比赛
        this.socket.on('matchExit', function(o) {
            CHAT.upGameSysMsg(o, 'matchExit');
        });
        //监听用户退出游戏队列
        this.socket.on('playerExit', function(o) {
            CHAT.upGameSysMsg(o, 'playerExit');
        });
        //监听用户退出
        this.socket.on('logout', function(o) {
            CHAT.updateSysMsg(o, 'logout');
        });

        //监听消息发送
        this.socket.on('message', function(obj) {
            var isme = (obj.userid == CHAT.userid) ? true : false;
            var contentDiv = '<div>' + obj.content + '</div>';
            var usernameDiv = '<span>' + obj.username + '</span>';

            var section = d.createElement('section');
            if (isme) {
                section.className = 'user';
                section.innerHTML = contentDiv + usernameDiv;
            } else {
                section.className = 'service';
                section.innerHTML = usernameDiv + contentDiv;
            }
            CHAT.msgObj.appendChild(section);
            CHAT.scrollToBottom();
        });

    }
};

//通过“回车”提交用户名
d.getElementById("username").onkeydown = function(e) {
    e = e || event;
    if (e.keyCode === 13) {
        CHAT.usernameSubmit();
    }
};
//通过“回车”提交信息
d.getElementById("content").onkeydown = function(e) {
    e = e || event;
    if (e.keyCode === 13) {
        CHAT.submit();
    }
};
d.onkeydown = function(e) {
    e = e || event;
    if (e.keyCode) {
        CHAT.match(e.keyCode);
    }
};





var game = {
    "p1": {
        width: 100,
        speed: 20,
        x: 390,
        y: 150,
        boundary: {
            l: 0,
            u: 0,
            r: 0,
            d: 0
        }
    },
    "p2": {
        width: 100,
        speed: 20,
        x: 390,
        y: 600,
        boundary: {
            l: 0,
            u: 380,
            r: 900,
            d: 740
        }
    }
}

var p1 = document.getElementById("p1");
var p2 = document.getElementById("p2");
var table = document.getElementById("gamebox");

function createBall(x, y, dx, dy, speed) {
    this.ball = document.getElementById("ball");
    this.ball.cx = x;
    this.ball.cy = y;
    this.x = this.ball.cx;
    this.y = this.ball.cy;
    this.dx = dx;
    this.dy = dy;
    this.spe = speed;
    this.attach = function(x, y) {
        this.ball.cx.baseVal.value = x;
        this.ball.cy.baseVal.value = y;
    }
    this.impact = function() {
        if (this.y == player1.y && this.x >= player1.x && this.x <= player1.x + player1.width)
            return true;
        if (this.y == player2.y && this.x >= player2.x && this.x <= player2.x + player2.width)
            return true;
    }
    this.ballMove = function() {
        this.x = this.ball.cx.baseVal.value + this.dx * this.spe;
        this.y = this.ball.cy.baseVal.value + this.dy * this.spe;
        this.ball.cx.baseVal.value = this.x;
        this.ball.cy.baseVal.value = this.y;
        if (this.x > table.clientWidth || this.x < 0) { this.dx = -this.dx; }
        if (this.y > table.clientHeight || this.y < 0 || this.impact()) { this.dy = -this.dy; }
    }
}


var myball = new createBall(50, 50, 1, -1, 5);








function createPlayer(userid, role, pos) {
    this.player = document.getElementById("p" + role);
    this.date = eval("game.p" + role);
    this.speed = this.date.speed;
    this.width = this.date.width;
    this.player.setAttribute("width", this.width);
    this.player.setAttribute("x", this.date.x);
    this.player.setAttribute("y", this.date.y);
    this.x = this.player.x.baseVal.value;
    this.y = this.player.y.baseVal.value;
    this.catball = 1;
    this.addSpeed = function() {
        this.speed++;
    };
    this.addWidth = function() {
        this.width += 20;
        this.player.setAttribute("width", this.width);
    }
    this.catchball = function(x, y) {
        myball.attach(x, y);
    }
    this.throwBall = function() {
        var stopmove = setInterval("myball.ballMove()", 20);
    }
    this.move = function(tar) {
        this.x = this.player.x.baseVal.value;
        this.y = this.player.y.baseVal.value;
        if (this.catball == 1) { this.catchball(this.x, this.y); }
        switch (tar) {
            case 37:
                if (this.x > this.date.boundary.l) {
                    this.player.setAttribute("x", this.x - this.speed);
                }; //左
                break;
            case 38:
                if (this.y > this.date.boundary.u) {
                    this.player.setAttribute("y", this.y - this.speed);
                }; //上
                break;
            case 39:
                if (this.x < this.date.boundary.r) {
                    this.player.setAttribute("x", this.x + this.speed);
                }; //右
                break;
            case 40:
                if (this.y < this.date.boundary.d) {
                    this.player.setAttribute("y", this.y + this.speed);
                }; //下
                break;
            case 32:
                if (this.catball == 1) {
                    this.throwBall();
                    this.catball = 0;
                }
                break;
            default:
                break;
        }
    }
}

var player1 = new createPlayer(1, 1, "up");
var player2 = new createPlayer(2, 2, "down");

