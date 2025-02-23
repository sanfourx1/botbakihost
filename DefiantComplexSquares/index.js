require('dotenv').config(); // Load .env variables

const { Client } = require('discord.js-selfbot-v13');
const client = new Client({
    checkUpdate: false
});

const OWNER_ID = process.env.OWNER_ID;
const AUTO_REACT_IDS = (process.env.AUTO_REACT_IDS || '').split(',').filter(id => id);

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    // Set initial status
    try {
        client.user.setActivity('by mamouni_1xp', { type: 'LISTENING' });
        console.log('✅ Status set: by mamouni_1xp');
    } catch (error) {
        console.error('Error setting status:', error);
    }
});

// Update status when the owner joins a voice channel
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.member.id === OWNER_ID && newState.channelId) {
        try {
            await client.user.setActivity(`In ${newState.channel.name}`, { type: 'LISTENING' });
            console.log(`✅ Joined ${newState.channel.name} with owner`);
        } catch (error) {
            console.error('Failed to update voice channel status:', error);
        }
    } else if (oldState.member.id === OWNER_ID && !newState.channelId) {
        await client.user.setActivity('Listening to your commands!', { type: 'LISTENING' });
        console.log('✅ Left voice channel and reset status');
    }
});

// List of automatic replies
const autoReplies = {
    "mamouni1xp": "ax baghi akhona",
};

// Store user-emoji pairs
const userEmojis = new Map();
const defaultEmoji = "<:Logo_team_spirit:1201067260089991178>";

client.on('messageCreate', async (message) => {
    if (message.author.id === client.user.id) return;

    // Auto-react to specified IDs
    if (message.author.id === OWNER_ID || AUTO_REACT_IDS.includes(message.author.id)) {
        await message.react('🫦');
    }

    // Auto-reply based on specific keywords
    for (const [trigger, reply] of Object.entries(autoReplies)) {
        if (message.content.toLowerCase().includes(trigger)) {
            await message.reply(reply);
        }
    }

    // Auto-react to specific users
    if (userEmojis.has(message.author.id)) {
        await message.react(userEmojis.get(message.author.id));
    }

    // Auto-reply if mentioned
    if (message.mentions.has(client.user)) {
        await message.reply(`${message.author.tag} 3endek ratakel ma3endekx maratakelx`);
    }
});

// Commands for managing user-emoji list
client.on('messageCreate', async (message) => {
    if (message.author.id !== OWNER_ID) return;

    if (message.content.startsWith('!zidd')) {
        const user = message.mentions.users.first();
        const customEmoji = message.content.split(' ')[2] || defaultEmoji;

        if (user) {
            userEmojis.set(user.id, customEmoji);
            await message.channel.send(`✅ تمت إضافة ${user.tag} مع الايموجي ${customEmoji}`);
        } else {
            await message.channel.send("⚠️ لم يتم تحديد المستخدم.");
        }
    }

    if (message.content.startsWith('!kherej')) {
        const user = message.mentions.users.first();
        if (user && userEmojis.has(user.id)) {
            userEmojis.delete(user.id);
            await message.channel.send(`❌ تمت إزالة ${user.tag} من قائمة التفاعل التلقائي.`);
        } else {
            await message.channel.send("⚠️ هذا المستخدم غير موجود في القائمة.");
        }
    }

    if (message.content.startsWith('!lista')) {
        if (userEmojis.size === 0) {
            await message.channel.send("⚠️ لا يوجد مستخدمون في قائمة التفاعل التلقائي.");
        } else {
            const userList = Array.from(userEmojis.entries())
                .map(([userId, emoji]) => `<@${userId}> → ${emoji}`);
            await message.channel.send(`✅ قائمة المستخدمين وايموجياتهم:\n` + userList.join("\n"));
        }
    }
});

// Custom responses & owner mention handling
let ownerTagResponse = "hawa sidi baki jay l3endek";
let ownerMentionEnabled = true;

client.on('messageCreate', async (message) => {
    if (message.author.id === client.user.id) return;

    if (message.content.startsWith('!jaweb') && message.author.id === OWNER_ID) {
        const newResponse = message.content.slice('!jaweb'.length).trim();
        if (newResponse) {
            ownerTagResponse = newResponse;
            await message.reply(`✅ تم تغيير الرد إلى: ${newResponse}`);
        } else {
            await message.reply("⚠️ الرجاء كتابة الرد الجديد. مثال: !jaweb مشغول حاليا");
        }
    }

    if (message.content === '!toggle_mention' && message.author.id === OWNER_ID) {
        ownerMentionEnabled = !ownerMentionEnabled;
        await message.reply(`✅ Owner mention responses are now ${ownerMentionEnabled ? 'enabled' : 'disabled'}`);
    }

    // Handle mentions for specific user
    const TARZAN_ID = '554749455669264394';
    if (message.mentions.has(TARZAN_ID)) {
        await message.reply('be3doli men le9reyed dyali 🚫');
    }

    // Handle owner mention
    if (message.mentions.has(OWNER_ID) && ownerMentionEnabled) {
        await message.reply(ownerTagResponse);
    }
});

// Log in using the token from .env
client.login(process.env.DISCORD_TOKEN);
