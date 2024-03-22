// 采用主动回复的方式接入微信公众号， 需要公司认证过的账户才能调用 暂时先放弃
const express = require('express');
const app = express();
app.use(express.json());
const request = require('request');
const {PORT = 8800} = process.env;

const {sendInitiativeMsg, resLlmMsg} = require('./util');

app.post('/chat', async (req, res) => {
    console.log('/消息推送', req.body);
    res.send('success');
});

app.all('/', async (req, res) => {
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
            Content: '暂不支持非文字类信息回复'
        });
    }
});

app.listen(PORT, function(){
    console.log('initiative msg service is running')
});
