require('dotenv').config({
    path: './.env'
});
const {
    Telegraf,
    Markup
} = require('telegraf'); // importing telegraf.js
const axios = require('axios'); //For making http requests
const express = require('express'); //For web app to keep the bot alive
const app = express();
app.get("/", (request, response) => {
    response.send("Bot is running!!!");
});

const UNSPLASH_API = process.env.UNSPLASH_API; //Unsplash Client ID
const PIXABAY_API = process.env.PIXABAY_API
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.command(['start', 'help'], (ctx) => {
    let message = `š Welcome to *Inline Image Search Bot*!\n\nā­ Use the below method to search images from unsplash.com and pixabay.com.\n\n*š¢ Unsplash Image Search Example:*\n\n @InlineImageSearcherBot u <query>\n\n*š¢ Pixabay Image Search Example:*\n\n @InlineImageSearcherBot p <query>\n\nMore are coming soon...\n\n*š ļø Owner:* @mirrorxbots\n*š§ Father:* @bipuldey19`;
    ctx.reply(message, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'š Search Unsplash Images',
                    switch_inline_query_current_chat: `u ` 
                }],
                [{
                    text: 'š Search Pixabay Images',
                    switch_inline_query_current_chat: `p `
                }]
            ]
        },
        parse_mode: 'Markdown'
    })

})

bot.inlineQuery(['start','help'], ctx =>{
    let message = `š Welcome to *Inline Image Search Bot*!\n\nā­ Use the below method to search images from unsplash.com and pixabay.com.\n\n*š¢ Unsplash Image Search Example:*\n\n @InlineImageSearcherBot u <query>\n\n*š¢ Pixabay Image Search Example:*\n\n @InlineImageSearcherBot p <query>\n\nMore are coming soon...\n\n*š ļø Owner:* @mirrorxbots\n*š§ Father:* @bipuldey19`;
    let results = [
        {
            type: 'article',
            id: '1',
            title: 'Help Reference',
            input_message_content: {
                message_text: message,
                parse_mode: 'Markdown'
            },
            description: 'Sends help message on how to use the bot',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'š Search Unsplash Images',
                        switch_inline_query_current_chat: `u ` 
                    }],
                    [{
                        text: 'š Search Pixabay Images',
                        switch_inline_query_current_chat: `p `
                    }]
                ]
            }
        }
    ]
    ctx.answerInlineQuery(results)
})

// Unsplash Image Search
bot.inlineQuery(/u\s.+/, async (ctx) => {
    let input = ctx.inlineQuery.query.split(' ');
    input.shift();
    let query = input.join(' ');
    let res = await axios.get(`https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_API}`);

    let results = res.data.results.map((item, index) => {
        return {
            type: 'photo',
            id: String(index),
            photo_url: item.urls.regular,
            thumb_url: item.urls.thumb,
            photo_width: item.width,
            photo_height: item.height,
            caption: "*š¼ļø Image Info:*\n\nš Description: *" + item.description +
                "\n*š· Author: *" + "[" + item.user.name + "](" + item.user.links.html + ")\n\n" +
                "*š¢ Raw Image URL:*\n`" + item.urls.raw + "`\n\n" +
                "*š¢ Samll Cdn Image URL:*\n`" + item.urls.small_s3 + "`",
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'ā¬ļø Download',
                        url: `${item.links.download}`
                    }]
                ]
            }
        }
    })
    ctx.answerInlineQuery(results)
})

// Pixabay Image Search
bot.inlineQuery(/p\s.+/, async (ctx) => {
    let input = ctx.inlineQuery.query.split(' ');
    input.shift();
    let query = input.join(' ');
    let res = await axios.get(`https://pixabay.com/api/?key=${PIXABAY_API}&q=${query}&per_page=50`);
    let data = res.data.hits;

    let results = data.map((item, index) => {
        return {
            type: 'photo',
            id: String(index),
            photo_url: item.webformatURL,
            thumb_url: item.previewURL,
            photo_width: item.webformatWidth,
            photo_height: item.webformatHeight,
            caption: "*š¼ļø Image Info:*\n\n*š Tags: *" + item.tags +
                "\n*š· Author: *" + "[" + item.user + "](https://pixabay.com/users/" + item.user + "-" + item.user.id + "/)\n\n" +
                "*š¢ Web Format Image URL:*\n`" + item.webformatURL + "`\n\n" +
                "*š¢ Large Image URL:*\n`" + item.largeImageURL + "`",
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'ā¬ļø Download',
                        url: `${item.pageURL}`
                    }]
                ]
            }
        }
    })
    ctx.answerInlineQuery(results)
})


bot.launch()

app.listen(80);