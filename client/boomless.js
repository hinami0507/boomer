(function() {


    var d = document,
        w = window,
        doc = document.getElementById("doc-box"),
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
        screenheight: w.innerHeight ? w.innerHeight : dx.clientHeight,
        username: null,
        userid: null,
        socket: null,
        //让浏览器滚动条保持在最低部
        scrollToBottom: function() {
            //w.scrollTo(0, this.msgObj.clientHeight);
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
            html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
            html += '</div>';
            var section = d.createElement('section');
            section.className = 'wordbox';
            section.innerHTML = html;
            this.msgObj.appendChild(section);
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
        // init: function(username) {
        //     /*
        //     客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
        //     实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
        //     */
        //     this.userid = this.genUid();
        //     this.username = username;

        //     d.getElementById("showusername").innerHTML = this.username;
        //     //this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
        //     this.scrollToBottom();

        //     //连接websocket后端服务器
        //     this.socket = io.connect('ws://demo.hxz.im:3000');

        //     //告诉服务器端有用户登录
        //     this.socket.emit('login', { userid: this.userid, username: this.username });

        //     //监听新用户登录
        //     this.socket.on('login', function(o) {
        //         CHAT.updateSysMsg(o, 'login');
        //     });

        //     //监听用户退出
        //     this.socket.on('logout', function(o) {
        //         CHAT.updateSysMsg(o, 'logout');
        //     });

        //     //监听消息发送
        //     this.socket.on('message', function(obj) {
        //         var isme = (obj.userid == CHAT.userid) ? true : false;
        //         var contentDiv = '<div>' + obj.content + '</div>';
        //         var usernameDiv = '<span>' + obj.username + '</span>';

        //         var section = d.createElement('section');
        //         if (isme) {
        //             section.className = 'user';
        //             section.innerHTML = contentDiv + usernameDiv;
        //         } else {
        //             section.className = 'service';
        //             section.innerHTML = usernameDiv + contentDiv;
        //         }
        //         CHAT.msgObj.appendChild(section);
        //         CHAT.scrollToBottom();
        //     });

        // }
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
})();


function creatbomb(role,x,y,r){
	this.

	var bombeTime = setTimeout(function(){
			boomshakala();
		}
	,5000)
}


function createPlayer(userid, role) {
    	this.role = "p"+role,
        this.speed = 7,
        this.bombCount = 1,
        this.bombRange = 1,
        p1.setAttribute("x", 50);
        p1.setAttribute("y", 50);
    this.addSpeed = function() {
        this.speed++;
    };
    this.addbombCount = function() {
        this.bombCount++;
    };
    this.addbombRange = function() {
        this.bombRange++;
    };

    this.move = function(tar) { 
        switch (tar) {
            case 37:
    			p1.setAttribute("x",p1.x.baseVal.value-this.speed); //左
                break;	
            case 38:
    			p1.setAttribute("y",p1.y.baseVal.value-this.speed);//下
                break;
            case 39:
    			p1.setAttribute("x",p1.x.baseVal.value+this.speed);//有
                break;
            case 40:
    			p1.setAttribute("y",p1.y.baseVal.value+this.speed);//上
                break;
            default:break;
        }
    }
    this.placedbomb = function(){
    	this.bombCount--;
    	var thebome = new creatbomb(this.role, p1.x.baseVal.value, p1.y.baseVal.value, this.bombRange);
    }
}

var d = document;
p1 = document.getElementById("p1");
var player1 = new createPlayer(1, 1);

d.addEventListener('keydown', function(event) {
    var key;
    if (event.charCode) { key = event.charCode; } else { key = event.keyCode; };
    if(key==37||key==38||key==39||key==40)
    {player1.move(key);}
	if(key==32)
	{}
    console.log(key);


});
