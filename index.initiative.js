// 采用主动回复的方式接入微信公众号
const express = require('express');
const app = express();
app.use(express.json());
const request = require('request');
const {PORT = 8800} = process.env;

const {sendInitiativeMsg, resLlmMsg} = require('./util');

app.post('/', async (req, res) => {
    console.log('/消息推送', req.body);
    res.send('success');
});
app.all('/chat', async (req, res) => {
    const appid = req.headers['x-wx-from-appid'] || '';
    console.log(appid, '/chat消息推送', req.body)
    const {ToUserName, FromUserName, MsgType, CreateTime, Content} = req.body
    if (MsgType === 'text') {
        const result = await resLlmMsg(Content);
        await sendInitiativeMsg(appid, {
            touser: FromUserName,
            msgtype: 'text',
            text: {content: result}
        });
        res.send('success');
    }
    else {
        res.send({
            ToUserName: FromUserName,
            FromUserName: ToUserName,
            CreateTime: CreateTime,
            MsgType: 'text',
            Content: '暂不支持其他类型'
        });
    }
});

app.listen(PORT, function(){
    console.log('服务启动成功！')
});
