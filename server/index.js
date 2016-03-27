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
var playerList = [];
//排队人数
var playerCount = 0;
//参赛者名单
var matchList = [];
//参赛人数
var matchCount = 0;
//一场比赛同时进行的人数
var comp =2;
var ready=0; //准备人数

function exisPlayer(id) {
    var resultPlayer = playerList.some(function(item, index, array) {
        return (item == id);
    });
    if(resultPlayer)
    	{return true;}
    else
    	{return false;}
}

function exisMatch(id) {
    var resultMatch = matchList.some(function(item, index, array) {
        return (item == id);
    });
    if(resultMatch)
    	{return true;}
    else
    	{return false;}
}


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

        //检查用户是否在排队或者已经参赛，如果不在里边就加入
        if (exisPlayer(obj.id)&&exisMatch(obj.id)) {
            playerList.push(obj.userid); //加入该用户id
        }
        //向所有客户端广播用户排队
        io.emit('playerJoin', { playerList: playerList, playerCount: playerList.length, user: obj });
    });

    //监听用户参加比赛
    socket.on('matchJoin', function(obj) {
        if (playerList.length > 0 && matchList.length <= 2) //如果有人排队，并且参赛者人数未满，
        {
            matchList.pop(playerList.shift()); //取出排队排在前的用户放到matchList中
            io.emit('matchJoin', { matchList: matchList }); //向所有客户端广播用户参赛
            console.log(obj.username + '参加了比赛');
        }
    });

    socket.on('matchReady', function(obj) {
            if(exisMatch(obj.id))
            {
            	ready++;
            }
            if(ready==comp)
            {
            	socket.emit("match");
            	console.log("游戏开始！");
            	ready=0;
            }
        })
        //监听比赛实况
    socket.on('match', function(obj) {
        if (obj.id==matchList[0]) {     //检测0号参赛者发来的操作数,广播其操作
        	io.emit('match', {player:1,move:obj.move})
        }
        if(obj.id == matchList[1]){     //检测1号参赛者发来的操作数,广播其操作
        	io.emit('match', {player:2,move:obj.move})
        }
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
        if (playerList.hasOwnProperty(socket.name)) {
            var obj = { userid: socket.name, username: playerList[socket.name] };
            delete playerList[socket.name];
            playerCount--;
            io.emit('playerExit', { playerList: playerList, playerCount: playerCount, user: obj });
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
