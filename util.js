
const request = require('request');
const API = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/plugin/3pyn7rz4zmzdffp7/?access_token=';
const {AK, SK} = process.env;

function safeParseJSON(str) {
    try {
        let ret = JSON.parse(str);
        if (ret === null) {
            return {};
        }
        return ret;
    } catch (e) {
        return {};
    }
}

async function baiduBot(content) {
    if (content) {
        console.time('init')
        const access_token = await getAccessToken();
        console.timeEnd('init');
        const options = {
            method: 'POST',
            url: API + access_token,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: content.trim(),
                plugins: ['uuid-zhishiku'],
                verbose: true,
                llm: {
                    temperature: 0.7,
                    top_p: 1,
                    max_output_tokens: 400
                }
            })
        };
        return new Promise((resolve, reject) => {
            try {
                request(options, (error, response) => {
                    if (error) {
                        reject({result: '服务繁忙，稍后回复'});
                    }
                    else {
                        const ret = safeParseJSON(response.body);
                        console.log('ret', ret);
                        ret && ret.result && resolve(safeParseJSON(response.body));
                    }
                })
            } catch (error) {
                reject({result: '服务繁忙，稍后回复'});
            }
        })
    }
}

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
function getAccessToken() {
    const options = {
        method: 'POST',
        url: [
            'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials',
            `&client_id=${AK}`,
            `&client_secret=${SK}`
        ].join('')
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(JSON.parse(response.body).access_token);
            }
        })
    })
}

function resDefMsg4s() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('小书虫思考中🤔, 请5秒后发送1查看回复');
        }, 4000);
    });
}

function resLlmMsg(text, cacheKey, cacheMap) {
    return new Promise(async (resolve, reject) => {
        const {result} = await baiduBot(text);
        if (result) {
            resolve(result);
            if (cacheKey && cacheMap) {
                cacheMap[cacheKey] = result;
            }
        }
        else {
            reject(0);
        }
    });
}

// 使用主动回复 发送回复消息
function sendInitiativeMsg(appid, mess) {
    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
            body: JSON.stringify(mess)
        }, function (error, response) {
            if (error) {
                console.log('接口返回错误', error)
                reject(error.toString())
            } else {
                console.log('接口返回内容', response.body)
                resolve(response.body)
            }
        })
    })
}

module.exports = {
    baiduBot,
    safeParseJSON,
    resDefMsg4s,
    resLlmMsg,
    sendInitiativeMsg
}

