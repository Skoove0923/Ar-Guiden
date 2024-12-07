<template>
    <body>
    <div class="box">
        <div class="header">用户登录</div>
        <div id="username">*账号：<input type="text" placeholder="请输入账号"></div>
        <div id="password">*密码：<input type="password" placeholder="请输入密码"></div>
        <div id="Vercode">*验证码：<input type="text" placeholder="请输入验证码"></div>
        <div id="VerCodePhoto"><img src="" alt="示例图片" width="300" height="200"> <a href="#"> 看不清？换一张</a></div>
        <div id="SubButton"><button>登录</button> <a href="#" id="regist">点击注册</a></div>
    </div>
    </body>
</template>

<script>

</script>

<style>
*{
    padding: 0;
    margin: 15px auto;
}
body{
    background-color: rgb(193, 93, 150);
}
.box{
    margin-top: 100px;
    background-color:white;
    width: 400px;
    height: 450px;
    opacity: 0.7;
    border-radius: 10px}

.header {
    text-align: center;
    margin-bottom: 30px;
    padding-top: 30px;
    font-size: 18px;
}
#username,
#password,
#Vercode {
    text-align: center;
    margin-top: 5px;
}

span {
    color: red;
}

input {
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 5px;
}

#VerCodePhoto{
    text-align: center;
}
#VerCodePhoto img {
    width: 100px;
    height: auto;
    margin-right: 10px;
}

#VerCodePhoto a {
    color: blue;
    text-decoration: none;
}

#SubButton button {
    text-align: center;
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
}
#SubButton{
    text-align: center; 
}
#SubButton a {
    text-align: center;
    color: blue;
    text-decoration: none;
}
</style>