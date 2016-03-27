var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.send('<h1>Welcome Realtime Server</h1>');
});

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;
//游戏排队用户
var onlinePlayer = {};
//排队人数
var playerCount = 0;
//
var matchList = {};

var matchCount = 0;


io.on('connection', function(socket) {
    console.log('a user connected');

    //监听新用户加入
    socket.on('login', function(obj) {
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.userid;

        //检查在线列表，如果不在里面就加入
        if (!onlineUsers.hasOwnProperty(obj.userid)) {
            onlineUsers[obj.userid] = obj.username;
            //在线人数+1
            onlineCount++;
        }

        //向所有客户端广播用户加入
        io.emit('login', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj });
        console.log(obj.username + '加入了聊天室');
    });

    //监听用户加入游戏队列
    socket.on('playerJoin', function(obj) {
        socket.name = obj.userid; //获取加入游戏队列用户名字
        //检查队列中列表，如果不在里边就加入
        if (!onlinePlayer.hasOwnProperty(obj.userid)) {
            onlinePlayer[obj.userid] = obj.username;
            playerCount++;
        }
        //向所有客户端广播用户排队
        io.emit('playerJoin', { onlinePlayer: onlinePlayer, playerCount: playerCount, user: obj });
        console.log(obj.username + '加入了游戏队列');
    });

    //监听用户参加比赛
    socket.on('matchJoin', function(obj) {
        socket.name = obj.userid; //获取参赛者名字
        //检查队列中列表，如果不在里边就加入
        if (!matchList.hasOwnProperty(obj.userid)) {
            matchList[obj.userid] = obj.username;
            matchCount++;
        }
        //向所有客户端广播用户参赛
        io.emit('matchJoin', { matchList: matchList, matchCount: matchCount, user: obj });
        console.log(obj.username + '参加了比赛');
    });

    //监听比赛实况
    socket.on('match', function(obj) {
            socket.name = obj.userid;
            //判断是否是参赛者中发来的信息
        
        //向所有客户端广播游戏实况
        io.emit('match', { matchList: matchList, matchCount: matchCount, user: obj }); console.log(obj.username + '游戏实况');
    });

//监听用户退出比赛
socket.on('matchExit', function(obj) {
    socket.name = obj.userid;
    if (!matchList.hasOwnProperty(obj.userid)) {
        matchList[obj.userid] = obj.username;
        matchCount++;
    }
    io.emit('matchExit', { matchList: matchList, matchCount: matchCount, user: obj });
    console.log(obj.username + '退出了比赛');
});

//监听用户退出游戏队列
socket.on('playerExit', function() {
    if (onlinePlayer.hasOwnProperty(socket.name)) {
        var obj = { userid: socket.name, username: onlinePlayer[socket.name] };
        delete onlinePlayer[socket.name];
        playerCount--;
        io.emit('playerExit', { onlinePlayer: onlinePlayer, playerCount: playerCount, user: obj });
        console(obj.username + '退出了游戏队列');
    }
});

//监听用户退出
socket.on('disconnect', function() {
    // 检查将退出用户的排队和比赛删除
    //将退出的用户从在线列表中删除
    if (onlineUsers.hasOwnProperty(socket.name)) {
        //退出用户的信息
        var obj = { userid: socket.name, username: onlineUsers[socket.name] };

        //删除
        delete onlineUsers[socket.name];
        //在线人数-1
        onlineCount--;

        //向所有客户端广播用户退出
        io.emit('logout', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj });
        console.log(obj.username + '退出了聊天室');
    }
});

//监听用户发布聊天内容
socket.on('message', function(obj) {
    //向所有客户端广播发布的消息
    io.emit('message', obj);
    console.log(obj.username + '说：' + obj.content);
});


});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
